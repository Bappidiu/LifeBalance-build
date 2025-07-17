import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane } from 'react-icons/fa';

const Contact = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);

  console.log('API Key:', import.meta.env.VITE_API_KEY); // Debug
  const apiKey = import.meta.env.VITE_API_KEY;
  if (!apiKey) {
    console.error('API Key is missing! Check your .env file.');
    setMessages((prev) => [...prev, { text: 'Error: API key is missing. Please contact the administrator.', sender: 'bot' }]);
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const sendMessage = async (retries = 3, delay = 2000) => {
    if (!userInput.trim()) return;

    setMessages([...messages, { text: userInput, sender: 'user' }]);
    setLoading(true);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const result = await model.generateContent(userInput);
        const response = await result.response;
        const text = response.text();
        setMessages((prev) => [...prev, { text, sender: 'bot' }]);
        setUserInput('');
        setLoading(false);
        return; // Success, exit the function
      } catch (error) {
        console.error(`API Error (Attempt ${attempt}/${retries}):`, error.message);
        if (error.message.includes('503') && attempt < retries) {
          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        // Handle specific errors
        let errorMessage = 'Could not get response. Please try again.';
        if (error.message.includes('API key')) {
          errorMessage = 'Invalid API key. Please contact the administrator.';
        } else if (error.message.includes('503')) {
          errorMessage = 'The AI server is currently overloaded. Please try again later.';
        }
        setMessages((prev) => [...prev, { text: `Error: ${errorMessage}`, sender: 'bot' }]);
        setLoading(false);
        return;
      }
    }
  };

  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-xl mx-auto p-5 border border-gray-300 rounded-lg bg-gray-50">
      <h2 className="text-2xl font-bold text-center mb-4">AI Contact Chatbot</h2>
      <div className="h-96 overflow-y-auto p-3 border border-gray-200 rounded-md mb-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 m-2 rounded-lg ${
              msg.sender === 'user'
                ? 'bg-blue-600 text-white ml-20 text-right'
                : 'bg-gray-200 mr-20'
            }`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </div>
        ))}
        {loading && <div className="text-center text-blue-600">Loading... Please wait.</div>}
      </div>
      <div className="flex gap-3">
        <textarea
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={loading}
          className="flex-1 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className={`p-3 bg-blue-600 text-white rounded-md ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          <FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default Contact;