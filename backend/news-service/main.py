from flask import Flask, jsonify, request
from flask_cors import CORS
from content_aggregator import get_aggregated_content, LANGUAGES
from progressive_fetcher import get_all_news_articles, process_article_progressive

app = Flask(__name__)
CORS(app)

_article_cache = {}

@app.route('/sebi_content', methods=['GET', 'POST'])
def sebi_content():
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
            language = data.get('language', 'en')
            include_summary = data.get('summary', True)
            include_ai_analysis = data.get('ai_analysis', True)
        else:
            language = request.args.get('language', 'en')
            include_summary = request.args.get('summary', 'true').lower() == 'true'
            include_ai_analysis = request.args.get('ai_analysis', 'true').lower() == 'true'
        
        result = get_aggregated_content(
            language=language, 
            include_summary=include_summary,
            include_ai_analysis=include_ai_analysis
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/sebi_content_stream', methods=['GET', 'POST'])
def get_news():
    try:
        if request.method == 'POST':
            data = request.get_json() or {}
        else:
            data = request.args.to_dict()
            # Convert string numbers to int if they exist in GET args
            if 'article_index' in data:
                try:
                    data['article_index'] = int(data['article_index'])
                except:
                    data['article_index'] = 0
        
        language = data.get('language', 'en')
        article_index = data.get('article_index', 0)
        session_id = data.get('session_id', 'default')
        news_type_filter = data.get('news_type', None)
        
        if article_index == 0 or session_id not in _article_cache:
            all_articles = get_all_news_articles()
            if news_type_filter:
                all_articles = [a for a in all_articles if a.get('news_type') == news_type_filter]
            _article_cache[session_id] = all_articles
        else:
            all_articles = _article_cache.get(session_id, [])
        
        total = len(all_articles)
        if article_index >= total:
            return jsonify({"success": True, "article": None, "has_more": False, "total": total})
        
        article = all_articles[article_index]
        processed = process_article_progressive(article, article_index, language=language)
        return jsonify({
            "success": True,
            "article": processed,
            "has_more": article_index < total - 1,
            "total": total
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "news-service"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
