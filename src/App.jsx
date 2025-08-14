import { useState } from "react";
import "./App.css";

// Backend API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function App() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError("Ayyo! Please share your tragedy first! 😅");
      return;
    }

    setIsLoading(true);
    setResponse("");
    setError("");

    try {
      const apiResponse = await fetch(`${API_BASE_URL}/api/roast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
        }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(
          data.error || `HTTP error! status: ${apiResponse.status}`
        );
      }

      if (data.success && data.roast) {
        setResponse(data.roast);
      } else {
        throw new Error(data.error || "Unexpected response format");
      }
    } catch (err) {
      console.error("❌ API Error:", err);

      // Handle different types of errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Cannot connect to server. Make sure the backend is running on port 5000."
        );
      } else if (err.message.includes("429")) {
        setError("Too many requests. Please try again later.");
      } else if (err.message.includes("500")) {
        setError("Server error. Please try again in a moment.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      {/* Header Section */}
      <header className="app-header">
        <div className="robot-icon">🤖</div>
        <h1 className="app-title">Chori-CHill</h1>
        <p className="app-subtitle">
          Your friendly neighborhood savage AI roaster
        </p>
        <p className="app-description">
          Describe your situation and get roasted in style! 🔥
        </p>
      </header>

      {/* Main Content Container */}
      <main className="main-container">
        <div className="content-card">
          {/* Input Section */}
          <div className="input-section">
            <textarea
              className="tragedy-input"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="What is your aim in life?"
              rows="4"
              disabled={isLoading}
            />

            <button
              type="button"
              className="roast-button"
              onClick={handleSubmit}
              disabled={isLoading || !userInput.trim()}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  <span>Cooking Roast...</span>
                </>
              ) : (
                <>
                  <span className="button-icon">⚡</span>
                  <span>Roast Me</span>
                  <span className="button-icon">🔥</span>
                </>
              )}
            </button>
          </div>

          {/* Response/Error Section */}
          {(response || error) && (
            <div className="response-section">
              <div className="response-header">
                <span className="response-icon">🤖</span>
                <span className="response-title">Chori-CHill says:</span>
              </div>

              {error && <div className="error-message">{error}</div>}

              {response && <div className="roast-response">{response}</div>}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Made with ❤️ and a lot of sass • Powered by Gemini AI</p>
      </footer>
    </div>
  );
}

export default App;
