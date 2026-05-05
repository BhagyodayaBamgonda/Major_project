import { useState, useEffect, useRef } from "react";
import "./DataChat.css";

const API_BASE = "http://127.0.0.1:8000";

export default function DataChat() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [sessionId, setSessionId]   = useState(null);
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState("");
  const [loading, setLoading]       = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [error, setError]           = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input after response
  useEffect(() => {
    if (!loading) inputRef.current?.focus();
  }, [loading]);

  // ── File Upload → get session_id ─────────────────────────────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Upload failed");
      }

      setSessionId(data.session_id);
      setMessages([]);            // fresh chat for new file
      setShowUpload(false);
      setError(null);

      setMessages([{
        role: "bot",
        text: `✅ File uploaded successfully.\n\nDetected columns: ${Object.keys(data.schema_info).join(", ")}\n\nYou can now ask questions about your data.`,
      }]);

    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Send chat message ─────────────────────────────────────────────────────
  const handleSend = async () => {
    const question = input.trim();
    if (!question || loading || !sessionId) return;

    // Append user message immediately
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, question }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            error: true,
            text: data.message || "Something went wrong. Please try again.",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: data.message,
          code: data.query || null,
        },
      ]);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "bot", error: true, text: "Connection error: " + err.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Send on Enter (Shift+Enter = newline)
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="chat-wrapper">

      {/* ── Header ── */}
      <header className="chat-header">
        <h1>💬 Data Chat</h1>

        <div className="chat-session-bar">
          {sessionId && (
            <span className="chat-session-badge">
              Session active
            </span>
          )}
          <button
            className="chat-btn chat-btn-primary"
            onClick={() => setShowUpload(true)}
            disabled={uploadLoading}
          >
            {uploadLoading ? "Uploading…" : sessionId ? "Change File" : "Upload File"}
          </button>
          {sessionId && (
            <button
              className="chat-btn chat-btn-secondary"
              onClick={() => { setSessionId(null); setMessages([]); }}
            >
              Clear Session
            </button>
          )}
        </div>
      </header>

      {/* ── Upload Modal ── */}
      {showUpload && (
        <div className="chat-modal-overlay" onClick={() => setShowUpload(false)}>
          <div className="chat-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Upload Data File</h3>
            <p>Supported formats: CSV, XLSX, XLS</p>
            <label className="chat-file-label">
              {uploadLoading ? "Uploading…" : "Choose File"}
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: "none" }}
                onChange={handleFileUpload}
                disabled={uploadLoading}
              />
            </label>
            <div className="chat-modal-actions">
              <button
                className="chat-btn chat-btn-secondary"
                onClick={() => setShowUpload(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && <div className="chat-error-banner">{error}</div>}

      {/* ── Chat main ── */}
      <div className="chat-main">

        {/* No session → prompt to upload */}
        {!sessionId ? (
          <div className="chat-no-session">
            <div style={{ fontSize: 48 }}>📂</div>
            <h3>No file loaded</h3>
            <p>Upload a CSV or Excel file to start chatting with your data.</p>
            <button
              className="chat-btn chat-btn-primary"
              onClick={() => setShowUpload(true)}
            >
              Upload File
            </button>
          </div>
        ) : (
          <>
            {/* ── Messages ── */}
            <div className="chat-messages">

              {messages.length === 0 && (
                <div className="chat-empty">
                  <div className="chat-empty-icon">🤖</div>
                  <p>Ask questions about your data</p>
                  <small>
                    e.g. "How many partners are in Mumbai?" or "What is the total count by region?"
                  </small>
                </div>
              )}

              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-message ${msg.role}${msg.error ? " error" : ""}`}
                >
                  <div className="chat-bubble">{msg.text}</div>

                  {/* Show generated pandas code if present */}
                  {msg.code && (
                    <div>
                      <div className="chat-code-label">Generated query</div>
                      <pre className="chat-code">{msg.code}</pre>
                    </div>
                  )}

                  <span className="chat-label">
                    {msg.role === "user" ? "You" : "AI"}
                  </span>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="chat-message bot">
                  <div className="chat-typing">
                    <span /><span /><span />
                  </div>
                  <span className="chat-label">AI is thinking…</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input bar ── */}
            <div className="chat-input-bar">
              <textarea
                ref={inputRef}
                className="chat-input"
                rows={2}
                placeholder="Ask questions about your data… (Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button
                className="chat-btn chat-btn-primary"
                onClick={handleSend}
                disabled={loading || !input.trim()}
              >
                {loading ? "…" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
