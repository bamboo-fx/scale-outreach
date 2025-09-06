const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const ClassifyAIAgent = require('./lib/ai-agent');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize AI Agent
const agent = new ClassifyAIAgent();

// Store conversation sessions (in production, use Redis or database)
const sessions = new Map();

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    message: 'Classify AI Agent Backend is running',
    timestamp: new Date().toISOString()
  });
});

app.post('/chat', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Get or create conversation history
    let conversationHistory = sessions.get(sessionId) || [];
    
    // Process message with AI agent
    const result = await agent.processMessage(message, conversationHistory);
    
    // Update conversation history
    conversationHistory.push(
      { role: 'user', content: message },
      { role: 'assistant', content: result.response }
    );
    
    // Keep only last 10 messages to manage memory
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    sessions.set(sessionId, conversationHistory);

    res.json({
      response: result.response,
      sessionId: sessionId,
      toolsUsed: result.toolCalls.length > 0,
      toolResults: result.toolResults,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/chat/clear', (req, res) => {
  try {
    const { sessionId = 'default' } = req.body;
    sessions.delete(sessionId);
    
    res.json({ 
      message: 'Conversation history cleared',
      sessionId: sessionId 
    });
  } catch (error) {
    console.error('Clear endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/chat/sessions', (req, res) => {
  try {
    const sessionList = Array.from(sessions.keys()).map(sessionId => ({
      sessionId,
      messageCount: sessions.get(sessionId).length,
      lastActivity: new Date().toISOString() // Would track this properly in production
    }));
    
    res.json({ sessions: sessionList });
  } catch (error) {
    console.error('Sessions endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Development endpoints
app.get('/tools', (req, res) => {
  try {
    const tools = agent.tools.getToolDefinitions();
    res.json({ tools });
  } catch (error) {
    console.error('Tools endpoint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Classify AI Agent Backend running on port ${PORT}`);
  console.log(`📚 Ready to help with Claremont Colleges academic planning`);
});