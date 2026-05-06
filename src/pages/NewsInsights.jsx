import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Globe, CheckCircle, ExternalLink, Sparkles, BookOpen } from 'lucide-react';
import Card from '../components/Card';
import API_BASE from '../lib/api';

const NewsInsights = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [totalArticles, setTotalArticles] = useState(0);
  const [loadingAI, setLoadingAI] = useState({});
  const [aiInsights, setAIInsights] = useState(null);
  const [loadingGeneralAI, setLoadingGeneralAI] = useState(false);
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);

  const [sebiContent, setSebiContent] = useState([]);
  const [sebiLoading, setSebiLoading] = useState(false);
  const [sebiError, setSebiError] = useState('');
  const [sebiTotalArticles, setSebiTotalArticles] = useState(0);
  const [sebiLoadingAI, setSebiLoadingAI] = useState({});
  const sebiFetchingRef = useRef(false);


  const languageNames = {
    'en': { name: 'English', flag: '🇬🇧' },
    'hi': { name: 'हिंदी', flag: '🇮🇳' },
    'mr': { name: 'मराठी', flag: '🇮🇳' },
    'gu': { name: 'ગુજરાતી', flag: '🇮🇳' },
    'ta': { name: 'தமிழ்', flag: '🇮🇳' },
    'te': { name: 'తెలుగు', flag: '🇮🇳' },
    'bn': { name: 'বাংলা', flag: '🇮🇳' },
    'kn': { name: 'ಕನ್ನಡ', flag: '🇮🇳' },
    'ml': { name: 'മലയാളം', flag: '🇮🇳' }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchContent('en');
    fetchSebiContent('en');
  }, []);

  const fetchContent = async (language) => {
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);
    setError('');
    setContent([]);
    setTotalArticles(0);
    
    const sessionId = `session_stock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      let articleIndex = 0;
      let hasMore = true;
      
      while (hasMore) {
        const response = await fetch(`${API_BASE}/api/news/sebi_content_stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            article_index: articleIndex,
            session_id: sessionId,
            include_ai_analysis: false,
            news_type: 'stock'
          })
        });

        if (!response.ok) throw new Error("Stream failed");

        const data = await response.json();
        
        if (data.success) {
          if (data.article) {
            setContent(prev => [...prev, data.article]);
            if (articleIndex === 0) setTotalArticles(data.total);
          }
          hasMore = data.has_more;
          articleIndex++;
          if (!hasMore) setLoading(false);
        } else {
          setError(data.error || 'Failed to fetch content');
          setLoading(false);
          break;
        }
      }
      setSelectedLanguage(language);
    } catch (err) {
      console.error('Error:', err);
      setError('Network error. Please ensure backend is running');
      setLoading(false);
    } finally {
      fetchingRef.current = false;
    }
  };


  const fetchSebiContent = async (language) => {
    if (sebiFetchingRef.current) return;
    sebiFetchingRef.current = true;
    setSebiLoading(true);
    setSebiError('');
    setSebiContent([]);
    setSebiTotalArticles(0);
    
    const sessionId = `session_general_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    try {
      let articleIndex = 0;
      let hasMore = true;
      while (hasMore) {
        const response = await fetch(`${API_BASE}/api/news/sebi_content_stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            article_index: articleIndex,
            session_id: sessionId,
            include_ai_analysis: false,
            news_type: 'general'
          })
        });
        if (!response.ok) throw new Error("SEBI stream failed");
        const data = await response.json();
        if (data.success) {
          if (data.article) {
            setSebiContent(prev => [...prev, data.article]);
            if (articleIndex === 0) setSebiTotalArticles(data.total);
          }
          hasMore = data.has_more;
          articleIndex++;
          if (!hasMore) setSebiLoading(false);
        } else {
          setSebiError(data.error || 'Failed to fetch content');
          setSebiLoading(false);
          break;
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setSebiError('Network error. Please ensure backend is running');
      setSebiLoading(false);
    } finally {
      sebiFetchingRef.current = false;
    }
  };

  const fetchSebiAIAnalysis = async (articleId, articleTitle, articleContent) => {
    setSebiLoadingAI(prev => ({ ...prev, [articleId]: true }));
    try {
      const response = await fetch(`${API_BASE}/api/ai/get_ai_analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          content: articleContent,
          language: selectedLanguage
        })
      });
      const data = await response.json();
      if (data.success && data.ai_analysis) {
        setSebiContent(prev => prev.map(item => 
          item.id === articleId 
            ? { ...item, ai_analysis: data.ai_analysis, summary: data.ai_analysis.summary, action: data.ai_analysis.action, sentiment: data.ai_analysis.sentiment, summary_translated: data.ai_analysis.summary_translated }
            : item
        ));
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
    } finally {
      setSebiLoadingAI(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const fetchAIAnalysis = async (articleId, articleTitle, articleContent) => {
    setLoadingAI(prev => ({ ...prev, [articleId]: true }));
    
    try {
      const response = await fetch(`${API_BASE}/api/ai/get_ai_analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: articleTitle,
          content: articleContent,
          language: selectedLanguage
        })
      });

      const data = await response.json();
      
      if (data.success && data.ai_analysis) {
        setContent(prev => prev.map(item => 
          item.id === articleId 
            ? { ...item, ai_analysis: data.ai_analysis, summary: data.ai_analysis.summary, action: data.ai_analysis.action, sentiment: data.ai_analysis.sentiment }
            : item
        ));
      }
    } catch (err) {
      console.error('AI Analysis Error:', err);
    } finally {
      setLoadingAI(prev => ({ ...prev, [articleId]: false }));
    }
  };

  const handleAIInsights = async () => {
    setLoadingGeneralAI(true);
    try {
      const response = await fetch(
        `${API_BASE}/api/ai/analyze-news`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ articles: content })
        }
      );

      if (!response.ok) throw new Error("Collective insights failed");

      const data = await response.json();
      setAIInsights(data.summary);
    } catch (err) {
      console.error('Error generating AI insights:', err);
    } finally {
      setLoadingGeneralAI(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = { 'Stock Analysis': '#8b5cf6', 'Stock News': '#ec4899', 'Company News': '#f97316', 'Earnings': '#10b981' };
    return colors[category] || '#6366f1';
  };

  const getActionColor = (action) => {
    const colors = { 'BUY': '#10b981', 'SELL': '#ef4444', 'HOLD': '#f59e0b', 'WATCH': '#6366f1' };
    return colors[action?.toUpperCase()] || '#6b7280';
  };

  const getSentimentEmoji = (sentiment) => {
    const emojis = { 'Bullish': '🐂', 'Bearish': '🐻', 'Neutral': '⚖️' };
    return emojis[sentiment] || '📊';
  };

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: '700' }}>
              📈 Stock-Specific News & Analysis
            </h1>
            <p style={{ color: 'var(--textSecondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Latest news about individual stocks, earnings reports, company announcements & analyst ratings
            </p>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--primaryCobalt)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>🏢 Individual Stocks</span>
              <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>📊 Company Analysis</span>
              <span style={{ background: '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>🤖 AI-Powered Insights</span>
            </div>
          </div>

          <Card style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Globe size={24} color="var(--primaryCobalt)" />
                <h3 style={{ margin: 0 }}>Select Language</h3>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(languageNames).map(([code, { name, flag }]) => (
                  <motion.button key={code} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => { fetchContent(code); fetchSebiContent(code); }}
                    style={{
                      padding: '10px 20px',
                      border: selectedLanguage === code ? '2px solid var(--primaryCobalt)' : '1px solid var(--border)',
                      borderRadius: '8px',
                      background: selectedLanguage === code ? 'var(--primaryCobalt)' : 'transparent',
                      color: selectedLanguage === code ? 'white' : 'var(--text)',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: selectedLanguage === code ? '600' : '400',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <span>{flag}</span><span>{name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </Card>

          <Card style={{ marginBottom: '32px', textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h3 style={{ marginBottom: '16px' }}>🤖 Market Sentiment & AI Insights</h3>
            <p style={{ marginBottom: '20px', opacity: 0.9 }}>Get a high-level AI summary of all current market news and trends.</p>
            <button 
              onClick={handleAIInsights} 
              disabled={loadingGeneralAI || content.length === 0}
              style={{
                background: 'white',
                color: '#764ba2',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '700',
                cursor: (loadingGeneralAI || content.length === 0) ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
              }}
            >
              <Sparkles size={20} />
              {loadingGeneralAI ? 'Generating Insights...' : '🧠 Generate AI Insights'}
            </button>

            {loadingGeneralAI && <p style={{ marginTop: '16px' }}>Generating collective market insights based on latest news...</p>}

            {aiInsights && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: '24px', textAlign: 'left', background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                <h4 style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} />
                  Current Market Insights
                </h4>
                <div style={{ lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {aiInsights}
                </div>
              </motion.div>
            )}
          </Card>

          {loading && content.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} style={{ display: 'inline-block', marginBottom: '16px' }}>
                <Sparkles size={48} color="var(--primaryCobalt)" />
              </motion.div>
              <h3 style={{ marginBottom: '8px', color: 'var(--text)' }}>Fetching Stock-Specific News...</h3>
              <p style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>🔍 Scraping company announcements, earnings & analyst reports</p>
            </Card>
          )}

          {error && <Card style={{ background: '#fee2e2', border: '1px solid #ef4444' }}><p style={{ color: '#dc2626', margin: 0 }}>❌ {error}</p></Card>}

          {content.length > 0 && (
            <div style={{ display: 'grid', gap: '24px' }}>
              {content.map((item, index) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                  <Card hover style={{ position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'inline-block', background: getCategoryColor(item.category), color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                      {item.category}
                    </div>
                    <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', lineHeight: '1.4' }}>
                      {item.title_translated || item.title}
                    </h3>
                    <div style={{ background: 'var(--neutralBg)', padding: '18px', borderRadius: '12px', marginBottom: '20px', borderLeft: '4px solid var(--primaryCobalt)' }}>
                      <p style={{ color: 'var(--text)', lineHeight: '1.9', margin: 0, fontSize: '15px' }}>
                        {item.content_translated || item.content}
                      </p>
                    </div>
                    
                    {!item.ai_analysis ? (
                      <div style={{ textAlign: 'center' }}>
                        <button onClick={() => fetchAIAnalysis(item.id, item.title, item.content)} disabled={loadingAI[item.id]}
                          style={{
                            background: loadingAI[item.id] ? 'var(--neutralBg)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '15px',
                            fontWeight: '600', cursor: loadingAI[item.id] ? 'not-allowed' : 'pointer', display: 'inline-flex',
                            alignItems: 'center', gap: '10px'
                          }}
                        >
                          <Sparkles size={18} />
                          {loadingAI[item.id] ? 'Analyzing...' : 'Get AI Analysis'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '24px', borderRadius: '16px', color: 'white' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Sparkles size={22} />
                            <span style={{ fontSize: '16px', fontWeight: '700' }}>AI ANALYSIS</span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ background: getActionColor(item.ai_analysis.action), padding: '8px 20px', borderRadius: '24px', fontSize: '14px', fontWeight: '800' }}>
                              {item.ai_analysis.action}
                            </span>
                            <span style={{ fontSize: '28px' }}>{getSentimentEmoji(item.ai_analysis.sentiment)}</span>
                          </div>
                        </div>
                        <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '12px', opacity: 0.95 }}>
                          {item.summary_translated || item.ai_analysis.summary}
                        </p>
                        {item.ai_analysis.affected_stocks?.length > 0 && (
                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {item.ai_analysis.affected_stocks.map((stock, idx) => (
                              <span key={idx} style={{ background: 'rgba(255,255,255,0.25)', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>
                                🏢 {stock}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', marginTop: '16px' }}>
                      <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}><strong>Source:</strong> {item.source}</div>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primaryCobalt)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                        <span>Read Original</span><ExternalLink size={14} />
                      </a>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !error && content.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
              <TrendingUp size={64} color="var(--textMuted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px', color: 'var(--textMuted)' }}>No stock-specific news available</h3>
              <p style={{ color: 'var(--textMuted)' }}>Try selecting a different language or check back later</p>
            </Card>
          )}
        
          <div style={{ marginTop: '60px', marginBottom: '40px', borderTop: '1px solid var(--border)', paddingTop: '40px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '32px', fontWeight: '700' }}>🏛️ Market Resources & Regulatory Updates</h2>
          </div>

          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: '700' }}>
              📊 General Market News & Updates
            </h1>
            <p style={{ color: 'var(--textSecondary)', fontSize: '18px', maxWidth: '700px', margin: '0 auto' }}>
              Real-time market updates on NIFTY, SENSEX, sectors, policy changes & economic trends with AI-powered analysis
            </p>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--primaryCobalt)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                🤖 AI-Powered Analysis
              </span>
              <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                📊 Buy/Sell/Hold Signals
              </span>
              <span style={{ background: '#f59e0b', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                🌐 Multi-language Support
              </span>
            </div>
          </div>

          {/* Initial Loading State */}
          {sebiLoading && sebiContent.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '40px' }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                style={{ display: 'inline-block', marginBottom: '16px' }}
              >
                <Sparkles size={48} color="var(--primaryCobalt)" />
              </motion.div>
              <h3 style={{ marginBottom: '8px', color: 'var(--text)' }}>
                Fetching Latest Market News...
              </h3>
              <p style={{ color: 'var(--textSecondary)', fontSize: '14px' }}>
                🔍 Scraping BSE, Moneycontrol, Economic Times & more<br/>
                Please wait while we gather the latest news...
              </p>
            </Card>
          )}

          {/* Error State */}
          {sebiError && (
            <Card style={{ background: '#fee2e2', border: '1px solid #ef4444' }}>
              <p style={{ color: '#dc2626', margin: 0 }}>❌ {sebiError}</p>
            </Card>
          )}

          {/* Content Grid */}
          {sebiContent.length > 0 && (
            <>
              {sebiLoading && sebiTotalArticles > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ marginBottom: '24px', position: 'sticky', top: '20px', zIndex: 100 }}
                >
                  <Card style={{ 
                    textAlign: 'center', 
                    padding: '20px', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles size={20} />
                      </motion.div>
                      <p style={{ margin: 0, fontSize: '15px', fontWeight: '700' }}>
                        📰 Loading Article {sebiContent.length}/{sebiTotalArticles}
                        {selectedLanguage !== 'en' && ' 🌐'}
                      </p>
                    </div>
                    <p style={{ margin: '8px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
                      Articles load instantly • Click "Get AI Analysis" for insights
                    </p>
                  </Card>
                </motion.div>
              )}
              <div style={{ display: 'grid', gap: '24px' }}>
                {sebiContent.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.5) }}
                  >
                    <Card hover style={{ position: 'relative', overflow: 'hidden' }}>
                    {/* Verified Badge */}
                    {item.verified && (
                      <div style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        background: '#10b981',
                        color: 'white',
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <CheckCircle size={14} />
                        <span>SEBI Verified</span>
                      </div>
                    )}

                    {/* Category Badge */}
                    <div style={{
                      display: 'inline-block',
                      background: getCategoryColor(item.category),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '12px'
                    }}>
                      {item.category}
                    </div>

                    {/* Title */}
                    <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600', lineHeight: '1.4' }}>
                      {item.title_translated || item.title}
                    </h3>

                    {/* Full Content - Display First */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ 
                        background: 'var(--neutralBg)', 
                        padding: '18px', 
                        borderRadius: '12px', 
                        marginBottom: '20px',
                        borderLeft: '4px solid var(--primaryCobalt)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '18px' }}>📰</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--primaryCobalt)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          Latest News
                        </span>
                      </div>
                      <p style={{ color: 'var(--text)', lineHeight: '1.9', margin: 0, fontSize: '15px' }}>
                        {item.sebiContent_translated || item.sebiContent}
                      </p>
                    </motion.div>

                    {/* AI Analysis Button or Divider */}
                    {!item.ai_analysis ? (
                      <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <button
                          onClick={() => fetchSebiAIAnalysis(item.id, item.title, item.sebiContent)}
                          disabled={sebiLoadingAI[item.id]}
                          style={{
                            background: sebiLoadingAI[item.id] 
                              ? 'var(--neutralBg)' 
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '14px 28px',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: sebiLoadingAI[item.id] ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            boxShadow: sebiLoadingAI[item.id] ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
                            transition: 'all 0.3s ease',
                            opacity: sebiLoadingAI[item.id] ? 0.6 : 1
                          }}
                        >
                          {sebiLoadingAI[item.id] ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Sparkles size={18} />
                              </motion.div>
                              Analyzing...
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              Get AI Analysis
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        margin: '24px 0',
                        opacity: 0.6 
                      }}>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }}></div>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--textMuted)', textTransform: 'uppercase' }}>
                          ⚡ AI Analysis Below
                        </span>
                        <div style={{ flex: 1, height: '2px', background: 'linear-gradient(90deg, transparent, var(--border), transparent)' }}></div>
                      </div>
                    )}

                    {/* AI Analysis Section - Display After Content */}
                    {item.ai_analysis && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          padding: '24px',
                          borderRadius: '16px',
                          marginBottom: '16px',
                          color: 'white',
                          boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
                          border: '2px solid rgba(255,255,255,0.1)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <motion.div
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                              <Sparkles size={22} />
                            </motion.div>
                            <span style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '0.5px' }}>
                              AI-POWERED INVESTMENT ANALYSIS
                            </span>
                          </div>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              style={{
                                background: getActionColor(item.ai_analysis.action),
                                padding: '8px 20px',
                                borderRadius: '24px',
                                fontSize: '14px',
                                fontWeight: '800',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                border: '2px solid white'
                              }}
                            >
                              {item.ai_analysis.action}
                            </motion.span>
                            <span style={{ fontSize: '28px' }}>
                              {getSentimentEmoji(item.ai_analysis.sentiment)}
                            </span>
                          </div>
                        </div>

                        {/* Summary */}
                        <p style={{ fontSize: '15px', lineHeight: '1.7', marginBottom: '12px', opacity: 0.95 }}>
                          {item.summary_translated || item.ai_analysis.summary}
                        </p>

                        {/* Key Metrics */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>SENTIMENT</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.ai_analysis.sentiment}</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>RISK LEVEL</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.ai_analysis.risk_level}</div>
                          </div>
                          <div style={{ background: 'rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px' }}>
                            <div style={{ fontSize: '11px', opacity: 0.8, marginBottom: '4px' }}>TIME HORIZON</div>
                            <div style={{ fontSize: '14px', fontWeight: '600' }}>{item.ai_analysis.time_horizon}</div>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '6px' }}>💡 Reasoning:</div>
                          <div style={{ fontSize: '13px', opacity: 0.9 }}>{item.ai_analysis.reasoning}</div>
                        </div>

                        {/* Affected Sectors/Stocks */}
                        {(item.ai_analysis.affected_sectors?.length > 0 || item.ai_analysis.affected_stocks?.length > 0) && (
                          <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {item.ai_analysis.affected_sectors?.map((sector, idx) => (
                              <span key={idx} style={{
                                background: 'rgba(255,255,255,0.2)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                📈 {sector}
                              </span>
                            ))}
                            {item.ai_analysis.affected_stocks?.map((stock, idx) => (
                              <span key={idx} style={{
                                background: 'rgba(255,255,255,0.25)',
                                padding: '4px 10px',
                                borderRadius: '12px',
                                fontSize: '11px',
                                fontWeight: '600'
                              }}>
                                🏢 {stock}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Key Points */}
                        {item.ai_analysis.key_points?.length > 0 && (
                          <div style={{ marginTop: '12px' }}>
                            <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '8px' }}>🎯 Key Points:</div>
                            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', opacity: 0.9 }}>
                              {item.ai_analysis.key_points.map((point, idx) => (
                                <li key={idx} style={{ marginBottom: '4px' }}>{point}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Simple Summary (for sebiContent without AI analysis) */}
                    {!item.ai_analysis && item.summary && (
                      <div style={{
                        background: 'var(--neutralBg)',
                        padding: '16px',
                        borderRadius: '8px',
                        marginBottom: '16px',
                        borderLeft: '4px solid var(--accentGold)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <Sparkles size={16} color="var(--accentGold)" />
                          <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--accentGold)' }}>
                            Summary
                          </span>
                        </div>
                        <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0, color: 'var(--textSecondary)' }}>
                          {item.summary_translated || item.summary}
                        </p>
                      </div>
                    )}

                    {/* Footer */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ fontSize: '12px', color: 'var(--textMuted)' }}>
                          <strong>Source:</strong> {item.source}
                        </div>
                        {item.published && (
                          <div style={{ fontSize: '11px', color: 'var(--textMuted)' }}>
                            📅 {new Date(item.published).toLocaleDateString('en-IN', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: 'var(--primaryCobalt)',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: '500'
                        }}
                      >
                        <span>Read Original</span>
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )}

          
          {/* Empty State */}
          {!sebiLoading && !sebiError && sebiContent.length === 0 && (
            <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
              <BookOpen size={64} color="var(--textMuted)" style={{ marginBottom: '16px' }} />
              <h3 style={{ marginBottom: '8px', color: 'var(--textMuted)' }}>No sebiContent available</h3>
              <p style={{ color: 'var(--textMuted)' }}>Try selecting a different language or check your connection</p>
            </Card>
          )}
        
        </motion.div>
      </div>
    </div>
  );
};

export default NewsInsights;
