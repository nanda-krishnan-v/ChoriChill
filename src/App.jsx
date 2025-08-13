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
    if (!userInput) {
      setError("Oru tragedy engilum para... (Say at least one tragedy...)");
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
          userInput: userInput.trim()
        }),
      });

      const data = await apiResponse.json();

      if (!apiResponse.ok) {
        throw new Error(data.error || `HTTP error! status: ${apiResponse.status}`);
      }

      if (data.success && data.roast) {
        setResponse(data.roast);
      } else {
        throw new Error(data.error || "Unexpected response format");
      }

    } catch (err) {
      console.error("❌ API Error:", err);
      
      // Handle different types of errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        setError("Cannot connect to server. Make sure the backend is running on port 5000.");
      } else if (err.message.includes('429')) {
        setError("Too many requests. Please try again later.");
      } else if (err.message.includes('500')) {
        setError("Server error. Please try again in a moment.");
      } else {
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <h1>Manglish Roast Battle</h1>
      <p>
        Share your tragedy. Enittu vangi kootikko. (Then, get ready to be
        roasted.)
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="What happened now?"
          rows="3"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Loading your insult..." : "Roast Me"}
        </button>
      </form>

      {error && <p className="error">{error}</p>}

      {response && (
        <div className="response-area">
          <h2>Roast:</h2>
          <pre>{response}</pre>
        </div>
      )}
    </div>
  );
}

export default App;