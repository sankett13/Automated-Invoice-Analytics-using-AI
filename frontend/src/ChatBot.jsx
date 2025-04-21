import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const messageEndRef = useRef(null);

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSendMessage = async () => {
    if (inputText.trim()) {
      const newUserMessage = { text: inputText, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newUserMessage]);
      setInputText('');
      setIsBotThinking(true);

      try {
        const response = await fetch('/api/invoices/chatbot/', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: inputText }),
        });

        if (!response.ok) {
          const errorMessage = await response.json();
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorMessage.error || 'Unknown error'}`);
        }

        const responseData = await response.json();
        const botReply = responseData.response;

        setTimeout(() => {
          const chatbotResponse = { text: botReply, sender: 'bot' };
          setMessages((prevMessages) => [...prevMessages, chatbotResponse]);
          setIsBotThinking(false);
        }, 500);
      } catch (error) {
        console.error('Error sending message to chatbot API:', error);
        setTimeout(() => {
          const errorMessage = { text: 'Sorry, I encountered an error. Please try again later.', sender: 'bot' };
          setMessages((prevMessages) => [...prevMessages, errorMessage]);
          setIsBotThinking(false);
        }, 500);
      }
    }
  };

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col h-[80vh] max-h-screen overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 p-3 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <h2 className="text-lg font-semibold text-gray-800 ml-2">Super Chat</h2>
        </div>
      </div>

      {/* Message History */}
      <div className="flex-grow overflow-y-auto p-3">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-3 rounded-md whitespace-pre-wrap ${
              message.sender === 'user'
                ? 'bg-blue-100 text-blue-800 self-end rounded-br-none'
                : 'bg-gray-100 text-gray-800 self-start rounded-bl-none'
            }`}
          >
            {message.text.split('\n').map((line, i) => (
              <p key={i} className="mb-1">{line}</p>
            ))}
          </div>
        ))}
        {isBotThinking && (
          <div className="mb-2 p-3 rounded-md bg-gray-100 text-gray-600 self-start italic flex items-center">
            Thinking
            <span className="typing-indicator ml-2">
              <span>.</span>
              <span>.</span>
              <span>.</span>
            </span>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 flex items-center">
        <input
          type="text"
          className="shadow appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
          value={inputText}
          onChange={handleInputChange}
          placeholder="Ask or search anything..."
          onKeyPress={(event) => event.key === 'Enter' && handleSendMessage()}
        />
        <button
          className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline"
          onClick={handleSendMessage}
          disabled={isBotThinking}
        >
          {isBotThinking ? (
            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4V1m0 18v-3M4 12H1m18 0h-3M4 4l2.12 2.12M17.88 6.12L19 4m-10 10l-2.12 2.12M6.12 17.88L4 19m10-10l2.12-2.12M17.88 11.88L19 10m-10 10l-2.12-2.12M6.12 6.12L4 4" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
