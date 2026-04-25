from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

SERVICES = {
    "market": "http://market-service:8000",
    "news": "http://news-service:8000",
    "portfolio": "http://portfolio-service:8000",
    "ai": "http://ai-service:8000"
}

# Mapping of root-level endpoints to their respective services
# This ensures existing frontend calls work without modification
ENDPOINT_MAP = {
    "market_overview": "market",
    "market_historical": "market",
    "market_intraday": "market",
    "stock_info": "market",
    "sebi_content": "news",
    "sebi_content_stream": "news",
    "sebi_content_progressive": "news",
    "generate_ai_summary": "news",
    "get_ai_analysis": "ai",
    "upload_portfolio": "portfolio",
    "analyze_portfolio_risk": "portfolio",
    "analyze_portfolio_ai": "ai",
    "get_response": "ai"
}

@app.route("/api/<service>/<path:path>", methods=["GET", "POST", "OPTIONS"])
def proxy_route(service, path):
    if request.method == "OPTIONS":
        return "", 200
        
    if service not in SERVICES:
        return {"error": "Invalid service"}, 404

    return proxy(service, path)

@app.route("/<path:path>", methods=["GET", "POST", "OPTIONS"])
def root_proxy(path):
    if request.method == "OPTIONS":
        return "", 200
        
    # Extract the first segment of the path to find the service
    segment = path.split('/')[0]
    service = ENDPOINT_MAP.get(segment)
    
    if not service:
        return {"error": "Endpoint not mapped"}, 404
        
    return proxy(service, path)

def proxy(service, path):
    url = f"{SERVICES[service]}/{path}"
    
    # Forward parameters
    params = request.args.to_dict()
    
    try:
        if request.method == "POST":
            # Handle both JSON and Form Data (for file uploads)
            if request.files:
                files = {name: (f.filename, f.stream, f.content_type) for name, f in request.files.items()}
                resp = requests.post(url, data=request.form, files=files, params=params)
            else:
                resp = requests.post(url, json=request.json, params=params)
        else:
            resp = requests.get(url, params=params)
            
        return (resp.content, resp.status_code, resp.headers.items())
    except Exception as e:
        return {"error": f"Gateway error: {str(e)}"}, 500

@app.route("/health")
def health():
    return {"status": "ok", "service": "gateway"}

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
