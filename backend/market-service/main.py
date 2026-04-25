from flask import Flask, jsonify, request
from flask_cors import CORS
import traceback
from market_data import (
    get_market_overview, get_historical_data, get_intraday_data,
    get_stock_info, INDIAN_INDICES
)

app = Flask(__name__)
CORS(app)

@app.route('/market_overview', methods=['GET'])
def market_overview():
    """Get complete market overview - indices, gainers, losers"""
    try:
        data = get_market_overview()
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/market_historical/<ticker>', methods=['GET'])
def market_historical(ticker):
    """Get historical data for a specific ticker"""
    try:
        period = request.args.get('period', '1mo')
        interval = request.args.get('interval', '1d')
        data = get_historical_data(ticker, period, interval)
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/market_intraday/<ticker>', methods=['GET'])
def market_intraday(ticker):
    """Get intraday data for a specific ticker"""
    try:
        data = get_intraday_data(ticker)
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/stock_info/<ticker>', methods=['GET'])
def stock_info(ticker):
    """Get detailed stock information and fundamentals"""
    try:
        data = get_stock_info(ticker)
        return jsonify(data)
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "market-service"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
