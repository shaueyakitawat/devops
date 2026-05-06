import { useState } from 'react';
import { motion } from 'framer-motion';

const OfficialResources = () => {
  const [activeModule, setActiveModule] = useState(null);
  const [activeLesson, setActiveLesson] = useState(null);

  const modules = [
    {
      id: 1,
      title: "Introduction to Stock Markets",
      icon: "📈",
      lessons: [
        { title: "What is the Stock Market?", content: "The stock market is a marketplace where buyers and sellers trade shares of publicly listed companies. In India, the two primary exchanges are NSE (National Stock Exchange) and BSE (Bombay Stock Exchange). When you buy a share, you own a small piece of that company and participate in its growth and profits." },
        { title: "How Stock Exchanges Work", content: "Stock exchanges act as intermediaries that facilitate trading. NSE and BSE operate from 9:15 AM to 3:30 PM IST on weekdays. Orders are matched electronically through an order book system where buy and sell orders are paired based on price and time priority." },
        { title: "Market Participants", content: "Key participants include retail investors (individuals), institutional investors (mutual funds, insurance companies), Foreign Institutional Investors (FIIs), market makers, and brokers. Each plays a different role in providing liquidity and price discovery." },
      ]
    },
    {
      id: 2,
      title: "Understanding Market Hub",
      icon: "🏦",
      lessons: [
        { title: "Reading Market Data", content: "The Market Hub displays live price data for stocks and indices. The LTP (Last Traded Price) shows the most recent transaction price. The change percentage shows how much a stock has moved from its previous closing price." },
        { title: "Market Indices — NIFTY & SENSEX", content: "NIFTY 50 tracks the top 50 companies on NSE by market capitalisation. SENSEX tracks the top 30 on BSE. When these indices rise, it generally indicates broad market optimism. A falling index indicates selling pressure across the market." },
        { title: "Volume & Liquidity", content: "Volume is the number of shares traded in a given period. High volume on a price move confirms the strength of that move. Low volume moves are often unreliable. Liquidity refers to how easily you can buy or sell a stock without significantly impacting its price." },
      ]
    },
    {
      id: 3,
      title: "Portfolio Management",
      icon: "💼",
      lessons: [
        { title: "Building a Portfolio", content: "A portfolio is your collection of investments. A well-diversified portfolio spreads risk across different sectors, asset classes, and geographies. Avoid putting more than 10-15% of your capital into a single stock, especially as a beginner." },
        { title: "Understanding P&L", content: "P&L (Profit and Loss) shows your realised and unrealised gains or losses. Realised P&L is locked in when you sell. Unrealised P&L fluctuates with market prices. Use the Portfolio page in MoneyMitra to track both in real time." },
        { title: "Asset Allocation", content: "Asset allocation is how you divide your investments between equities, debt, gold, and cash. A common rule for equity allocation is 100 minus your age — a 25-year-old might hold 75% in equities. Rebalance your portfolio periodically to maintain your target allocation." },
        { title: "Equity Curve", content: "An equity curve plots your portfolio value over time. A steadily rising equity curve with small drawdowns is the goal. Sharp drops in your equity curve signal over-concentration or poor risk management." },
      ]
    },
    {
      id: 4,
      title: "News & Market Analysis",
      icon: "📰",
      lessons: [
        { title: "Why News Moves Markets", content: "Markets are forward-looking. Prices move on expectations, not just current reality. A company reporting strong earnings might still fall if the results were below analyst expectations. Understanding the difference between news and market reaction is a critical skill." },
        { title: "Reading Regulatory Updates", content: "SEBI (Securities and Exchange Board of India) regulates the Indian securities market. SEBI circulars and announcements directly impact how brokers operate, margin requirements, and trading rules. Staying updated on SEBI news helps you anticipate policy-driven market moves." },
        { title: "Using MoneyMitra News", content: "The News & Insights page aggregates financial news and regulatory updates in one place. Filter stories by relevance to your holdings. Macro news (RBI policy, inflation data, budget announcements) impacts the entire market while company-specific news impacts individual stocks." },
      ]
    },
    {
      id: 5,
      title: "Fundamental Analysis",
      icon: "🔍",
      lessons: [
        { title: "What is Fundamental Analysis?", content: "Fundamental analysis involves evaluating a company's financial health to determine its intrinsic value. You analyse revenue, profit margins, debt levels, and growth prospects to decide if a stock is undervalued or overvalued relative to its current price." },
        { title: "Key Financial Ratios", content: "P/E Ratio (Price to Earnings): How much you pay per rupee of earnings. Lower can mean cheaper but check the sector average. ROE (Return on Equity): How efficiently a company uses shareholder money. EPS (Earnings Per Share): Company profit divided by shares outstanding. Debt-to-Equity: How leveraged the company is." },
        { title: "Reading Financial Statements", content: "Three key statements: Income Statement (revenue, expenses, profit), Balance Sheet (assets, liabilities, equity), and Cash Flow Statement (actual cash generated). Strong companies show growing revenue, expanding margins, and positive free cash flow consistently over multiple years." },
      ]
    },
    {
      id: 6,
      title: "Technical Analysis Basics",
      icon: "📊",
      lessons: [
        { title: "What is Technical Analysis?", content: "Technical analysis studies price and volume history to forecast future price movements. Unlike fundamental analysis which asks 'what to buy', technical analysis helps answer 'when to buy and sell'. It works on the premise that all known information is already reflected in the price." },
        { title: "Support & Resistance", content: "Support is a price level where buying interest is strong enough to prevent further decline. Resistance is where selling pressure prevents further rise. When a resistance level is broken convincingly, it often becomes the new support — this is called a role reversal." },
        { title: "Moving Averages", content: "A moving average smooths out price data to identify trends. The 50-day and 200-day moving averages are widely watched. When the 50-day crosses above the 200-day it is called a Golden Cross — a bullish signal. The reverse is called a Death Cross — a bearish signal." },
      ]
    },
    {
      id: 7,
      title: "Risk Management",
      icon: "🛡️",
      lessons: [
        { title: "Why Risk Management is Everything", content: "Professional traders say: first protect your capital, then grow it. A 50% loss requires a 100% gain just to break even. Risk management is not about avoiding losses — it is about keeping losses small enough that you can always come back." },
        { title: "Position Sizing", content: "Never risk more than 1-2% of your total capital on a single trade. If your portfolio is ₹1,00,000, your maximum loss on any single trade should be ₹1,000-₹2,000. Calculate your position size based on where you will place your stop loss, not on how much you want to make." },
        { title: "Stop Loss Strategy", content: "A stop loss is a pre-decided exit point if the trade goes against you. Place stop losses at logical levels — below support for long trades, above resistance for short trades. Never widen a stop loss once placed. Accepting small losses is the price of staying in the game long-term." },
      ]
    },
    {
      id: 8,
      title: "Trading vs Investing",
      icon: "⚖️",
      lessons: [
        { title: "Key Differences", content: "Investing is buying and holding quality assets for years to benefit from compounding and business growth. Trading is taking shorter-term positions to profit from price movements. Investing requires patience and fundamental conviction. Trading requires discipline, risk management, and emotional control." },
        { title: "Intraday vs Delivery", content: "Intraday trades are opened and closed on the same day — you do not take delivery of shares. Delivery trades involve actual ownership of shares held overnight or longer. Intraday requires higher attention, faster decisions, and carries more risk due to leverage. Beginners should start with delivery-based investing." },
        { title: "Tax Implications in India", content: "Short-term capital gains (held less than 1 year) are taxed at 20%. Long-term capital gains (held more than 1 year) above ₹1.25 lakh are taxed at 12.5%. Intraday trading profits are treated as business income and taxed at your income tax slab rate. Keep records of all trades for filing returns." },
      ]
    },
  ];

  return (
    <div style={{ padding: '40px 0' }}>
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="resources-container" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="resources-header" style={{ textAlign: 'center', marginBottom: '40px' }}>
              <h1 style={{ marginBottom: '16px', fontSize: '36px', fontWeight: '700' }}>Documentation</h1>
              <p style={{ color: 'var(--textSecondary)', fontSize: '18px' }}>Learn markets, understand MoneyMitra features, and build your financial knowledge.</p>
            </div>

            <div className="docs-module-grid">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="docs-module-card"
                  onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                >
                  <div className="docs-module-header">
                    <span className="docs-module-icon">{module.icon}</span>
                    <h2 className="docs-module-title">{module.title}</h2>
                    <span className="docs-module-arrow">{activeModule === module.id ? '▲' : '▼'}</span>
                  </div>

                  {activeModule === module.id && (
                    <div className="docs-lessons">
                      {module.lessons.map((lesson, i) => (
                        <div
                          key={i}
                          className="docs-lesson"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLesson(activeLesson === `${module.id}-${i}` ? null : `${module.id}-${i}`);
                          }}
                        >
                          <div className="docs-lesson-title">
                            <span>{lesson.title}</span>
                            <span>{activeLesson === `${module.id}-${i}` ? '−' : '+'}</span>
                          </div>
                          {activeLesson === `${module.id}-${i}` && (
                            <p className="docs-lesson-content">{lesson.content}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OfficialResources;
