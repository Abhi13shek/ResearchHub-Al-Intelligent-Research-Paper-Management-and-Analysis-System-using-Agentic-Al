# ResearchHubAi-
ResearchHub AI is a cutting-edge agentic AI platform designed to revolutionize how researchers discover, organize, and analyze academic literature. Built with modern technologies and powered by Groq's Llama 3.3 70B model, it transforms the tedious process of research paper management into an intelligent, conversational experience.
🔬 ResearchHub AI
Intelligent Research Paper Management and Analysis System using Agentic AI

React
TypeScript
FastAPI
Groq
License

📖 About The Project
ResearchHub AI is a cutting-edge agentic AI platform designed to revolutionize how researchers discover, organize, and analyze academic literature. Built with modern technologies and powered by Groq's Llama 3.3 70B model, it transforms the tedious process of research paper management into an intelligent, conversational experience.

🌟 Why ResearchHub AI?
With the exponential growth of academic publications, researchers face overwhelming challenges:

📚 Information Overload: Thousands of new papers published daily across multiple databases

⏰ Time-Consuming Manual Work: Hours spent searching, downloading, and organizing papers

🔍 Difficult Knowledge Extraction: Reading through extensive literature to find relevant insights

🗂️ Poor Organization: Papers scattered across folders with no intelligent categorization

💬 No Contextual Understanding: Traditional tools can't answer "What do these papers say about X?"

ResearchHub AI solves these problems by providing an intelligent agent that autonomously searches, organizes, and analyzes research papers while maintaining conversational context to deliver precise, synthesized insights.

✨ Key Features
🤖 Agentic AI Capabilities
Autonomous Research Assistant: AI agent that independently plans, reasons, and executes complex research tasks

Context-Aware Conversations: Maintains conversation history and builds upon previous discussions

Multi-Paper Synthesis: Analyzes and synthesizes information across multiple research papers

Intelligent Summarization: Generates comprehensive summaries highlighting key findings and methodologies

🔎 Smart Paper Discovery
Semantic Search: Vector embedding-based search that understands conceptual similarity, not just keywords

Multi-Database Integration: Searches across arXiv, PubMed, and other academic repositories

One-Click Import: Seamlessly import papers with complete metadata into personal workspaces

Real-Time Results: Fast, responsive search powered by optimized FastAPI backend

📁 Intelligent Organization
Multi-Workspace Support: Create separate workspaces for different research projects or topics

Context-Specific AI: Each workspace maintains its own conversation context and research history

Paper Management: Import, organize, and categorize papers with intuitive UI

Conversation History: Track your research journey and revisit previous insights

💬 Interactive AI Chatbot
Natural Language Queries: Ask questions in plain English about your research collection

Contextual Answers: AI accesses relevant paper content to provide accurate, specific responses

Comparative Analysis: "Compare the methodologies used in papers A and B"

Insight Extraction: "What are the main criticisms of approach X across these papers?"

🔒 Security & Authentication
JWT-Based Authentication: Secure user sessions with industry-standard tokens

Private Workspaces: Each user's research data is completely isolated and secure

Environment-Based Configuration: Sensitive credentials managed through environment variables

🛠️ Tech Stack
Frontend
React 18+ with TypeScript for type-safe, component-based UI

Tailwind CSS for modern, responsive styling

React Router for seamless navigation

Axios for efficient API communication

Backend
FastAPI (Python) for high-performance async API endpoints

Uvicorn as ASGI server for production-ready deployment

SQLAlchemy for database ORM and migrations

Python-Jose for JWT token generation and validation

Passlib for secure password hashing with bcrypt

AI & ML
Groq API with Llama 3.3 70B model for ultra-fast LLM inference

Sentence Transformers for generating vector embeddings

Vector Database for semantic search capabilities

NumPy for efficient numerical operations

Database
PostgreSQL for relational data (users, workspaces, conversations)

Vector Database (Pinecone/Weaviate/ChromaDB) for embeddings and semantic search

🚀 Quick Start
Prerequisites
Python 3.9+

Node.js 18+ and npm/yarn

PostgreSQL database

Groq API Key (Get one here)

Installation
1. Clone the repository
bash
git clone https://github.com/yourusername/researchhub-ai.git
cd researchhub-ai
2. Backend Setup
bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
GROQ_API_KEY=your_groq_api_key_here
SECRET_KEY=your_secret_key_here
DATABASE_URL=postgresql://user:password@localhost/researchhub
EOF

