# 🚀 Advanced RAG Course Recommendation System v2.0

A production-ready Flask-based API implementing state-of-the-art Retrieval-Augmented Generation (RAG) for course recommendations. Features enterprise-grade components including LangChain text processing, FAISS vector database, OpenAI embeddings, and LLM-powered personalization.

## ✨ Key Features

### 🔍 **Advanced Retrieval System**
- **LangChain Text Chunking**: Intelligent document splitting with overlap
- **FAISS Vector Database**: High-performance similarity search
- **OpenAI Embeddings**: 1536-dimensional embeddings for semantic understanding
- **Hybrid Retrieval**: Semantic + keyword-based matching
- **LLM Reranking**: Cross-encoder models for relevance scoring

### 🤖 **AI-Powered Personalization**
- **GPT-3.5/4 Integration**: Personalized recommendations and explanations
- **Content-Based Retrieval**: Focus on semantic meaning over keywords
- **Contextual Responses**: Detailed course analysis and suggestions
- **Multi-Modal Scoring**: Semantic, keyword, and reranking scores

### 📊 **Enterprise Features**
- **Comprehensive Course Database**: 50+ courses with detailed metadata
- **Caching System**: Redis-based embedding and response caching
- **Scalability**: Async processing and load balancing support
- **Advanced Logging**: Structured logging with performance metrics
- **Environment Configuration**: Secure API key management

### 🌐 **Deployment Ready**
- **Multi-Platform Support**: Heroku, Render, Railway, PythonAnywhere
- **Docker Compatible**: Container-ready configuration
- **Production Settings**: Gunicorn, environment variables, error handling
- **API Documentation**: Comprehensive endpoint documentation

## 📋 Setup that will be fine now and all is 0oakahy

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Run the application:
   ```bash
   python run.py
   ```

The server will start on `http://127.0.0.1:5000`

## 🎯 Advanced API Endpoints

### POST /recommend
**Enhanced course recommendations with LLM personalization**

**Request:**
```json
{
  "prompt": "I want to learn machine learning and AI",
  "top_k": 5,
  "user_preferences": {
    "difficulty": "intermediate",
    "duration": "3-6 months",
    "category": "artificial intelligence"
  }
}
```

**Parameters:**
- `prompt` (string, required): Natural language learning interests
- `top_k` (integer, optional): Results to return (1-20, default: 5)
- `user_preferences` (object, optional): Filtering preferences

**Response:**
```json
{
  "courses": [
    {
      "course_id": "CS101",
      "title": "Machine Learning with Python",
      "author": "Bob Johnson",
      "category": "Artificial Intelligence",
      "university": "Coursera - Stanford",
      "description": "Comprehensive ML course...",
      "difficulty": "intermediate",
      "price": 79,
      "relevance_score": 0.95,
      "content": "Course content preview..."
    }
  ],
  "personalized_explanation": "Based on your interest in machine learning...",
  "query": "machine learning and AI",
  "processing_time": 2.3,
  "total_results": 5,
  "timestamp": "2025-01-06T21:26:00Z"
}
```

### GET /health
**System health check**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-06T21:26:00Z",
  "version": "2.0.0"
}
```

### GET /courses
**Get all available courses**
```json
{
  "courses": [...],
  "total": 50,
  "timestamp": "2025-01-06T21:26:00Z"
}
```

## 🧠 How It Works

### 1. **Query Processing**
- User submits natural language prompt
- Prompt is processed for intent extraction

### 2. **Hybrid Retrieval**
- **Semantic Search**: Uses SentenceTransformer embeddings for meaning-based matching
- **Keyword Matching**: TF-IDF vectorization for exact term matching
- **Combined Scoring**: 70% semantic + 30% keyword weighting

### 3. **LLM-based Reranking**
- Top 20 candidates selected for reranking
- Cross-encoder model compares query-course pairs
- Improved relevance scoring using transformer architecture

### 4. **Final Ranking**
- Results sorted by final hybrid score
- Top-k recommendations returned with detailed metadata

## 📚 Course Database

Contains 50+ courses across categories:
- **Computer Science**: Algorithms, Data Structures, Computer Networks
- **Artificial Intelligence**: Machine Learning, Deep Learning, NLP, Computer Vision
- **Web Development**: JavaScript, React, GraphQL, Full-stack
- **Data Science**: Statistics, Big Data, Visualization
- **Security**: Cybersecurity, Ethical Hacking, Cryptography
- **DevOps**: Docker, Kubernetes, CI/CD
- **And more...**

Each course includes:
- Basic info: title, author, category, description, link
- Academic details: university, enrollment deadlines, start/end dates, exam dates
- Course metadata: duration, difficulty, prerequisites, certificate availability, pricing

## 🛠️ Technical Architecture

### Models Used
- **Embedding Model**: `all-MiniLM-L12-v2` (384 dimensions)
- **Reranking Model**: `cross-encoder/ms-marco-MiniLM-L-6-v2`
- **Keyword Matching**: TF-IDF with scikit-learn

### Vector Database
- **ChromaDB**: Persistent vector storage
- **Collection**: "courses" with metadata and embeddings
- **Similarity**: Cosine similarity for semantic matching

### Scoring System
- **Semantic Score**: Embedding-based similarity (0-100%)
- **Keyword Score**: TF-IDF matching score (0-100%)
- **Rerank Score**: Cross-encoder relevance score
- **Final Score**: Weighted combination for ranking

## 🎨 Web Interface

Visit `http://127.0.0.1:5000` for the interactive frontend:
- Clean, responsive design
- Real-time recommendations
- Detailed course information display
- Error handling and loading states

