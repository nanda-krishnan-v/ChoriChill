import { useState } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import "./App.css";

// --- IMPORTANT SETUP REMINDER ---
// 1. Make sure you have a .env.local file in the root of your project.
// 2. Inside .env.local, your variable MUST start with VITE_
//    VITE_GEMINI_API_KEY="YOUR_API_KEY_HERE"
// 3. If you just created this file, you MUST restart your development server (Ctrl+C and then `npm run dev`).
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Initialize the Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

function App() {
  const [userInput, setUserInput] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) {
      setError("Oru tragedy engilum para... (Say at least one tragedy...)");
      return;
    }

    setIsLoading(true);
    setResponse("");
    setError("");

    try {
      // Safer System Instruction to avoid safety blocks. Focuses on wit, not brutality.
      const systemInstruction = `
        So you need to act like someone who are skilled in roasting.
        The roast should be a mix of malayalam and english and should sound like coming from a malayali. 
        The roast should be in oneline, funny but not hurtful.
        The input  may be any random sentence you need to roast according to the scenario of input
      `;

      // Configuration for the model call
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-pro",
        systemInstruction: systemInstruction,
      });

      const generationConfig = {
        temperature: 0.8,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const chat = model.startChat({
        generationConfig,
        safetySettings,
      });

      const result = await chat.sendMessage(userInput);
      const text = result.response.text();
      setResponse(text);
    } catch (err) {
      // Log the full technical error to the browser's console for debugging
      console.error("❌ Gemini API Error:", err);
      // Display a more helpful message to the user
      setError(
        "Error fetching response. Check the console (F12) for details. Is your API Key correct and the server restarted?"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUserInput("");
    setResponse("");
    setError("");
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <h1>Manglish Roast Battle</h1>
        <p className="subtitle">
          Share your tragedy. Enittu vangi kootikko. (Then, get ready to be roasted.)
        </p>
        <div className="badge">
          <span className="badge-icon">🔥</span>
          Powered by AI Sarcasm
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        
        {/* Input Section */}
        <div className="input-section">
          <div className="section-header">
            <h2>
              <span className="icon">📝</span>
              Your Tragedy
            </h2>
            <div className={`status-indicator ${isLoading ? 'loading' : 'ready'}`}>
              {isLoading ? '⏳ Processing' : '✅ Ready'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="roast-form">
            <div className="form-group">
              <label htmlFor="tragedy">What happened now?</label>
              <textarea
                id="tragedy"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your tragedy here... (e.g., I lost my pen, I'm single, I failed my exam)"
                className="input-textarea"
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">❌</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner"></div>
                  <span>Loading your insult...</span>
                </>
              ) : (
                <>
                  <span className="btn-icon">🔥</span>
                  <span>Roast Me</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output Section */}
        <div className="output-section">
          <div className="section-header">
            <h2>
              <span className="icon">🔥</span>
              The Roast
            </h2>
            <div className={`status-indicator ${response ? 'complete' : 'waiting'}`}>
              {response ? '📝 Complete' : '⏳ Waiting'}
            </div>
          </div>

          <div className="response-area">
            {isLoading ? (
              <div className="loading-state">
                <div className="loading-animation">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>Crafting your personalized roast...</p>
                </div>
              </div>
            ) : response ? (
              <div className="response-content">
                <div className="response-header">
                  <span className="response-label">🤖 AI Roast Response</span>
                </div>
                <div className="response-text">{response}</div>
                <div className="response-footer">
                  <button onClick={handleReset} className="reset-btn">
                    <span>🔄</span>
                    <span>Try Another</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="placeholder">
                <div className="placeholder-content">
                  <span className="placeholder-icon">🤔</span>
                  <p>Ready for your roast?</p>
                  <p className="placeholder-subtitle">Share your tragedy above to get started</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>Built with ❤️ and a lot of sarcasm</p>
          <div className="tech-stack">
            <span className="tech-badge">React</span>
            <span className="tech-badge">CSS3</span>
            <span className="tech-badge">Google Gemini AI</span>
            <span className="tech-badge">Manglish Humor</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;