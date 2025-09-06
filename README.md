# Classify - Claremont Colleges AI Academic Advisor

An AI-powered academic planning assistant for students at the Claremont Colleges (Harvey Mudd, CMC, Pomona, Scripps, Pitzer).

## Features

- **Intelligent Course Search**: Find courses across all 5 Claremont Colleges based on major, interests, or keywords
- **Academic Planning**: Get comprehensive graduation plans for single majors, double majors, and minors  
- **Prerequisite Checking**: Verify course prerequisites and academic sequencing
- **Schedule Building**: Generate balanced semester schedules with credit limits
- **Cross-Campus Programs**: Discover opportunities across the Claremont Consortium

## Architecture

- **AI Agent**: OpenAI GPT-4 with function calling for intelligent academic advising
- **Database**: Supabase PostgreSQL with comprehensive course catalog data
- **Backend**: Node.js/Express API server with conversation management
- **Tools**: 6 specialized functions for course search, requirements, and planning

## Quick Start

1. **Environment Setup**
```bash
cp .env.example .env
# Add your API keys to .env
```

2. **Install Dependencies**
```bash
npm install
```

3. **Database Setup**
- Create a Supabase project
- Run the schema from `database/schema.sql`
- Update your `.env` with Supabase credentials

4. **Populate Course Data**
```bash
node scrapers/scraper-manager.js all
```

5. **Start the Server**
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Chat with AI Agent
```
POST /chat
{
  "message": "What CS courses should I take at Harvey Mudd?",
  "sessionId": "optional-session-id"
}
```

### Health Check
```
GET /health
```

### Clear Conversation
```
POST /chat/clear
{
  "sessionId": "session-id"
}
```

### Development Endpoints
```
GET /tools        # List available AI agent tools
GET /chat/sessions # List active conversation sessions
```

## Agent Tools

The AI agent has access to these specialized functions:

1. **search_courses** - Find courses by major, college, level, or keywords
2. **get_major_requirements** - Get graduation requirements for specific majors
3. **check_prerequisites** - Verify course prerequisites and eligibility
4. **get_courses_in_department** - List all courses in a department
5. **build_semester_schedule** - Generate balanced semester schedules
6. **validate_graduation_path** - Check if planned courses meet requirements

## Example Queries

- "What computer science courses are available at Harvey Mudd?"
- "Help me plan a double major in CS and Math"
- "I've taken Calc 1 and Intro Programming. What should I take next?"
- "Can I take this advanced algorithms course?"
- "What are cross-campus opportunities for engineering students?"

## Testing

Run comprehensive agent tests:
```bash
node test/agent-test.js all
```

Run a single test:
```bash  
node test/agent-test.js single 0
```

List available tests:
```bash
node test/agent-test.js list
```

## Data Sources

Course data is collected from:
- Official college course catalogs
- HyperSchedule integration
- Major requirement sheets
- Cross-campus program listings

## Development

The codebase is organized as:
- `/lib` - Core AI agent and database services
- `/scrapers` - Course data collection scripts  
- `/database` - Database schema and setup
- `/test` - Agent testing utilities

## Next Steps

1. Expand scrapers for all 5 Claremont Colleges
2. Add real-time course availability data
3. Implement user authentication and personal planning
4. Build frontend chatbot interface
5. Add schedule conflict detection
6. Integrate with official college systems