import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models.evaluation_model import evaluate_response
from tools.personalized_financial_advisor import PersonalizedFinancialAdvisor
import json
from typing import List, Dict

def evaluate_financial_advice(query: str, user_id: str):
    """Get and evaluate a response from the financial advisor"""
    # 1. Create advisor instance
    advisor = PersonalizedFinancialAdvisor()
    
    # 2. Get context from the advisor's retrieve_context method
    contexts_dict = advisor.retrieve_context(query, user_id, top_k=10)
    
    # 3. Get vector contexts (these are the text chunks from documents)
    vector_contexts = contexts_dict.get("vector_contexts", [])
    
    # 4. Format the contexts dictionary for generating a response
    formatted_contexts = {
        "vector_contexts": vector_contexts,
        "graph_facts": contexts_dict.get("graph_facts", [])
    }
    
    # 5. Generate a response based on the query and contexts
    response = advisor.generate_personalized_response(query, user_id, formatted_contexts)
    
    # 6. Run the evaluation
    print(f"Query: {query}")
    print(f"Response: {response[:100]}...")  # Show first 100 chars of response
    
    evaluation_results = evaluate_response(query, response, vector_contexts)
    
    return {
        "query": query,
        "response": response,
        "contexts": vector_contexts,
        "evaluation": evaluation_results
    }

if __name__ == "__main__":
    # Example usage:
    user_id = "user_2w0DhNj0iOUVHrYotRFjOARLw4m"  # Use an existing user ID from your profiles
    
    # Get query from the most recent user interaction or use a new one
    try:
        profile_path = f"data/user_profiles/{user_id}.json"
        with open(profile_path, 'r') as f:
            user_profile = json.load(f)
            
        # Use the latest query from the user's interaction history if available
        if user_profile.get("interaction_history"):
            sample_query = user_profile["interaction_history"][-1]["query"]
            print(f"Using latest query from user history: '{sample_query}'")
        else:
            sample_query = "What investment strategies should I consider based on my risk profile?"
    except:
        sample_query = "What investment strategies should I consider based on my risk profile?"
    
    # Run evaluation
    results = evaluate_financial_advice(sample_query, user_id)
    
    # Save results if desired
    with open("evaluation_results.json", "w") as f:
        json.dump(results, f, indent=2)
