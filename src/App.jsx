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
      console.log("Sending request to:", `${API_BASE_URL}/api/roast`);
      console.log("Request payload:", { userInput: userInput.trim() });

      const apiResponse = await fetch(`${API_BASE_URL}/api/roast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userInput: userInput.trim(),
        }),
      });

      console.log("Response status:", apiResponse.status);
      console.log("Response headers:", apiResponse.headers);

      const data = await apiResponse.json();
      console.log("Response data:", data);

      if (!apiResponse.ok) {
        throw new Error(
          data.error || `HTTP error! status: ${apiResponse.status}`
        );
      }

      // Check for different possible response formats
      if (data.success && data.roast) {
        setResponse(data.roast);
      } else if (data.roast) {
        // If roast exists without success field
        setResponse(data.roast);
      } else if (data.message) {
        // If response has message field
        setResponse(data.message);
      } else if (data.response) {
        // If response has response field
        setResponse(data.response);
      } else {
        // If it's just a string
        setResponse(JSON.stringify(data));
      }
    } catch (err) {
      console.error("❌ API Error:", err);
      console.error("Error details:", {
        name: err.name,
        message: err.message,
        stack: err.stack,
      });

      // Handle different types of errors
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        setError(
          "Cannot connect to server. Make sure the backend is running on port 5000."
        );
      } else if (err.message.includes("429")) {
        setError("Too many requests. Please try again later.");
      } else if (err.message.includes("500")) {
        setError("Server error. Please try again in a moment.");
      } else if (err.message.includes("Unexpected response format")) {
        setError("Server returned an unexpected format. Please try again.");
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
        <h1 className="app-title">Chori-Chill</h1>
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
                <span className="response-title">
                  {error
                    ? "Oops! Something went wrong 😅"
                    : "🔥 Here's Your Roast! 🔥"}
                </span>
              </div>

              {error && <div className="error-message">{error}</div>}

              {response && <div className="roast-response">{response}</div>}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>Made with ❤️ and a lot of fun • Powered by JustBuild by ThinQubator</p>
      </footer>
    </div>
  );
}

export default App;
