import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dotenv import load_dotenv
import feedparser
import re

load_dotenv()

# Trusted Indian Financial News Sources - STRICTLY STOCK MARKET FOCUSED
OFFICIAL_SOURCES = {
    "moneycontrol_stocks": {
        "name": "Moneycontrol Stocks",
        "rss_url": "https://www.moneycontrol.com/rss/marketoutlook.xml",
        "category": "Stock Analysis",
        "news_type": "stock"
    },
    "moneycontrol_ipos": {
        "name": "Moneycontrol IPO",
        "rss_url": "https://www.moneycontrol.com/rss/ipo.xml",
        "category": "IPO",
        "news_type": "stock"
    },
    "economic_times_stocks": {
        "name": "ET Stocks",
        "rss_url": "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
        "category": "Stock News",
        "news_type": "stock"
    },
    "economic_times_markets": {
        "name": "ET Markets",
        "rss_url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
        "category": "Market News",
        "news_type": "general"
    },
    "livemint_market": {
        "name": "Mint Market",
        "rss_url": "https://www.livemint.com/rss/markets",
        "category": "Market Updates",
        "news_type": "general"
    },
    "livemint_companies": {
        "name": "Mint Companies",
        "rss_url": "https://www.livemint.com/rss/companies",
        "category": "Company News",
        "news_type": "stock"
    },
    "business_standard_markets": {
        "name": "Business Standard Markets",
        "rss_url": "https://www.business-standard.com/rss/markets-106.rss",
        "category": "Market Analysis",
        "news_type": "general"
    }
}

# Supported languages for translation
LANGUAGES = {
    "hi": "Hindi",
    "mr": "Marathi", 
    "gu": "Gujarati",
    "ta": "Tamil",
    "te": "Telugu",
    "bn": "Bengali",
    "kn": "Kannada",
    "ml": "Malayalam"
}


def scrape_rss_feed(rss_url: str, source_name: str, max_articles: int = 10) -> List[Dict[str, Any]]:
    """
    Scrape content from RSS feeds (most reliable for news)
    """
    try:
        feed = feedparser.parse(rss_url)
        articles = []
        
        for entry in feed.entries[:max_articles]:
            title = entry.get('title', 'No Title')
            
            # Get description/summary
            description = entry.get('description', entry.get('summary', ''))
            # Clean HTML tags from description
            description = re.sub(r'<[^>]+>', '', description)
            
            # Get link
            link = entry.get('link', rss_url)
            
            # Get published date
            published = entry.get('published', entry.get('updated', ''))
            if published:
                try:
                    from dateutil import parser as date_parser
                    pub_date = date_parser.parse(published)
                    if pub_date.tzinfo is not None:
                        pub_date = pub_date.replace(tzinfo=None)
                except:
                    pub_date = datetime.now()
            else:
                pub_date = datetime.now()
            
            # Only include articles with substantial content
            if len(description.strip()) < 50:
                continue
            
            articles.append({
                "title": title,
                "content": description[:2000],  # Limit content length
                "url": link
            })
        
        return articles
        
    except Exception as e:
        print(f"Error scraping RSS {rss_url}: {str(e)}")
        return []


def scrape_sebi_content(url: str, max_articles: int = 5) -> List[Dict[str, Any]]:
    """
    Scrape content from SEBI website (fallback method)
    """
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        articles = []
        
        # Try to find press release items or news items
        news_items = soup.find_all(['tr', 'div'], class_=['tableblue', 'news-item', 'press-release'], limit=max_articles)
        
        if news_items:
            for item in news_items:
                # Try to find title and link
                link_tag = item.find('a')
                if link_tag:
                    title = link_tag.get_text().strip()
                    href = link_tag.get('href', '')
                    if href and not href.startswith('http'):
                        href = 'https://www.sebi.gov.in' + href
                    
                    # Get any description text
                    description = ' '.join([p.get_text().strip() for p in item.find_all('p')])
                    
                    if title and len(title) > 10:
                        articles.append({
                            "title": title,
                            "content": description[:1500] if description else title,
                            "url": href if href else url
                        })
        
        return articles
        
    except Exception as e:
        print(f"Error scraping {url}: {str(e)}")
        return []


def translate_content(text: str, target_language: str) -> str:
    """
    Translate content to target vernacular language
    """
    try:
        if target_language == "en":
            return text
            
        translator = GoogleTranslator(source='en', target=target_language)
        # Split long text into chunks (Google Translate has limits)
        max_chunk_size = 4500
        if len(text) <= max_chunk_size:
            return translator.translate(text)
        
        # Translate in chunks
        chunks = [text[i:i+max_chunk_size] for i in range(0, len(text), max_chunk_size)]
        translated_chunks = [translator.translate(chunk) for chunk in chunks]
        return ' '.join(translated_chunks)
        
    except Exception as e:
        print(f"Translation error for {target_language}: {str(e)}")
        return text


def get_aggregated_content(language: str = "en", include_summary: bool = True, include_ai_analysis: bool = True) -> List[Dict[str, Any]]:
    """
    Main function to get latest financial news - raw data only
    """
    all_content = []
    
    print("🔄 Fetching latest Indian financial news...")
    
    for source_key, source_info in OFFICIAL_SOURCES.items():
        if "rss_url" in source_info:
            articles = scrape_rss_feed(
                source_info["rss_url"], 
                source_info["name"], 
                max_articles=5
            )
        elif "url" in source_info:
            articles = scrape_sebi_content(source_info["url"], max_articles=3)
        else:
            articles = []
        
        all_content.extend(articles)
    
    return all_content


if __name__ == "__main__":
    # Test the aggregator
    print("Testing News Aggregator (Raw Data)...")
    result = get_aggregated_content()
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    # Test the aggregator
    print("Testing SEBI Content Aggregator...")
    result = get_aggregated_content(language="hi", include_summary=True)
    print(json.dumps(result, indent=2, ensure_ascii=False))
