import os
import pandas as pd
from tempfile import NamedTemporaryFile
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Add the current directory to the Python path to handle imports
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Import the financial report generator
from tools.Tool_1_Financial_Report_Generator import generate_financial_report

# Import the personalized financial advisor
from tools.personalized_financial_advisor import (
    process_financial_document,
    get_financial_advice,
    update_user_preferences
)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Ensure the reports directory exists
os.makedirs("reports", exist_ok=True)
os.makedirs("reports/charts", exist_ok=True)

@app.route('/')
def root():
    return jsonify({"message": "Finance RAG Application Server is running"})

@app.route('/generate-stock-report', methods=['POST'])
def generate_stock_report():
    """Generate a financial report for a stock symbol."""
    try:
        data = request.get_json()
        symbol = data.get('symbol')
        data_type = data.get('data_type', 'organization')
        
        if not symbol:
            return jsonify({"error": "Stock symbol is required"}), 400
            
        report_path = generate_financial_report(
            data_source=symbol,
            data_type=data_type
        )
        return jsonify({"success": True, "report_path": report_path})
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

@app.route('/generate-data-report', methods=['POST'])
def generate_data_report():
    """Generate a financial report from JSON data."""
    try:
        data = request.get_json()
        financial_data = data.get('data')
        data_type = data.get('data_type', 'individual')
        
        if not financial_data:
            return jsonify({"error": "Financial data is required"}), 400
            
        # Convert the JSON data to a DataFrame
        df = pd.DataFrame(financial_data)
        report_path = generate_financial_report(
            data_source=df,
            data_type=data_type
        )
        return jsonify({"success": True, "report_path": report_path})
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

@app.route('/upload-file-report', methods=['POST'])
def upload_file_report():
    """Generate a financial report from an uploaded file (CSV, Excel, JSON)."""
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        data_type = request.form.get('data_type', 'individual')
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        if file:
            filename = secure_filename(file.filename)
            file_ext = os.path.splitext(filename)[1].lower()
            
            if file_ext not in ['.csv', '.xlsx', '.xls', '.json']:
                return jsonify({"error": "Unsupported file format"}), 400
                
            # Create a temporary file to store the uploaded content
            with NamedTemporaryFile(delete=False, suffix=file_ext) as temp_file:
                file.save(temp_file.name)
                temp_path = temp_file.name

            # Generate the report from the file
            report_path = generate_financial_report(
                data_source=temp_path,
                data_type=data_type
            )

            # Clean up the temporary file
            os.unlink(temp_path)
            
            return jsonify({"success": True, "report_path": report_path})
    except Exception as e:
        return jsonify({"error": f"Error generating report: {str(e)}"}), 500

@app.route('/reports/<filename>')
def get_report(filename):
    """Download a generated report file."""
    file_path = f"reports/{filename}"
    if not os.path.isfile(file_path):
        return jsonify({"error": "Report file not found"}), 404
    return send_file(file_path, as_attachment=True)

@app.route('/reports/charts/<filename>')
def get_chart(filename):
    """Download a generated chart file."""
    file_path = f"reports/charts/{filename}"
    if not os.path.isfile(file_path):
        return jsonify({"error": "Chart file not found"}), 404
    return send_file(file_path, as_attachment=True)

@app.route('/example')
def run_example():
    """Run the example reports for testing."""
    try:
        # Example 1: Individual data
        sample_individual_data = pd.DataFrame({
            'period': ['Jan', 'Feb', 'Mar', 'Apr'],
            'revenue': [10000, 12000, 9500, 15000],
            'expenses': [8000, 7500, 8200, 9000]
        })
        individual_report = generate_financial_report(sample_individual_data, "individual")
        
        # Example 2: Organizational data (stock symbol)
        org_report = generate_financial_report("AAPL", "organization")
        
        return jsonify({
            "success": True, 
            "individual_report": individual_report,
            "organization_report": org_report
        })
    except Exception as e:
        return jsonify({"error": f"Error running example: {str(e)}"}), 500

@app.route('/process-document', methods=['POST'])
def process_document_api():
    try:
        user_id = request.form.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        if 'file' not in request.files:
            return jsonify({"error": "No file part"}), 400
            
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
            
        # Save uploaded file - FIXED PATH HERE
        document_path = f"data/documents/{user_id}/{secure_filename(file.filename)}"
        os.makedirs(os.path.dirname(document_path), exist_ok=True)
        file.save(document_path)
        
        # Process document
        result = process_financial_document(document_path, user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Error processing document: {str(e)}"}), 500

@app.route('/get-advice', methods=['POST'])
def get_advice_api():
    try:
        data = request.get_json()
        query = data.get('query')
        user_id = data.get('user_id')
        document_path = data.get('document_path')
        
        if not query or not user_id:
            return jsonify({"error": "Query and user_id are required"}), 400
        
        # Call financial advisor with document context
        response = get_financial_advice(query, user_id, document_path)
        
        return jsonify({
            "response": response,
            "sources": []  # Add source extraction logic if needed
        })
    except Exception as e:
        return jsonify({"error": f"Error getting advice: {str(e)}"}), 500

@app.route('/update-preferences', methods=['POST'])
def update_preferences_api():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        preferences = data.get('preferences')
        
        if not user_id or not preferences:
            return jsonify({"error": "User ID and preferences are required"}), 400
            
        updated_profile = update_user_preferences(user_id, preferences)
        return jsonify({"profile": updated_profile})
    except Exception as e:
        return jsonify({"error": f"Error updating preferences: {str(e)}"}), 500

@app.route('/user-files', methods=['GET'])
def user_files_api():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "User ID is required"}), 400
        
        # Look in multiple possible directories
        document_paths = [
            f"data/documents/{user_id}",
            f"data/chat_documents/{user_id}",
            f"data/uploaded_files/{user_id}"
        ]
        
        files = []
        for path in document_paths:
            if os.path.exists(path):
                for file_name in os.listdir(path):
                    file_path = os.path.join(path, file_name)
                    if os.path.isfile(file_path):
                        files.append({
                            "id": file_path,  # Use full path as ID
                            "name": file_name
                        })
                
        return jsonify({"files": files})
    except Exception as e:
        return jsonify({"error": f"Error listing user files: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)



