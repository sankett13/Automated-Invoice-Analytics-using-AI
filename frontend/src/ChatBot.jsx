import React, { useState, useEffect, useRef } from "react";

const funBotFaces = ["🤖", "😎", "😜", "👽", "🧠", "💡", "🔥", "✨"];
const confettiWords = ["great", "awesome", "thanks", "love", "cool"];
const bgColors = ["#dff7f6", "#fef6e4", "#f4f4fc", "#fff0f6", "#e8f9f1"];

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [botFace, setBotFace] = useState("🤖");
  const [backgroundIndex, setBackgroundIndex] = useState(0);
  const messageEndRef = useRef(null);
  const typingAudio = useRef(null);
  const musicAudio = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const emoji = document.getElementById("bot-face");
      if (emoji) {
        emoji.style.transform = `translate(${(e.clientX - window.innerWidth / 2) / 80}px, ${(e.clientY - window.innerHeight / 2) / 80}px)`;
      }
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    musicAudio.current = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_eb15bfa320.mp3");
    musicAudio.current.volume = 0.2;
    musicAudio.current.loop = true;
    musicAudio.current.play().catch(() => {});
  }, []);

  useEffect(() => {
    typingAudio.current = new Audio("https://cdn.pixabay.com/audio/2022/03/15/audio_aef36e3c29.mp3");
    typingAudio.current.volume = 0.6;
  }, []);

  const handleInputChange = (e) => setInputText(e.target.value);

  const triggerConfetti = () => {
    const confetti = document.createElement("div");
    confetti.className = "absolute top-0 left-0 w-full h-full pointer-events-none z-50";
    confetti.innerHTML = `<div class="w-full h-full flex justify-center items-center animate-bounce text-6xl">🎉</div>`;
    document.body.appendChild(confetti);
    setTimeout(() => document.body.removeChild(confetti), 1000);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    setMessages((msgs) => [...msgs, { text: inputText, sender: "user" }]);
    setInputText("");
    setIsBotThinking(true);

    if (confettiWords.some((word) => inputText.toLowerCase().includes(word))) {
      triggerConfetti();
    }

    typingAudio.current?.play();

    try {
      const res = await fetch("/api/invoices/chatbot/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: inputText }),
      });

      const { response } = await res.json();
      const randomFace = funBotFaces[Math.floor(Math.random() * funBotFaces.length)];
      setBotFace(randomFace);

      setTimeout(() => {
        setMessages((msgs) => [...msgs, { text: response, sender: "bot" }]);
        setIsBotThinking(false);
        setBackgroundIndex((prev) => (prev + 1) % bgColors.length);
      }, 700);
    } catch {
      setTimeout(() => {
        setMessages((msgs) => [
          ...msgs,
          {
            text: "💥 Oops! My circuits are fried. Try again later.",
            sender: "bot",
          },
        ]);
        setIsBotThinking(false);
      }, 700);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div
      className="relative flex flex-col rounded-lg shadow-lg h-[80vh] max-h-screen overflow-hidden transition-colors duration-700"
      style={{ backgroundColor: bgColors[backgroundIndex] }}
    >
      {/* Header */}
      <header className="bg-[#01b8b1] p-4 shadow-md flex items-center justify-between">
        <div className="flex items-center">
          <span
            id="bot-face"
            className="w-8 h-8 rounded-full bg-[#e6c065] text-white flex items-center justify-center text-lg transition-transform duration-300"
          >
            {botFace}
          </span>
          <h2 className="ml-2 text-white font-semibold text-lg">Super Chat</h2>
        </div>
        <div className="text-white text-sm italic animate-pulse">
          AI-powered magic ⚡
        </div>
      </header>

      {/* Messages */}
      <div className="flex-grow p-4 overflow-y-auto bg-white relative">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 p-3 rounded-xl whitespace-pre-wrap max-w-[70%] transition-all duration-500 ${
              m.sender === "user"
                ? "bg-[#01b8b1] text-white self-end"
                : "bg-[#f9f9f9] text-[#484c4d] self-start shadow-md border border-[#e6c065]"
            }`}
            style={
              m.sender === "bot"
                ? { boxShadow: "0 0 12px #e6c065" }
                : {}
            }
          >
            {m.text}
          </div>
        ))}
        {isBotThinking && (
          <div className="mb-2 p-3 rounded-xl bg-[#01b8b1] text-white self-start italic flex items-center animate-pulse">
            Typing
            <span className="ml-2 flex">
              <span className="w-2.5 h-2.5 bg-white rounded-full mr-1 animate-bounce delay-100"></span>
              <span className="w-2.5 h-2.5 bg-white rounded-full mr-1 animate-bounce delay-200"></span>
              <span className="w-2.5 h-2.5 bg-white rounded-full animate-bounce delay-300"></span>
            </span>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex p-4 border-t border-[#eee] bg-[#01b8b1]">
        <input
          type="text"
          className="flex-grow p-3 rounded-lg border border-[#ddd] text-[#484c4d] focus:outline-none focus:ring-2 focus:ring-[#e6c065] placeholder-[#777]"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Ask or search anything..."
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
        />
        <button
          className="ml-4 bg-[#e6c065] text-[#484c4d] py-3 px-6 rounded-lg focus:outline-none hover:shadow-[0_0_10px_#e6c065] transition-all duration-300 hover:scale-105"
          onClick={handleSendMessage}
          disabled={isBotThinking}
        >
          🚀 Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;