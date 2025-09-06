import json
import chromadb
from sentence_transformers import SentenceTransformer, CrossEncoder
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load high-dimensional embedding model for better precision
model = SentenceTransformer("all-MiniLM-L12-v2")  # 384 dimensions, more layers for better understanding

# Load cross-encoder for reranking
cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')

# Load course data
import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # univeral_RAG folder
COURSES_PATH = os.path.join(BASE_DIR, "courses.json")

with open(COURSES_PATH, "r") as f:
    COURSES = json.load(f)

# Create detailed text descriptions for better embeddings
course_texts = []
for course in COURSES:
    text = f"{course['title']} {course['description']} {course['category']} {course['university']} {course['difficulty']} {course.get('prerequisites', '')}"
    course_texts.append(text)

# Set up TF-IDF vectorizer for keyword matching
tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=5000)
tfidf_matrix = tfidf_vectorizer.fit_transform(course_texts)

# Set up Chroma client - use in-memory for cloud deployment
# Heroku has ephemeral file system, so we recreate the database on each startup
client = chromadb.EphemeralClient()  # Use in-memory client for cloud

# Create collection (always recreate for cloud deployment)
collection_name = "courses"
collection = client.create_collection(name=collection_name)

# Add documents with enhanced metadata
documents = [f"{c['title']} {c['description']} {c['category']} {c.get('university', '')}" for c in COURSES]
embeddings = model.encode(documents).tolist()
ids = [str(c['id']) for c in COURSES]
metadatas = [{
    "title": c["title"],
    "author": c["author"],
    "category": c["category"],
    "description": c["description"],
    "link": c["link"],
    "university": c.get("university", ""),
    "enrollment_deadline": c.get("enrollment_deadline", ""),
    "start_date": c.get("start_date", ""),
    "end_date": c.get("end_date", ""),
    "exam_date": c.get("exam_date", ""),
    "difficulty": c.get("difficulty", ""),
    "price": c.get("price", 0)
} for c in COURSES]

collection.add(
    embeddings=embeddings,
    documents=documents,
    metadatas=metadatas,
    ids=ids
)

def run(inputs: dict, extra_params: dict = None) -> dict:
    """
    Input: {"prompt": "...", "top_k": 3}
    Output: {"recommendations": [{"id": 1, "title": "...", "author": "...", "category": "...", "description": "...", "link": "...", "score": 90}, ...]}
    """
    try:
        prompt = inputs.get("prompt", "")
        top_k = inputs.get("top_k", 3)

        if not prompt:
            return {"error": "No prompt provided"}

        if not isinstance(top_k, int) or top_k < 1:
            return {"error": "top_k must be a positive integer"}

        # Encode prompt for semantic search
        query_embed = model.encode(prompt).tolist()
    
        # TF-IDF keyword matching
        query_tfidf = tfidf_vectorizer.transform([prompt])
        tfidf_scores = cosine_similarity(query_tfidf, tfidf_matrix)[0]
    
        # Query Chroma for semantic search
        results = collection.query(
            query_embeddings=[query_embed],
            n_results=len(COURSES),  # Get all for hybrid scoring
            include=['metadatas', 'distances']
        )
    
        if not results['ids'] or not results['ids'][0]:
            return {"error": "No recommendations found"}
    
        # Combine semantic and keyword scores
        hybrid_scores = []
        for i, (metadata, distance) in enumerate(zip(results['metadatas'][0], results['distances'][0])):
            course_id = int(results['ids'][0][i])
            # Convert Chroma distance to similarity
            semantic_score = max(0, 1 - distance)
            # Get TF-IDF score for this course
            keyword_score = tfidf_scores[course_id - 1]  # IDs start from 1
    
            # Hybrid score: weighted combination (70% semantic, 30% keyword)
            hybrid_score = 0.7 * semantic_score + 0.3 * keyword_score
    
            hybrid_scores.append({
                "id": course_id,
                "title": metadata["title"],
                "author": metadata["author"],
                "category": metadata["category"],
                "description": metadata["description"],
                "link": metadata["link"],
                "university": metadata.get("university", ""),
                "enrollment_deadline": metadata.get("enrollment_deadline", ""),
                "start_date": metadata.get("start_date", ""),
                "end_date": metadata.get("end_date", ""),
                "exam_date": metadata.get("exam_date", ""),
                "difficulty": metadata.get("difficulty", ""),
                "price": metadata.get("price", 0),
                "score": hybrid_score,
                "semantic_score": semantic_score,
                "keyword_score": keyword_score
            })
    
        # Sort by hybrid score and get top candidates for reranking
        hybrid_scores.sort(key=lambda x: x['score'], reverse=True)
        top_candidates = hybrid_scores[:min(20, len(hybrid_scores))]  # Get top 20 for reranking
    
        # Prepare data for cross-encoder reranking
        query_doc_pairs = []
        for candidate in top_candidates:
            course_text = course_texts[candidate['id'] - 1]  # Get full course text
            query_doc_pairs.append([prompt, course_text])
    
        # Get cross-encoder scores and normalize them
        if query_doc_pairs:
            rerank_scores = cross_encoder.predict(query_doc_pairs)
    
            # Normalize rerank scores to 0-100 range
            rerank_min = min(rerank_scores)
            rerank_max = max(rerank_scores)
            rerank_range = rerank_max - rerank_min if rerank_max != rerank_min else 1
    
            # Update scores with reranking
            for i, candidate in enumerate(top_candidates):
                # Normalize rerank score to 0-100
                normalized_rerank = ((rerank_scores[i] - rerank_min) / rerank_range) * 100
                candidate['rerank_score'] = max(0, min(100, normalized_rerank))
    
                # Ensure semantic and keyword scores are in 0-100 range
                candidate['semantic_score'] = max(0, min(100, candidate['semantic_score'] * 100))
                candidate['keyword_score'] = max(0, min(100, candidate['keyword_score'] * 100))
    
                # Recalculate hybrid score with normalized components
                candidate['score'] = 0.7 * candidate['semantic_score'] + 0.3 * candidate['keyword_score']
    
                # Final score: combination of normalized hybrid and rerank scores
                candidate['final_score'] = 0.6 * candidate['score'] + 0.4 * candidate['rerank_score']
    
            # Sort by final score
            top_candidates.sort(key=lambda x: x['final_score'], reverse=True)
    
        # Take final top_k recommendations
        recommendations = top_candidates[:top_k]
    
        # Ensure all scores are in 0-100 range and clean up response
        for rec in recommendations:
            rec['score'] = max(0, min(100, int(rec['final_score'])))
            rec['semantic_score'] = max(0, min(100, int(rec['semantic_score'])))
            rec['keyword_score'] = max(0, min(100, int(rec['keyword_score'])))
            rec['rerank_score'] = max(0, min(100, int(rec['rerank_score'])))
            # Remove internal fields
            del rec['final_score']
    
        return {"recommendations": recommendations}
    except Exception as e:
        return {"error": f"An error occurred: {str(e)}"}
