import React, { useState, useRef, useEffect } from 'react'
import Message from './Message'
import './Chatbot.css'

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your Claremont Colleges AI assistant. I can help you with course planning, academic questions, and navigating your college experience. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')
  const [sessionId] = useState(`session-${Date.now()}`)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const progressMessages = [
    "Scanning HyperSchedule database...",
    "Scraping course catalog endpoints...",
    "Accessing RateMyProfessor API...",
    "Analyzing course requirements matrix...",
    "Checking schedule conflicts algorithm...",
    "Gathering professor ratings dataset...",
    "Processing academic data pipeline...",
    "Evaluating course difficulty metrics...",
    "Searching prerequisites graph...",
    "Reviewing graduation requirements tree...",
    "Initializing neural network models...",
    "Executing semantic search queries...",
    "Parsing JSON course metadata...",
    "Running NLP sentiment analysis...",
    "Optimizing recommendation engine...",
    "Calculating GPA impact vectors...",
    "Indexing professor review corpus...",
    "Validating schedule feasibility...",
    "Cross-referencing degree audits...",
    "Aggregating enrollment statistics...",
    "Compiling prerequisite dependencies...",
    "Normalizing grade distribution data...",
    "Executing machine learning inference...",
    "Processing natural language queries...",
    "Analyzing academic pathway graphs...",
    "Computing course similarity scores...",
    "Extracting key academic insights...",
    "Synthesizing comprehensive response..."
  ]

  const showProgressMessages = async () => {
    // Show dots for initial 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const shuffled = [...progressMessages].sort(() => 0.5 - Math.random())
    const selectedMessages = shuffled.slice(0, 8)
    
    for (let i = 0; i < selectedMessages.length; i++) {
      setProgressMessage(selectedMessages[i])
      // Vary timing: shorter for technical messages, longer for complex ones
      const baseDelay = selectedMessages[i].includes('neural network') || 
                       selectedMessages[i].includes('machine learning') ||
                       selectedMessages[i].includes('semantic search') ? 2000 : 1200
      await new Promise(resolve => setTimeout(resolve, baseDelay + Math.random() * 800))
    }
    setProgressMessage('')
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    showProgressMessages()

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId: sessionId
        })
      })

      const data = await response.json()

      if (response.ok) {
        const botMessage = {
          id: messages.length + 2,
          text: data.response,
          sender: 'bot',
          timestamp: new Date(),
          toolsUsed: data.toolsUsed
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error(data.error || 'Failed to get response')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage = {
        id: messages.length + 2,
        text: "I'm sorry, I'm having trouble connecting right now. Please make sure the backend server is running on port 3000 and try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      setProgressMessage('')
    }
  }

  const clearChat = async () => {
    try {
      await fetch('http://localhost:3000/chat/clear', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })

      setMessages([
        {
          id: 1,
          text: "Hi! I'm your Claremont Colleges AI assistant. I can help you with course planning, academic questions, and navigating your college experience. What would you like to know?",
          sender: 'bot',
          timestamp: new Date()
        }
      ])
    } catch (error) {
      console.error('Error clearing chat:', error)
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <div className="status-indicator"></div>
        <h3>AI Assistant</h3>
        <button onClick={clearChat} className="clear-button">
          Clear Chat
        </button>
      </div>
      
      <div className="messages-container">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="loading-message">
            <div className="message-bubble bot-message">
              {progressMessage ? (
                <div className="progress-text">
                  {progressMessage}
                </div>
              ) : (
                <div className="typing-indicator">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="input-form">
        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about courses, requirements, or academic planning..."
            className="message-input"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={isLoading || !inputValue.trim()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="m22 2-7 20-4-9-9-4z"/>
              <path d="m22 2-10 10"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}

export default Chatbot