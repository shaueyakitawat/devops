# MoneyMitra 💰

MoneyMitra is a modern, high-performance fintech dashboard designed for Indian retail investors. It provides a unified interface for market data, news insights, and portfolio analysis, powered by a robust microservice architecture.

## 🚀 DevOps & Architecture
This project demonstrates modern DevOps principles through **Dockerization** and **Service Orchestration**. The application is broken down into independent microservices, each running in its own container, ensuring scalability and isolation.

### Service Structure
- **Frontend**: React-based dashboard (Vite).
- **API Gateway**: Central entry point for all service communication.
- **Market Service**: Real-time market data and historical analysis.
- **News Service**: Regulatory and financial news aggregation.
- **Portfolio Service**: User holdings and asset tracking.
- **AI Service**: LLM-powered insights using Groq (LLaMA 3.3).

---

## 🛠️ Tech Stack
- **Frontend**: React 18, Vite, Vanilla CSS.
- **Backend**: Python 3.11, Flask.
- **AI**: Groq API (llama-3.3-70b-versatile).
- **Infrastructure**: Docker, Docker Compose.

---

## 🚦 Getting Started

### 1. Prerequisites
- Docker and Docker Compose installed.
- A Groq API Key (get one at [console.groq.com](https://console.groq.com)).

### 2. Environment Setup
Create a `.env` file in the root directory (referencing `.env.example`):
```env
VITE_API_URL=http://localhost:5001
GROQ_API_KEY=your_api_key_here
```

### 3. Run in One Command
Start the entire microservices stack using Docker Compose:
```bash
docker-compose up --build
```

The application will be available at:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Gateway**: [http://localhost:5001](http://localhost:5001)

---

## 📂 Project Organization
```text
MoneyMitra/
├── frontend/ (Root)         # React + Vite Application
├── backend/
│   ├── gateway/            # Flask API Gateway
│   ├── market-service/     # Market Data Service
│   ├── news-service/       # News Aggregator Service
│   ├── portfolio-service/  # Portfolio Tracker Service
│   └── ai-service/         # AI Analysis Service
└── docker-compose.yml       # Orchestration Config
```

## 🛡️ Security & Performance
- **Isolation**: Internal services (Market, News, Portfolio, AI) are hidden from the public and only accessible via the Gateway.
- **Efficiency**: Services communicate over a dedicated Docker bridge network.
- **Minimalism**: Non-essential features and files have been removed to maintain a lean, production-ready codebase.

---
*MoneyMitra — Empowering Indian Investors with Data and Intelligence.*
