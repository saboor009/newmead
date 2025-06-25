import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import "../ChatComponents/ChatComponent.css";
import ReactMarkdown from "react-markdown";
import send from "../icons/arrow-up-left.svg";
import { useNavigate } from "react-router-dom";  // Update this import

function ChatComponent({ onClose }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState("");
  const [generatingAnswer, setGeneratingAnswer] = useState(false);
  const chatContainerRef = useRef(null);
  const navigate = useNavigate();  // Update this

  // // Check if the user is logged in
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (!token) {
  //     // If no token, redirect to login page
  //     navigate("/login");  // Use navigate() instead of history.push()
  //   }
  // }, [navigate]);  // Pass navigate to the dependency array

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const preprocessQuestion = (input) => {
    return input.trim().replace(/[^a-zA-Z0-9 ?!.,]/g, "");
  };

  const generateAnswer = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const processedQuestion = preprocessQuestion(question);
    setGeneratingAnswer(true);
    const currentQuestion = processedQuestion;
    setQuestion("");

    setChatHistory((prev) => [...prev, { type: "question", content: currentQuestion }]);

    try {
      const apiKey = process.env.REACT_APP_API_GENERATIVE_LANGUAGE_CLIENT;
      console.log("Using API Key:", apiKey);

      const dynamicPrompt = chatHistory
        .map((chat) => `${chat.type === "question" ? "Patient" : "CareDoc"}: ${chat.content}`)
        .join("\n");

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are a virtual doctor named CareDoc on a platform called Medease. Based on the symptoms provided by the patient, recommend the right specialist after asking at most 1-2 clarifying questions. Do not introduce yourself repeatedly.\n\n${dynamicPrompt}\nPatient: ${currentQuestion}\nCareDoc:`,
                },
              ],
            },
          ],
        }
      );

      const aiResponse = response.data.candidates[0].content.parts[0].text;
      setChatHistory((prev) => [...prev, { type: "answer", content: aiResponse }]);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setChatHistory((prev) => [
        ...prev,
        { type: "answer", content: "Sorry, an error occurred. Please try again later." },
      ]);
    }

    setGeneratingAnswer(false);
  };

  return (
    <div className="chat-container">
      <div className="chat-container-child">
        <div className="chat-history-main">
          <div ref={chatContainerRef} className="chat-history">
            {chatHistory.map((chat, index) => (
              <div key={index} className={`chat-${chat.type}`}>
                <ReactMarkdown>{chat.content}</ReactMarkdown>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center" }}>
          <form onSubmit={generateAnswer} className="chat-input">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe your symptoms..."
              rows="2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateAnswer(e);
                }
              }}
            ></textarea>

            <button type="submit" disabled={generatingAnswer} className="submit-button">
              <img src={send} alt="Send" className="button-icon" />
              {generatingAnswer && <span className="loader"></span>}
            </button>
          </form>

          
        </div>
      </div>
    </div>
  );
}

export default ChatComponent;
