import React from 'react'
import './Message.css'

const Message = ({ message }) => {
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={`message ${message.sender}`}>
      <div className={`message-bubble ${message.sender}-message ${message.isError ? 'error-message' : ''}`}>
        <div className="message-text">{message.text}</div>
        <div className="message-meta">
          <span className="message-time">{formatTime(message.timestamp)}</span>
          {message.toolsUsed && (
            <span className="tools-indicator" title="AI used tools to answer this question">
              🔧
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default Message