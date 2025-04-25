from deepeval.test_case import LLMTestCase
from deepeval.metrics import FaithfulnessMetric
from deepeval.metrics import HallucinationMetric
# from deepeval.metrics import FactualityMetric
from deepeval.models.base_model import DeepEvalBaseLLM
# from models.llm import OpenRouterLLM
from models.gemini_model import model
from typing import Dict, List
# import asyncio
import os

# model = OpenRouterLLM(api_key=os.getenv("OPENROUTER_GEMMA_API_KEY"), temperature=0.1)

model = model


class EvalModel(DeepEvalBaseLLM):
    """Class to implement llm model for DeepEval"""
    def __init__(self, model):
        self.model = model

    def load_model(self):
        return self.model

    def generate(self, prompt: str) -> str:
        chat_model = self.load_model()
        return chat_model.invoke(prompt).content

    async def a_generate(self, prompt: str) -> str:
        chat_model = self.load_model()
        res = await chat_model.ainvoke(prompt)
        if hasattr(res, 'content'):
            return res.content
        return str(res)

    def get_model_name(self):
        return "evaluation_model"
    
eval_model = EvalModel(model=model)
    
    
def evaluate_response(query: str, response: str, contexts: List[str]) -> Dict:
    """Evaluate a response against contexts using DeepEval."""
    # Check if contexts is empty or None
    if not contexts:
        contexts = ["No specific context available for evaluation"]

    # Create a test case with the query, response, and contexts
    test_case = LLMTestCase(
        input=query,
        actual_output=response,
        context=contexts,
        retrieval_context=contexts
    )

    # Create metric instances - this is the updated approach
    faithfulness_metric = FaithfulnessMetric(threshold=0.7,model=eval_model,include_reason=True)
    hallucination_metric = HallucinationMetric(threshold=0.7,model=eval_model)

    # Evaluate metrics individually
    faithfulness_metric.measure(test_case)
    hallucination_metric.measure(test_case)

    # Return combined results
    return {
        "faithfulness": {
            "score": faithfulness_metric.score,
            "reason": faithfulness_metric.reason
        },
        "hallucination": {
            "score": hallucination_metric.score,
            "reason": hallucination_metric.reason
        }
    }
