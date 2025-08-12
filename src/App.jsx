import { useState } from "react";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

// Get API key from environment variable
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Debug logging (remove this after testing)
console.log("API Key loaded:", API_KEY ? "✅ Yes" : "❌ No");
console.log("API Key length:", API_KEY?.length || 0);

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

    // Check if API key is available
    if (!API_KEY) {
      setError(
        "API Key not found! Make sure VITE_GEMINI_API_KEY is set in your .env file and restart the server."
      );
      return;
    }

    setIsLoading(true);
    setResponse("");
    setError("");

    try {
      console.log("Sending request to Gemini API...");

      const systemInstruction = `
        So you need to act like someone who are skilled in roasting.
        The roast should be a mix of malayalam and english and should sound like coming from a malayali. 
        The roast should be in oneline, funny but not hurtful.
        The input may be any random sentence you need to roast according to the scenario of input. 
        Also don't convert english roast lines into malayalam. make it sound like natural Malayalam
      `;

      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash-exp",
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

      console.log("User Input Sent:", userInput);
      console.log("API Response received:", text);
      setResponse(text);
      setUserInput("");
    } catch (err) {
      console.error("❌ Gemini API Error Details:", err);

      // More specific error messages
      if (err.message?.includes("API_KEY")) {
        setError(
          "Invalid API Key. Please check your Gemini API key in the .env file."
        );
      } else if (err.message?.includes("quota")) {
        setError(
          "API quota exceeded. Please check your Gemini API usage limits."
        );
      } else if (err.message?.includes("safety")) {
        setError("Content blocked by safety filters. Try a different input.");
      } else {
        setError(
          `API Error: ${
            err.message || "Unknown error occurred. Check console for details."
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-50 animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4 animate-pulse">
            🔥 Manglish Roast Battle 🔥
          </h1>
          <p className="text-lg md:text-xl text-gray-300 font-light">
            Share your tragedy. Enittu vangi kootikko.
            <span className="block text-base text-gray-400 mt-2">
              (Then, get ready to be roasted.)
            </span>
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-black/30 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          {/* Input Section */}
          <div className="space-y-6">
            <div className="relative">
              <label className="block text-lg font-semibold text-yellow-400 mb-4 text-center">
                💭 What happened now?
              </label>
              <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tell me your tragedy... I'm ready to roast! 😈"
                rows="4"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all duration-300 text-lg backdrop-blur-sm"
                disabled={isLoading}
                maxLength={500}
              />
              <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                {userInput.length}/500
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading || !userInput.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg relative overflow-hidden group"
            >
              <span className="relative z-10">
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Preparing your roast...</span>
                  </div>
                ) : (
                  "🔥 Roast Me!"
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-red-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 animate-pulse">
              <div className="flex items-center justify-center space-x-2">
                <span className="text-2xl">⚠️</span>
                <span className="text-center">{error}</span>
              </div>
            </div>
          )}

          {/* Response Display */}
          {response && (
            <div className="mt-8 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm rounded-xl border border-orange-500/30 p-6 shadow-lg animate-fade-in">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-2xl animate-bounce">🔥</span>
                <h2 className="text-xl font-bold text-orange-300">
                  Fresh Roast:
                </h2>
              </div>
              <div className="text-lg text-gray-100 leading-relaxed bg-black/20 rounded-xl p-4 border border-orange-500/20 text-center">
                {response}
              </div>
            </div>
          )}
        </div>

        {/* Quick Examples */}
        <div className="mt-8 grid grid-cols-1 gap-3">
          <p className="text-center text-gray-400 text-sm mb-2">
            💡 Quick examples:
          </p>
          {[
            "I forgot my exam today",
            "My crush friendzoned me",
            "I fell down in public",
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setUserInput(example)}
              className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-3 text-sm text-gray-300 hover:text-white transition-all duration-200 hover:scale-105 text-center"
              disabled={isLoading}
            >
              "{example}"
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-400">
          <p className="text-sm">
            Made with 💀 and a lot of sarcasm | Keep your feelings aside!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}

export default App;
