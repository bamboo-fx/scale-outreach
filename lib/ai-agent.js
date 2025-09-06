const OpenAI = require('openai');
const AgentTools = require('./agent-tools');

class ClassifyAIAgent {
  constructor() {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    this.tools = new AgentTools();
    this.systemPrompt = `You are Classify, an AI academic advisor for the Claremont Colleges (Harvey Mudd, CMC, Pomona, Scripps, Pitzer).

Your expertise includes:
- Course planning and recommendations across all 5 Claremont Colleges
- Major requirements and graduation planning
- Cross-campus academic programs and opportunities
- Prerequisite checking and academic sequencing
- Semester and multi-year schedule planning

You have access to comprehensive course data and can help students with:
- Finding courses that match their interests and major requirements
- Planning optimal academic paths for single majors, double majors, and minors
- Checking prerequisites and course availability
- Building balanced semester schedules
- Validating graduation requirements

Always be helpful, accurate, and encouraging. When making recommendations:
1. Consider the student's academic goals and constraints
2. Suggest courses from appropriate colleges when beneficial
3. Explain your reasoning for course recommendations
4. Highlight unique cross-campus opportunities
5. Warn about prerequisite requirements or scheduling conflicts

Use your tools to access real course data whenever needed to provide specific, accurate information.`;
  }

  async processMessage(userMessage, conversationHistory = []) {
    try {
      const messages = [
        { role: 'system', content: this.systemPrompt },
        ...conversationHistory,
        { role: 'user', content: userMessage }
      ];

      // First, get the AI's response with potential tool calls
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-1106-preview',
        messages: messages,
        tools: this.tools.getToolDefinitions(),
        tool_choice: 'auto',
        temperature: 0.7,
        max_tokens: 1500
      });

      const assistantMessage = response.choices[0].message;
      
      // If the AI wants to use tools, execute them
      if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
        const toolResults = await this.executeToolCalls(assistantMessage.tool_calls);
        
        // Add the tool results to the conversation
        const messagesWithTools = [
          ...messages,
          assistantMessage,
          ...toolResults
        ];

        // Get the final response after tool execution
        const finalResponse = await this.openai.chat.completions.create({
          model: 'gpt-4-1106-preview',
          messages: messagesWithTools,
          temperature: 0.7,
          max_tokens: 1500
        });

        return {
          response: finalResponse.choices[0].message.content,
          toolCalls: assistantMessage.tool_calls,
          toolResults: toolResults.map(tr => JSON.parse(tr.content))
        };
      }

      // If no tools were called, return the direct response
      return {
        response: assistantMessage.content,
        toolCalls: [],
        toolResults: []
      };

    } catch (error) {
      console.error('AI Agent Error:', error);
      throw new Error(`AI processing failed: ${error.message}`);
    }
  }

  async executeToolCalls(toolCalls) {
    const toolResults = [];

    for (const toolCall of toolCalls) {
      try {
        const functionName = toolCall.function.name;
        const args = JSON.parse(toolCall.function.arguments);
        
        console.log(`Executing tool: ${functionName}`, args);
        
        const result = await this.tools.executeTool(functionName, args);
        
        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result)
        });

      } catch (error) {
        console.error(`Tool execution error for ${toolCall.function.name}:`, error);
        
        toolResults.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            success: false,
            error: error.message,
            message: `Failed to execute ${toolCall.function.name}`
          })
        });
      }
    }

    return toolResults;
  }

  // Helper method to handle common academic planning queries
  async planAcademicPath(params) {
    const { major, college, currentYear = 1, interests = [], constraints = {} } = params;
    
    try {
      // Get major requirements
      const majorReqs = await this.tools.getMajorRequirements({ 
        major_name: major, 
        college_code: college 
      });

      // Search for relevant courses
      const courses = await this.tools.searchCourses({ 
        major: major, 
        college: college, 
        limit: 50 
      });

      // Build a suggested path
      const planningData = {
        major_requirements: majorReqs,
        available_courses: courses,
        current_year: currentYear,
        interests: interests,
        constraints: constraints
      };

      return {
        success: true,
        planning_data: planningData,
        message: "Academic path planning data retrieved successfully"
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: "Failed to plan academic path"
      };
    }
  }
}

module.exports = ClassifyAIAgent;