# Run migrations (if applicable)
alembic upgrade head

# Start backend server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
3. Frontend Setup
bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
REACT_APP_API_URL=http://localhost:8000
EOF

# Start development server
npm run dev
4. Access the Application
Open your browser and navigate to:

Frontend: http://localhost:3000

Backend API Docs: http://localhost:8000/docs

📚 Usage
1. Register & Login
Create an account and securely log in to access your personal research workspace.

2. Search for Papers
Use the intelligent search interface to find relevant academic papers across multiple databases. Enter keywords or research questions, and the AI will retrieve the most relevant papers.

3. Import to Workspace
Click "Import" to add papers to your workspace. The system automatically extracts and stores metadata including title, authors, abstract, and publication details.

4. Chat with Your Papers
Interact with the AI chatbot to:

Get Summaries: "Summarize the key findings of paper X"

Ask Questions: "What methodology did the authors use in paper Y?"

Compare Papers: "What are the differences between these two approaches?"

Extract Insights: "What are the limitations mentioned across all papers?"

5. Organize Research
Create multiple workspaces for different projects, each maintaining its own collection of papers and conversation context.

🏗️ Project Structure
text
researchhub-ai/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── requirements.txt        # Python dependencies
│   ├── models/                 # SQLAlchemy database models
│   │   ├── user.py
│   │   ├── workspace.py
│   │   ├── paper.py
│   │   └── conversation.py
│   ├── routers/                # API route handlers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── papers.py          # Paper search & import
│   │   ├── chat.py            # AI chatbot endpoints
│   │   └── workspaces.py      # Workspace management
│   ├── utils/                  # Utility functions
│   │   ├── groq_client.py     # Groq API integration
│   │   ├── vector_store.py    # Vector database operations
│   │   └── auth_utils.py      # JWT and password utilities
│   └── tests/                  # Unit and integration tests
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── SearchPapers.tsx
│   │   │   ├── Workspace.tsx
│   │   │   ├── Chatbot.tsx
│   │   │   └── Dashboard.tsx
│   │   ├── pages/              # Page-level components
│   │   ├── utils/              # Helper functions
│   │   │   ├── api.ts         # API client
│   │   │   └── auth.ts        # Auth utilities
│   │   ├── App.tsx             # Main app component
│   │   └── index.tsx           # Entry point
│   ├── package.json            # Node dependencies
│   └── tailwind.config.js      # Tailwind configuration
│
├── README.md
├── LICENSE
└── .gitignore
🎯 Use Cases
🎓 Academic Researchers
Quickly discover relevant papers in your field, organize them by research project, and get AI-powered insights without reading through hundreds of pages.

📊 PhD Students
Manage literature reviews efficiently by creating workspaces for different chapters or research questions, with AI assistance for synthesizing findings.

🏢 R&D Teams
Collaborate on research projects with organized workspaces, where team members can interact with the same paper collection and AI assistant.

📖 Independent Learners
Explore new research topics with an AI guide that helps you understand complex concepts and connections between papers.

🔮 Roadmap
 Collaborative Workspaces: Share workspaces with team members

 Citation Management: Export references in BibTeX, APA, MLA formats

 Advanced Visualizations: Research trend analysis and citation networks

 PDF Parsing: Direct PDF upload and text extraction

 Multi-Language Support: Papers in languages beyond English

 Mobile App: iOS and Android applications

 Browser Extension: One-click paper import while browsing

 Integration with Notion/Obsidian: Sync notes and highlights

🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License
Distributed under the MIT License. See LICENSE for more information.

📧 Contact
rohithkarthikeya05@gmail.com

Project Link: https://github.com/yourusername/researchhub-ai

🙏 Acknowledgments
Groq for providing ultra-fast LLM inference

FastAPI for the amazing Python web framework

React for the powerful frontend library

Tailwind CSS for beautiful, responsive styling

arXiv and PubMed for open access to research papers

⭐ Star History
If you find this project helpful, please consider giving it a star! ⭐

<div align="center"> <p>Built with ❤️ by researchers, for researchers</p> <p>© 2025 ResearchHub AI. All rights reserved.</p> </div>
