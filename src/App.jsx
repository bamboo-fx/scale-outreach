import React from 'react'
import Chatbot from './components/Chatbot'
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="app-header">
        <h1>ClassifyAI</h1>
        <p>Get help with course planning and academic questions</p>
      </header>
      <main>
        <Chatbot />
      </main>
    </div>
  )
}

export default App