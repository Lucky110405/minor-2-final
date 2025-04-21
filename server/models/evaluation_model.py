from deepeval import evaluate
from models.llm import OpenRouterLLM
from typing import Dict, List
import os

def evaluate_response(query: str, response: str, contexts: List[str]) -> Dict:
    """Evaluate a response against contexts using DeepEval."""
    try:
        results = evaluate(
            input=query,
            actual_output=response,
            retrieval_context=contexts,
            metrics=["faithfulness", "hallucination"],
            llm=OpenRouterLLM(api_key=os.getenv("OPENROUTER_GEMMA_API_KEY"), temperature=0.1)
        )
        return results
    except ImportError:
        return {"error": "deepeval package not installed"}
    except Exception as e:
        print(f"Evaluation error: {str(e)}")
        return {"error": f"Evaluation failed: {str(e)}"}