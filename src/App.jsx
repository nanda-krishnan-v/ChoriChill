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
      // Enhanced System Instruction for better, more culturally aware roasts
      const systemInstruction = `
        Your persona is a witty and sarcastic friend from Kerala who is an expert in 'roasts'.
        Your goal is to be funny and clever, not genuinely mean or insulting.
        All your responses must be in 'Manglish' (a mix of Malayalam and English).
        
        Guidelines for your roasts:
        1. Be witty and clever, use humor that's relatable to Kerala/Indian context
        2. Mix Malayalam and English naturally (Manglish style)
        3. Keep it playful, not cruel - like roasting a close friend
        4. Use popular Malayalam phrases and expressions
        5. Make cultural references that Malayalis would understand
        6. Keep the tone light and funny, not harsh
        7. Reference Kerala culture, food, movies, or common situations
        8. Use expressions like "adipoli", "pwoli", "ayye", "machane", etc.

        Here are some examples of your witty style:
        User's input: I lost my pen.
        Your reply: Ninte life-il oru GPS install cheyyenda avastha aanu.
        
        User's input: I failed my exam.
        Your reply: Padichitt karyam illallo, ini oru tea shop thudangiko machane!

        Now, apply this exact persona to all user inputs. Do not break character.
      `;

      // Updated to use Gemini 2.0 Flash for better performance and responses
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp", // Latest Gemini 2.0 Flash model
        systemInstruction: systemInstruction,
      });

      const generationConfig = {
        temperature: 0.9, // Higher temperature for more creative and funny responses
        topK: 40,
        topP: 0.95,
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
        "Error fetching response. AI-ku oru technical issue und. Retry cheyyam? 🤖"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🔥 Manglish Roast Battle</h1>
        <p className="subtitle">
          Share your tragedy. Enittu vangi kootikko. (Then, get ready to be roasted.)
        </p>
        <div className="badge">
          <span className="badge-icon">⚡</span>
          Powered by Gemini 2.0 Flash
        </div>
      </header>

      <main className="main-content">
        <div className="input-section">
          <div className="section-header">
            <h2>
              <span className="icon">💬</span>
              Your Tragedy
            </h2>
            <div className={`status-indicator ${isLoading ? 'loading' : 'ready'}`}>
              {isLoading ? 'Generating roast...' : 'Ready to roast'}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="roast-form">
            <div className="form-group">
              <label htmlFor="userInput">What happened now?</label>
              <textarea
                id="userInput"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Tell us about your latest life disaster... The funnier the better! 😅"
                rows="4"
                className="input-textarea"
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading || !userInput.trim()}
              className={`submit-btn ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Generating Epic Roast...
                </>
              ) : (
                <>
                  <span className="btn-icon">🎯</span>
                  Roast Me
                </>
              )}
            </button>
          </form>
        </div>

        <div className="output-section">
          <div className="section-header">
            <h2>
              <span className="icon">🎯</span>
              The Roast
            </h2>
            <div className={`status-indicator ${
              response ? 'complete' : isLoading ? 'loading' : 'waiting'
            }`}>
              {response ? 'Roast complete!' : isLoading ? 'AI is thinking...' : 'Waiting for input'}
            </div>
          </div>

          <div className="response-area">
            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            {!response && !error && !isLoading && (
              <div className="placeholder">
                <div className="placeholder-content">
                  <span className="placeholder-icon">🎭</span>
                  <p>Your epic roast will appear here...</p>
                  <p className="placeholder-subtitle">Ready to face the heat?</p>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="loading-state">
                <div className="loading-animation">
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>Crafting the perfect roast...</p>
                </div>
              </div>
            )}

            {response && (
              <div className="response-content">
                <div className="response-header">
                  <span className="response-label">🔥 Fresh Roast</span>
                </div>
                <div className="response-text">
                  {response}
                </div>
                <div className="response-footer">
                  <button 
                    onClick={() => {
                      setResponse("");
                      setUserInput("");
                      setError("");
                    }}
                    className="reset-btn"
                  >
                    <span className="btn-icon">🔄</span>
                    Try Another Roast
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>Built with love and sarcasm in Kerala 🌴</p>
          <div className="tech-stack">
            <span className="tech-badge">React</span>
            <span className="tech-badge">Vite</span>
            <span className="tech-badge">Gemini AI</span>
            <span className="tech-badge">Manglish</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;