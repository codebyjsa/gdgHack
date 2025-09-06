"""
Advanced RAG Recommendation System
==================================

Features:
- LangChain text chunking
- FAISS vector database
- OpenAI embeddings
- LLM-powered personalization
- Content-based retrieval
- Caching and scalability
"""

import os
import json
import logging
import numpy as np
from typing import List, Dict, Any, Optional
from datetime import datetime

# Core RAG components
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import OpenAIEmbeddings
from langchain.vectorstores import FAISS
from langchain.docstore.document import Document

# OpenAI and LLM
import openai
from openai import OpenAI

# Vector database
import faiss

# Caching and async
import redis
from functools import lru_cache
import asyncio

# Environment configuration
from dotenv import load_dotenv
load_dotenv()

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('rag_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AdvancedRAGSystem:
    """Advanced RAG system with comprehensive features"""

    def __init__(self):
        self.setup_configuration()
        self.setup_clients()
        self.setup_text_processing()
        self.load_course_data()
        self.setup_vector_database()
        self.setup_caching()

    def setup_configuration(self):
        """Setup environment configuration"""
        self.config = {
            'openai_api_key': os.getenv('OPENAI_API_KEY'),
            'embedding_model': os.getenv('EMBEDDING_MODEL', 'text-embedding-ada-002'),
            'llm_model': os.getenv('LLM_MODEL', 'gpt-3.5-turbo'),
            'chunk_size': int(os.getenv('CHUNK_SIZE', '1000')),
            'chunk_overlap': int(os.getenv('CHUNK_OVERLAP', '200')),
            'max_retrieval': int(os.getenv('MAX_RETRIEVAL', '10')),
            'faiss_index_path': os.getenv('FAISS_INDEX_PATH', './data/faiss_index'),
            'redis_url': os.getenv('REDIS_URL', 'redis://localhost:6379'),
            'cache_ttl': int(os.getenv('CACHE_TTL', '3600'))
        }

        # Validate OpenAI API key
        if not self.config['openai_api_key']:
            raise ValueError("OPENAI_API_KEY environment variable is required")

    def setup_clients(self):
        """Setup OpenAI and Redis clients"""
        self.openai_client = OpenAI(api_key=self.config['openai_api_key'])

        try:
            self.redis_client = redis.from_url(self.config['redis_url'])
            self.redis_client.ping()
            logger.info("Redis connection established")
        except:
            logger.warning("Redis not available, using in-memory cache")
            self.redis_client = None

    def setup_text_processing(self):
        """Setup text processing components"""
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.config['chunk_size'],
            chunk_overlap=self.config['chunk_overlap'],
            separators=["\n\n", "\n", ". ", " ", ""]
        )

        self.embeddings = OpenAIEmbeddings(
            model=self.config['embedding_model'],
            openai_api_key=self.config['openai_api_key']
        )

    def load_course_data(self):
        """Load and process course data"""
        courses_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "courses.json")

        with open(courses_path, 'r') as f:
            self.courses = json.load(f)

        logger.info(f"Loaded {len(self.courses)} courses")

        # Create detailed documents for each course
        self.documents = []
        for course in self.courses:
            # Combine all course information into rich text
            course_text = self._create_course_document(course)
            doc = Document(
                page_content=course_text,
                metadata={
                    'course_id': course['id'],
                    'title': course['title'],
                    'author': course['author'],
                    'category': course['category'],
                    'university': course.get('university', ''),
                    'difficulty': course.get('difficulty', ''),
                    'price': course.get('price', 0),
                    'enrollment_deadline': course.get('enrollment_deadline', ''),
                    'start_date': course.get('start_date', ''),
                    'end_date': course.get('end_date', ''),
                    'exam_date': course.get('exam_date', '')
                }
            )
            self.documents.append(doc)

        logger.info(f"Created {len(self.documents)} course documents")

    def _create_course_document(self, course: Dict[str, Any]) -> str:
        """Create comprehensive text document from course data"""
        text_parts = [
            f"Course Title: {course['title']}",
            f"Author: {course['author']}",
            f"Category: {course['category']}",
            f"Description: {course['description']}",
            f"University: {course.get('university', 'Not specified')}",
            f"Difficulty: {course.get('difficulty', 'Not specified')}",
            f"Prerequisites: {course.get('prerequisites', 'None')}",
            f"Duration: {course.get('duration_weeks', 'Not specified')} weeks",
            f"Price: ${course.get('price', 0)}",
            f"Link: {course.get('link', '')}",
        ]

        # Add dates if available
        if course.get('start_date'):
            text_parts.append(f"Start Date: {course['start_date']}")
        if course.get('end_date'):
            text_parts.append(f"End Date: {course['end_date']}")
        if course.get('exam_date'):
            text_parts.append(f"Exam Date: {course['exam_date']}")
        if course.get('enrollment_deadline'):
            text_parts.append(f"Enrollment Deadline: {course['enrollment_deadline']}")

        return "\n".join(text_parts)

    def setup_vector_database(self):
        """Setup FAISS vector database"""
        try:
            # Try to load existing index
            self.vectorstore = FAISS.load_local(
                self.config['faiss_index_path'],
                self.embeddings
            )
            logger.info("Loaded existing FAISS index")
        except:
            # Create new index
            logger.info("Creating new FAISS index")
            self.vectorstore = FAISS.from_documents(
                self.documents,
                self.embeddings
            )

            # Save the index
            os.makedirs(os.path.dirname(self.config['faiss_index_path']), exist_ok=True)
            self.vectorstore.save_local(self.config['faiss_index_path'])
            logger.info("Saved FAISS index")

    def setup_caching(self):
        """Setup caching system"""
        self.cache = {}

    @lru_cache(maxsize=1000)
    def get_embedding(self, text: str) -> List[float]:
        """Get cached embeddings"""
        cache_key = f"embed_{hash(text)}"
        if self.redis_client:
            cached = self.redis_client.get(cache_key)
            if cached:
                return json.loads(cached)

        embedding = self.embeddings.embed_query(text)

        if self.redis_client:
            self.redis_client.setex(
                cache_key,
                self.config['cache_ttl'],
                json.dumps(embedding)
            )

        return embedding

    def retrieve_courses(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Retrieve relevant courses using semantic search"""
        try:
            # Perform similarity search
            docs = self.vectorstore.similarity_search_with_score(
                query,
                k=min(top_k * 2, len(self.documents))  # Get more for reranking
            )

            results = []
            for doc, score in docs:
                course_info = {
                    'course_id': doc.metadata['course_id'],
                    'title': doc.metadata['title'],
                    'author': doc.metadata['author'],
                    'category': doc.metadata['category'],
                    'description': doc.metadata.get('description', ''),
                    'university': doc.metadata.get('university', ''),
                    'difficulty': doc.metadata.get('difficulty', ''),
                    'price': doc.metadata.get('price', 0),
                    'relevance_score': float(score),
                    'content': doc.page_content[:500]  # First 500 chars
                }
                results.append(course_info)

            return results[:top_k]

        except Exception as e:
            logger.error(f"Error in course retrieval: {str(e)}")
            return []

    def generate_personalized_recommendation(
        self,
        query: str,
        retrieved_courses: List[Dict[str, Any]],
        user_preferences: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate personalized recommendation using LLM"""

        # Prepare context from retrieved courses
        courses_context = "\n\n".join([
            f"Course {i+1}: {course['title']} by {course['author']}\n"
            f"Category: {course['category']}\n"
            f"Description: {course['description']}\n"
            f"University: {course['university']}\n"
            f"Difficulty: {course['difficulty']}\n"
            f"Relevance Score: {course['relevance_score']:.3f}"
            for i, course in enumerate(retrieved_courses[:3])  # Top 3 for context
        ])

        # Build personalized prompt
        prompt = f"""
        Based on the user's query: "{query}"

        Here are the most relevant courses found:

        {courses_context}

        Please provide a personalized recommendation that includes:
        1. A brief explanation of why these courses match the user's interests
        2. Specific recommendations for which courses to take and in what order
        3. Any additional suggestions based on the course content and user preferences

        Keep the response helpful, concise, and focused on the course content.
        """

        try:
            response = self.openai_client.chat.completions.create(
                model=self.config['llm_model'],
                messages=[
                    {"role": "system", "content": "You are a helpful course recommendation assistant. Provide personalized, insightful recommendations based on course content and user interests."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )

            personalized_explanation = response.choices[0].message.content

            return {
                'courses': retrieved_courses,
                'personalized_explanation': personalized_explanation,
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'total_results': len(retrieved_courses)
            }

        except Exception as e:
            logger.error(f"Error generating personalized recommendation: {str(e)}")
            return {
                'courses': retrieved_courses,
                'personalized_explanation': "Unable to generate personalized explanation at this time.",
                'query': query,
                'timestamp': datetime.now().isoformat(),
                'total_results': len(retrieved_courses)
            }

    def recommend(self, query: str, top_k: int = 5, user_preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Main recommendation method"""
        start_time = datetime.now()

        # Retrieve relevant courses
        retrieved_courses = self.retrieve_courses(query, top_k)

        if not retrieved_courses:
            return {
                'error': 'No relevant courses found',
                'query': query,
                'timestamp': datetime.now().isoformat()
            }

        # Generate personalized recommendation
        result = self.generate_personalized_recommendation(
            query,
            retrieved_courses,
            user_preferences
        )

        # Add processing time
        processing_time = (datetime.now() - start_time).total_seconds()
        result['processing_time'] = round(processing_time, 2)

        logger.info(f"Processed recommendation for query: '{query}' in {processing_time:.2f}s")
        return result

# Global instance
rag_system = None

def get_rag_system():
    """Get or create RAG system instance"""
    global rag_system
    if rag_system is None:
        rag_system = AdvancedRAGSystem()
    return rag_system

def recommend(query: str, top_k: int = 5, **kwargs) -> Dict[str, Any]:
    """Main recommendation function for Flask integration"""
    try:
        system = get_rag_system()
        return system.recommend(query, top_k, kwargs.get('user_preferences'))
    except Exception as e:
        logger.error(f"Recommendation error: {str(e)}")
        return {
            'error': f'System error: {str(e)}',
            'query': query,
            'timestamp': datetime.now().isoformat()
        }

if __name__ == "__main__":
    # Test the system
    system = AdvancedRAGSystem()
    result = system.recommend("machine learning algorithms", top_k=3)
    print(json.dumps(result, indent=2))