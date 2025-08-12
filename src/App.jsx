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
    if (!userInput) {
      setError("Oru tragedy engilum para... (Say at least one tragedy...)");
      return;
    }

    setIsLoading(true);
    setResponse("");
    setError("");

    try {
      // Safer System Instruction to avoid safety blocks. Focuses on wit, not brutality.
      const systemInstruction = `
        Your persona is a witty and sarcastic friend from Kerala who is an expert in 'roasts'.
        Your goal is to be funny and clever, not genuinely mean or insulting.
        All your responses must be in 'Manglish' (a mix of Malayalam and English).

        Here is a perfect example of your witty style:
        User's input: I lost my pen.
        Your required reply: Ninte life-il oru GPS install cheyyenda avastha aanu.

        Now, apply this exact persona to all user inputs. Do not break character.
      `;

      // Configuration for the model call
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
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