## 🌐 Live Demo & Testing

### **Web Interface**
Visit the live application: `https://your-app-name.herokuapp.com`

### **API Testing Examples**

```bash
# Replace YOUR_APP_NAME with your actual Heroku app name

# Machine Learning
curl -X POST https://your-app-name.herokuapp.com/recommend \
  -H "Content-Type: application/json" \
  -d '{"prompt": "machine learning algorithms", "top_k": 3}'

# Web Development
curl -X POST https://your-app-name.herokuapp.com/recommend \
  -H "Content-Type: application/json" \
  -d '{"prompt": "web development with JavaScript", "top_k": 2}'

# Cybersecurity
curl -X POST https://your-app-name.herokuapp.com/recommend \
  -H "Content-Type: application/json" \
  -d '{"prompt": "learn ethical hacking", "top_k": 3}'

# Data Science
curl -X POST https://your-app-name.herokuapp.com/recommend \
  -H "Content-Type: application/json" \
  -d '{"prompt": "data science and analytics", "top_k": 2}'
```

### **Local Testing (Development)**
```bash
# Test locally before deployment
curl -X POST http://127.0.0.1:5000/recommend \
  -H "Content-Type: application/json" \
  -d '{"prompt": "artificial intelligence", "top_k": 3}'
```

## 🔧 Dependencies

- **Flask**: Web framework
- **sentence-transformers**: Embedding generation and cross-encoding
- **chromadb**: Vector database
- **scikit-learn**: TF-IDF and machine learning utilities
- **numpy**: Numerical operations

## ⚙️ Environment Configuration

### Required Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-api-key-here
EMBEDDING_MODEL=text-embedding-ada-002
LLM_MODEL=gpt-3.5-turbo

# Application Settings
FLASK_ENV=production
PORT=5000
SECRET_KEY=your-secret-key-here

# Vector Database
FAISS_INDEX_PATH=./data/faiss_index

# Caching (Optional)
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

### Setup Instructions
1. **Copy `.env` file**: `cp .env.example .env`
2. **Add your OpenAI API key** to `.env`
3. **Configure other settings** as needed

## 🚀 Multi-Platform Deployment

### Heroku Deployment
```bash
# Install Heroku CLI
# Create Heroku app
heroku create your-rag-app
git push heroku main
heroku open
```

### Render Deployment
1. Connect GitHub repository
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `python run.py`
4. Deploy automatically

### Railway Deployment
1. Connect GitHub repository
2. Railway auto-detects Python
3. Deploy with one click

### Local Development
```bash
pip install -r requirements.txt
python run.py
```

## 📊 Performance Features

- **1536D OpenAI Embeddings** for superior semantic understanding
- **FAISS Vector Search** for lightning-fast similarity queries
- **LangChain Text Chunking** with intelligent document splitting
- **LLM Personalization** using GPT-3.5-turbo
- **Redis Caching** for embeddings and responses
- **Async Processing** for scalability
- **Comprehensive Logging** with performance metrics
- **Enterprise-grade Error Handling**

## 🚀 Deployment

### **Heroku Deployment**

1. **Install Heroku CLI** and login:
   ```bash
   heroku login
   ```

2. **Prepare the app**:
   ```bash
   cd gdgHack/univeral_RAG
   git init
   git add .
   git commit -m "Deploy RAG system"
   ```

3. **Create and deploy**:
   ```bash
   heroku create your-app-name
   git push heroku main
   ```

4. **Access your live app**:
   ```bash
   heroku open
   ```

### **Files for Deployment**
- ✅ `Procfile` - Heroku process definition
- ✅ `requirements.txt` - Python dependencies
- ✅ `runtime.txt` - Python version specification
- ✅ `.gitignore` - Excludes unnecessary files

### **Live URL**
Once deployed, your app will be available at:
`https://your-app-name.herokuapp.com`

**Note**: First request may take 30-60 seconds as models load.