import yfinance as yf

try:
	import xfinance as xf
except Exception:
	xf = None


def get_ticker(symbol: str):
	if xf is not None:
		try:
			return xf.Ticker(symbol), "xfinance"
		except Exception as exc:
			print(f"xfinance unavailable for {symbol}: {exc}")
	return yf.Ticker(symbol), "yfinance"


# Single ticker (multi-source failover, cached)
t, backend = get_ticker("AAPL")
print(f"Using {backend}")
print(t.history(period="1y"))
print(t.info)
print(t.income_stmt)




# def load_data(source):
#     """Load financial data from various sources."""
#     ticker = yf.Ticker(source)
#     hist = ticker.history(period="1mo")
#     stock_data = {
#             "latest_price": hist["Close"].iloc[-1],
#             "avg_price": hist["Close"].mean(),
#             "volume": hist["Volume"].mean(),
#             "history": hist[["Close", "Volume"]]
#         }
#     info = ticker.info
#     data = {
#             "symbol": source,
#             "stock_data": stock_data,
#             "financial_metrics": {
#                 "pe_ratio": info.get("trailingPE", "N/A"),
#                 "revenue": info.get("totalRevenue", "N/A"),
#                 "debt_to_equity": info.get("debtToEquity", "N/A"),
#                 "profit_margin": info.get("profitMargins", "N/A")
#             }
#         }
#     return data

# data = load_data("MSFT")
# print(data)
