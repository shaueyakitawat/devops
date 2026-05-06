from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import io
import os
from groq import Groq
import json

app = Flask(__name__)
CORS(app)

def get_agent_response(query):
    """Simple Groq-based agent response"""
    try:
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are MoneyMitra, a helpful financial assistant for Indian investors. Provide concise, accurate financial insights."},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

@app.route('/get_response', methods=['POST'])
def get_response():
    try:
        data = request.get_json()
        query = data.get('query')
        if not query:
            return jsonify({"error": "Query is required"}), 400
        response_text = get_agent_response(query)
        return jsonify({"response": response_text})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/analyze-portfolio", methods=["POST"])
def analyze_portfolio():
    try:
        if 'file' not in request.files:
            return jsonify({"status": "error", "message": "No file part"}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({"status": "error", "message": "No selected file"}), 400
            
        contents = file.read()
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        csv_summary = df.to_string(index=False)
        row_count = len(df)
        columns = list(df.columns)

        prompt = f"Analyze this portfolio CSV data for an Indian investor:\n{csv_summary}\nProvide summary, risk assessment, and 5 actionable recommendations."

        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=2048,
        )
        analysis = response.choices[0].message.content
        return jsonify({
            "status": "success",
            "rows_analyzed": row_count,
            "columns_detected": columns,
            "analysis": analysis
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route("/analyze-news", methods=["POST"])
def analyze_news():
    try:
        data = request.json
        articles = data.get("articles", [])

        # Combine text
        combined_text = " ".join([a.get("content", "") for a in articles])

        # Call existing Groq / LLM logic
        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a financial analyst. Summarize these news articles for an investor."},
                {"role": "user", "content": f"Analyze these news articles and provide a summary with actionable insights:\n\n{combined_text}"}
            ],
            temperature=0.3,
            max_tokens=2048,
        )

        return jsonify({
            "summary": response.choices[0].message.content
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get_ai_analysis", methods=["POST"])
def get_ai_analysis():
    try:
        data = request.get_json()
        title = data.get('title')
        content = data.get('content')
        language = data.get('language', 'en')

        prompt = f"""
        Analyze this news article for an Indian investor:
        Title: {title}
        Content: {content}
        
        Provide:
        1. A 2-line summary.
        2. Sentiment (Positive/Negative/Neutral).
        3. Recommended Action (Buy/Sell/Hold/Watch).
        4. Key points (list).
        5. Affected sectors or stocks (list).
        
        Return the result in JSON format with keys: summary, sentiment, action, key_points, affected_sectors, affected_stocks.
        """

        client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a financial analyst. Return ONLY valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            response_format={"type": "json_object"}
        )
        
        ai_analysis = json.loads(response.choices[0].message.content)
        return jsonify({
            "success": True,
            "ai_analysis": ai_analysis
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "ai-service"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
