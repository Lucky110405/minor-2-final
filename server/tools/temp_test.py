import yfinance as yf

source = "AAPL"
ticker = yf.Ticker(source)
hist = ticker.history(period="1mo")
stock_data = {
	"latest_price": hist["Close"].iloc[-1],
	"avg_price": hist["Close"].mean(),
	"volume": hist["Volume"].mean(),
	"history": hist[["Close", "Volume"]]
}
# info = ticker.info
data = {
	"symbol": source,
	"stock_data": stock_data,
    # "info": info,
	# "financial_metrics": {
	# 	"pe_ratio": info.get("trailingPE", "N/A"),
	# 	"revenue": info.get("totalRevenue", "N/A"),
	# 	"debt_to_equity": info.get("debtToEquity", "N/A"),
	# 	"profit_margin": info.get("profitMargins", "N/A")
	# }
}



print(data)