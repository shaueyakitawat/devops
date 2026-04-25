import { useState, useRef } from "react";
import "./AIAnalyzer.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function AIAnalyzer() {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith(".csv")) {
      setError("Please upload a CSV file only.");
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/api/ai/analyze-portfolio`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("API analysis failed");
      const data = await response.json();

      if (data.status === "error") {
        setError(data.message);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError(
        "Could not connect to the analysis server. Make sure the backend is running."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatAnalysis = (text) => {
    return text.split("\n").map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <h3 key={i} className="ai-section-heading">
            {line.replace(/\*\*/g, "")}
          </h3>
        );
      }
      if (line.includes("**")) {
        const parts = line.split("**");
        return (
          <p key={i} className="ai-line">
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j}>{part}</strong> : part
            )}
          </p>
        );
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return (
          <li key={i} className="ai-bullet">
            {line.replace(/^[-•]\s/, "")}
          </li>
        );
      }
      if (/^\d+\./.test(line)) {
        return (
          <p key={i} className="ai-numbered">
            {line}
          </p>
        );
      }
      if (line.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="ai-line">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="ai-analyzer-container">
      {/* Header */}
      <div className="ai-analyzer-header">
        <h1 className="ai-analyzer-title">AI Portfolio Analyzer</h1>
        <p className="ai-analyzer-subtitle">
          Upload your portfolio CSV and get an instant AI-powered analysis —
          risk assessment, diversification check, and actionable recommendations.
        </p>
      </div>

      {/* Format Guide */}
      <div className="ai-format-guide">
        <span className="ai-format-icon">💡</span>
        <div>
          <strong>Expected CSV columns:</strong>{" "}
          <code>Stock</code>, <code>Quantity</code>, <code>Buy Price</code>,{" "}
          <code>Current Price</code>, <code>P&L</code>, <code>Sector</code>.
          Most broker portfolio exports (Zerodha, Groww, Upstox) work directly.
        </div>
      </div>

      {/* Upload Zone */}
      <div
        className={`ai-upload-zone ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files[0])}
        />

        {file ? (
          <>
            <div className="ai-upload-icon">✅</div>
            <p className="ai-file-name">{file.name}</p>
            <p className="ai-file-size">
              {(file.size / 1024).toFixed(1)} KB — ready to analyze
            </p>
          </>
        ) : (
          <>
            <div className="ai-upload-icon">📂</div>
            <p className="ai-upload-text">
              Drop your portfolio CSV here or click to browse
            </p>
            <p className="ai-upload-subtext">Only .csv files are accepted</p>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="ai-actions">
        <button
          className="ai-btn-analyze"
          onClick={handleAnalyze}
          disabled={!file || isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "🤖 Analyze My Portfolio"}
        </button>
        {(file || result) && (
          <button className="ai-btn-reset" onClick={handleReset}>
            Reset
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="ai-error">
          ⚠️ {error}
        </div>
      )}

      {/* Loading */}
      {isAnalyzing && (
        <div className="ai-loading">
          <div className="ai-spinner" />
          <p className="ai-loading-text">
            Analyzing your portfolio with AI — this takes 10–20 seconds...
          </p>
        </div>
      )}

      {/* Results */}
      {result && !isAnalyzing && (
        <div className="ai-results">
          <div className="ai-results-header">
            <h2 className="ai-results-title">📊 Analysis Complete</h2>
            <div className="ai-results-meta">
              <span className="ai-meta-badge">
                {result?.rows_analyzed || 0} Holdings
              </span>
              <span className="ai-meta-badge">
                {result?.columns_detected?.length || 0} Columns Detected
              </span>
            </div>
          </div>
          <div className="ai-results-body">
            {formatAnalysis(result.analysis)}
          </div>
        </div>
      )}
    </div>
  );
}
