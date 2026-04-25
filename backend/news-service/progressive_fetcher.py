"""
Progressive news fetcher - Returns articles one by one as they're processed
"""
from content_aggregator import (
    OFFICIAL_SOURCES, scrape_rss_feed, scrape_sebi_content
)
from datetime import datetime
import time

def process_article_progressive(article, idx, language='en', include_ai_analysis=False):
    """Process a single article and return it immediately"""
    processed_article = {
        "id": f"{article.get('source', 'unknown').lower().replace(' ', '_')}_{idx}_{int(time.time())}",
        "title": article["title"],
        "content": article["content"],
        "source": article.get("source", "Unknown"),
        "url": article["url"],
        "published": datetime.now().isoformat(),
        "timestamp": datetime.now().isoformat()
    }
    
    return processed_article


def classify_news_type(title, content):
    """
    Simple classification logic
    """
    return 'general', 'Market News'


def get_all_news_articles():
    """Fetch all news articles from sources"""
    all_content = []
    
    print("🔄 Fetching latest Indian financial news...")
    for source_key, source_info in OFFICIAL_SOURCES.items():
        if "rss_url" in source_info:
            articles = scrape_rss_feed(
                source_info["rss_url"], 
                source_info["name"], 
                max_articles=10
            )
        elif "url" in source_info:
            articles = scrape_sebi_content(source_info["url"], max_articles=2)
        else:
            articles = []
        
        # Ensure source and news_type are attached to each article
        for article in articles:
            article['source'] = source_info["name"]
            article['news_type'] = source_info.get("news_type", "general")
            
        all_content.extend(articles)
    
    return all_content[:25]
