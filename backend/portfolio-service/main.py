from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "portfolio-service"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
