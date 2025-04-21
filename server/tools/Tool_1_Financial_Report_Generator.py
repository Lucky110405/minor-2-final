import matplotlib
matplotlib.use('Agg')    # Set non-interactive backend - must be before importing pyplot
import yfinance as yf
import pandas as pd
import matplotlib.pyplot as plt
from langgraph.graph import StateGraph, END
from typing import TypedDict, Dict, Any, Optional
from datetime import datetime
import os
from fpdf import FPDF
import json
from uuid import uuid4
from models.llm import OpenRouterLLM

# Define the state to track data through the workflow
class FinancialState(TypedDict):
    data_source: Any  # File path, DataFrame, or stock symbol
    data_type: str  # "individual" or "organization"
    raw_data: Optional[pd.DataFrame]
    stock_data: Optional[Dict[str, Any]]
    financial_metrics: Optional[Dict[str, Any]]
    analysis: Optional[str]
    charts_paths: Optional[Dict[str, str]]
    report_path: Optional[str]

class FinancialReportGenerator:
    def __init__(self):
        """Initialize the financial report generator."""
        self.data = None
        self.is_stock_data = False
    
    def load_data(self, source, data_type: str):
        """Load financial data from various sources."""
        self.is_stock_data = False
        if isinstance(source, str) and data_type == "organization":
            # Assume stock symbol for organizational data
            self.is_stock_data = True
            ticker = yf.Ticker(source)
            hist = ticker.history(period="1mo")
            stock_data = {
                "latest_price": hist["Close"].iloc[-1],
                "avg_price": hist["Close"].mean(),
                "volume": hist["Volume"].mean(),
                "history": hist[["Close", "Volume"]]
            }
            info = ticker.info
            self.data = {
                "symbol": source,
                "stock_data": stock_data,
                "financial_metrics": {
                    "pe_ratio": info.get("trailingPE", "N/A"),
                    "revenue": info.get("totalRevenue", "N/A"),
                    "debt_to_equity": info.get("debtToEquity", "N/A"),
                    "profit_margin": info.get("profitMargins", "N/A")
                }
            }
        elif isinstance(source, str):
            # File-based data
            if source.endswith('.csv'):
                self.data = pd.read_csv(source)
            elif source.endswith('.xlsx'):
                self.data = pd.read_excel(source)
            elif source.endswith('.json'):
                with open(source, 'r') as f:
                    self.data = pd.DataFrame(json.load(f))
        elif isinstance(source, pd.DataFrame):
            self.data = source
        else:
            raise ValueError("Unsupported data source. Use CSV, Excel, JSON, DataFrame, or stock symbol.")
        return self
    
    def calculate_metrics(self):
        """Calculate key financial metrics."""
        if self.data is None:
            raise ValueError("No data loaded.")
        
        if self.is_stock_data:
            return self.data["financial_metrics"]
        
        metrics = {
            "total_revenue": self.data.get('revenue', self.data.get('income', pd.Series(0))).sum(),
            "total_expenses": self.data.get('expenses', pd.Series(0)).sum(),
            "net_income": 0,
            "profit_margin": 0,
        }
        
        if "revenue" in self.data and "expenses" in self.data:
            metrics["net_income"] = metrics["total_revenue"] - metrics["total_expenses"]
            if metrics["total_revenue"] > 0:
                metrics["profit_margin"] = (metrics["net_income"] / metrics["total_revenue"]) * 100
        
        return metrics
    
    def create_charts(self, output_dir="reports/charts"):
        """Generate financial charts and save them."""
        if self.data is None:
            raise ValueError("No data loaded.")
        
        os.makedirs(output_dir, exist_ok=True)
        charts_paths = {}
        
        if self.is_stock_data:
            # Stock price trend chart
            plt.figure(figsize=(10, 6))
            plt.plot(self.data["stock_data"]["history"].index, self.data["stock_data"]["history"]["Close"], marker='o', label='Close Price')
            plt.title(f'Stock Price Trend for {self.data["symbol"]}')
            plt.xlabel('Date')
            plt.ylabel('Price ($)')
            plt.grid(True)
            plt.legend()
            chart_path = f"{output_dir}/stock_price_trend.png"
            plt.savefig(chart_path)
            plt.close()
            charts_paths['stock_price_trend'] = chart_path
        else:
            # Revenue vs Expenses chart
            if all(col in self.data.columns for col in ['period', 'revenue', 'expenses']):
                plt.figure(figsize=(10, 6))
                plt.plot(self.data['period'], self.data['revenue'], marker='o', label='Revenue')
                plt.plot(self.data['period'], self.data['expenses'], marker='x', label='Expenses')
                plt.title('Revenue vs Expenses')
                plt.xlabel('Period')
                plt.ylabel('Amount ($)')
                plt.grid(True)
                plt.legend()
                chart_path = f"{output_dir}/revenue_expenses_chart.png"
                plt.savefig(chart_path)
                plt.close()
                charts_paths['revenue_expenses'] = chart_path
        
        return charts_paths
    
    def generate_pdf_report(self, metrics, analysis, charts_paths, output_path="reports/financial_report.pdf"):
        """Generate a PDF financial report."""
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        pdf = FPDF()
        pdf.add_page()
        
        # Title
        pdf.set_font("Arial", "B", 16)
        title = f"Financial Report ({'Organization' if self.is_stock_data else 'Individual'})"
        pdf.cell(0, 10, title, ln=True, align="C")
        pdf.ln(5)
        
        # Date
        pdf.set_font("Arial", "I", 10)
        pdf.cell(0, 10, f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
        pdf.ln(10)
        
        # Key Metrics
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Key Financial Metrics", ln=True)
        pdf.ln(2)
        
        pdf.set_font("Arial", "", 10)
        for key, value in metrics.items():
            formatted_key = " ".join(word.capitalize() for word in key.split("_"))
            if isinstance(value, (int, float)):
                value_text = f"${value:,.2f}"
            else:
                value_text = str(value)
            
            # Sanitize text for Latin-1 encoding
            safe_key = formatted_key.encode('latin-1', 'replace').decode('latin-1')
            safe_value = value_text.encode('latin-1', 'replace').decode('latin-1')
            pdf.cell(0, 8, f"{safe_key}: {safe_value}", ln=True)

        
        # Analysis
        pdf.ln(10)
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Financial Analysis", ln=True)
        pdf.set_font("Arial", "", 10)
        
        # Sanitize analysis text
        safe_analysis = analysis.encode('latin-1', 'replace').decode('latin-1')
        pdf.multi_cell(0, 8, safe_analysis)

        # Charts
        if charts_paths:
            pdf.add_page()
            pdf.set_font("Arial", "B", 12)
            pdf.cell(0, 10, "Financial Charts", ln=True)
            pdf.ln(5)
            
            for chart_name, chart_path in charts_paths.items():
                if os.path.exists(chart_path):
                    pdf.image(chart_path, x=10, y=pdf.get_y(), w=190)
                    pdf.ln(100)
        
        pdf.output(output_path)
        return output_path

# LangGraph Nodes
def load_data_node(state: FinancialState) -> FinancialState:
    generator = FinancialReportGenerator()
    generator.load_data(state["data_source"], state["data_type"])
    state["raw_data"] = generator.data
    state["stock_data"] = generator.data["stock_data"] if generator.is_stock_data else None
    state["financial_metrics"] = generator.calculate_metrics()
    return state

def analyze_data_node(state: FinancialState) -> FinancialState:
    # 

    llm = OpenRouterLLM(api_key=os.getenv("OPENROUTER_GEMMA_API_KEY"), temperature=0.1)
    prompt = f"""
    You are a financial analyst. Analyze the following financial data:
    Data Type: {state["data_type"]}
    Financial Metrics: {state["financial_metrics"]}
    {'Stock Data: ' + str(state["stock_data"]) if state["stock_data"] else ''}
    Provide a comprehensive analysis (200-300 words) highlighting key trends, strengths, weaknesses, and recommendations.
    """
    analysis = llm(prompt)
    state["analysis"] = analysis
    return state

def generate_charts_node(state: FinancialState) -> FinancialState:
    generator = FinancialReportGenerator()
    generator.data = state["raw_data"]
    generator.is_stock_data = state["data_type"] == "organization"
    charts_paths = generator.create_charts()
    state["charts_paths"] = charts_paths
    return state

def generate_report_node(state: FinancialState) -> FinancialState:
    generator = FinancialReportGenerator()
    generator.data = state["raw_data"]
    generator.is_stock_data = state["data_type"] == "organization"
    report_path = generator.generate_pdf_report(
        metrics=state["financial_metrics"],
        analysis=state["analysis"],
        charts_paths=state["charts_paths"]
    )
    state["report_path"] = report_path
    return state

# Define the LangGraph workflow
def build_workflow():
    workflow = StateGraph(FinancialState)
    
    workflow.add_node("load_data", load_data_node)
    workflow.add_node("analyze_data", analyze_data_node)
    workflow.add_node("generate_charts", generate_charts_node)
    workflow.add_node("generate_report", generate_report_node)
    
    workflow.add_edge("load_data", "analyze_data")
    workflow.add_edge("analyze_data", "generate_charts")
    workflow.add_edge("generate_charts", "generate_report")
    workflow.add_edge("generate_report", END)
    
    workflow.set_entry_point("load_data")
    
    return workflow.compile()

# Main function to run the tool
def generate_financial_report(data_source: Any, data_type: str) -> str:
    if data_type not in ["individual", "organization"]:
        raise ValueError("data_type must be 'individual' or 'organization'")
    
    workflow = build_workflow()
    initial_state = FinancialState(
        data_source=data_source,
        data_type=data_type,
        raw_data=None,
        stock_data=None,
        financial_metrics=None,
        analysis=None,
        charts_paths=None,
        report_path=None
    )
    result = workflow.invoke(initial_state)
    return result["report_path"]

# Example usage
if __name__ == "__main__":
    # Example 1: Individual data (DataFrame)
    sample_individual_data = pd.DataFrame({
        'period': ['Jan', 'Feb', 'Mar', 'Apr'],
        'revenue': [10000, 12000, 9500, 15000],
        'expenses': [8000, 7500, 8200, 9000]
    })
    report_path = generate_financial_report(sample_individual_data, "individual")
    print(f"Individual report generated at: {report_path}")
    
    # Example 2: Organizational data (stock symbol)
    report_path = generate_financial_report("AAPL", "organization")
    print(f"Organizational report generated at: {report_path}")