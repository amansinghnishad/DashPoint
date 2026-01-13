"""Gemini content-processing agent with function-calling support."""

from __future__ import annotations

import os
import re
from dataclasses import dataclass
from typing import Any, Dict, Iterable, List, Mapping, MutableMapping, Optional

import google.generativeai as genai
from google.generativeai.types import GenerationConfig

try:
	from google.generativeai.types import SafetySetting, HarmCategory  # type: ignore
	except_import_error = None
except ImportError as exc:  # pragma: no cover
	SafetySetting = None  # type: ignore
	HarmCategory = None  # type: ignore
	except_import_error = exc

from ..models.textsum_client import summarize_text_content
from ..models.youtube_client import summarize_youtube_video


@dataclass(frozen=True)
class FunctionDefinition:
	"""Serializable schema describing a callable tool."""

	name: str
	description: str
	parameters: Mapping[str, Any]

	def as_dict(self) -> Dict[str, Any]:
		return {
			"name": self.name,
			"description": self.description,
			"parameters": dict(self.parameters),
		}


class ContentProcessingAgent:
	"""High-level wrapper around the Gemini function-calling workflow."""

	MODEL_NAME = os.getenv("GEMINI_MODEL", "gemini-2.5-pro")
	GENERATION_CONFIG = GenerationConfig(temperature=0.7, max_output_tokens=2048)
	if SafetySetting is not None and HarmCategory is not None:
		SAFETY_SETTINGS = [
			SafetySetting(
				category=HarmCategory.HARM_CATEGORY_HARASSMENT,
				threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			),
			SafetySetting(
				category=HarmCategory.HARM_CATEGORY_HATE_SPEECH,
				threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			),
			SafetySetting(
				category=HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
				threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			),
			SafetySetting(
				category=HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
				threshold=SafetySetting.HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
			),
		]
	else:
		SAFETY_SETTINGS = None
	FUNCTION_DEFINITIONS: List[FunctionDefinition] = [
		FunctionDefinition(
			name="summarize_text_content",
			description="Summarize text content with specified length",
			parameters={
				"type": "object",
				"properties": {
					"text_content": {
						"type": "string",
						"description": "The text content to summarize",
					},
					"summary_length": {
						"type": "string",
						"description": "Length of summary: 'short', 'medium', 'long', or number",
						"default": "medium",
					},
				},
				"required": ["text_content"],
			},
		),
		FunctionDefinition(
			name="summarize_youtube_video",
			description="Summarize a YouTube video by analysing its transcript",
			parameters={
				"type": "object",
				"properties": {
					"youtube_url": {
						"type": "string",
						"description": "The YouTube video URL to summarize",
					},
					"summary_length": {
						"type": "string",
						"description": "Length of summary: 'short', 'medium', 'long', or number",
						"default": "medium",
					},
				},
				"required": ["youtube_url"],
			},
		),
		FunctionDefinition(
			name="extract_content_info",
			description="Extract key information from any content type",
			parameters={
				"type": "object",
				"properties": {
					"content": {
						"type": "string",
						"description": "The content to analyse",
					},
					"extract_type": {
						"type": "string",
						"description": "Type of extraction: 'summary', 'keywords', 'topics', 'sentiment'",
					},
				},
				"required": ["content", "extract_type"],
			},
		),
		FunctionDefinition(
			name="analyze_content_type",
			description="Analyse and determine the type of content provided",
			parameters={
				"type": "object",
				"properties": {
					"input_text": {
						"type": "string",
						"description": "The input text or URL to analyse",
					}
				},
				"required": ["input_text"],
			},
		),
	]

	def __init__(self) -> None:
		api_key = os.getenv("GEMINI_API_KEY")
		if not api_key:
			raise ValueError("GEMINI_API_KEY environment variable is required")

		genai.configure(api_key=api_key)
		self._model = genai.GenerativeModel(
			self.MODEL_NAME,
			generation_config=self.GENERATION_CONFIG,
			safety_settings=self.SAFETY_SETTINGS,
		)
		self.available_functions: Dict[str, Any] = {
			"summarize_text_content": self._summarize_text,
			"summarize_youtube_video": self._summarize_youtube,
			"extract_content_info": self._extract_content_info,
			"analyze_content_type": self._analyse_content_type,
		}

	# ------------------------------------------------------------------
	# Public API
	# ------------------------------------------------------------------
	def process_user_request(self, user_prompt: str) -> Dict[str, Any]:
		"""Execute a free-form user prompt through Gemini."""

		try:
			response = self._model.generate_content(user_prompt)
		except Exception as exc:  # pragma: no cover - handled gracefully
			return {"success": False, "error": str(exc), "results": []}

		results: List[Dict[str, Any]] = []
		for part in self._iter_response_parts(response):
			function_call = getattr(part, "function_call", None)
			if function_call:
				name = function_call.name
				arguments = dict(function_call.args or {})
				results.append(self._execute_function_call(name, arguments))
				continue

			text = getattr(part, "text", None)
			if text:
				results.append({"type": "text", "content": text})

		return {
			"success": True,
			"results": results,
			"response_id": getattr(response, "response_id", None),
		}

	# ------------------------------------------------------------------
	# Internal helpers
	# ------------------------------------------------------------------
	@staticmethod
	def _iter_response_parts(response: Any) -> Iterable[Any]:
		if not getattr(response, "candidates", None):
			return []
		for candidate in response.candidates:
			content = getattr(candidate, "content", None)
			if not content:
				continue
			for part in getattr(content, "parts", []) or []:
				yield part

	def _execute_function_call(self, function_name: str, arguments: MutableMapping[str, Any]) -> Dict[str, Any]:
		handler = self.available_functions.get(function_name)
		if not handler:
			return {"type": "unknown_function", "function": function_name}

		try:
			result_payload = handler(**arguments)
			return {
				"type": "function_result",
				"function": function_name,
				"args": dict(arguments),
				"result": result_payload,
			}
		except Exception as exc:  # pragma: no cover - defensive guard
			return {
				"type": "function_error",
				"function": function_name,
				"args": dict(arguments),
				"error": str(exc),
			}

	# ------------------------------------------------------------------
	# Function-call handlers
	# ------------------------------------------------------------------
	@staticmethod
	def _summarize_text(text_content: str, summary_length: str = "medium") -> Dict[str, Any]:
		summary = summarize_text_content(text_content, summary_length)
		return {
			"success": bool(summary and not summary.startswith("Error")),
			"summary": summary,
			"content_type": "text",
			"original_length": len(text_content.split()),
			"summary_length": summary_length,
		}

	@staticmethod
	def _summarize_youtube(youtube_url: str, summary_length: str = "medium") -> Dict[str, Any]:
		summary = summarize_youtube_video(youtube_url, summary_length)
		return {
			"success": bool(summary and not summary.startswith("Error")),
			"summary": summary,
			"content_type": "youtube",
			"video_url": youtube_url,
			"summary_length": summary_length,
		}

	def _extract_content_info(self, content: str, extract_type: str) -> Dict[str, Any]:
		dispatch = {
			"summary": lambda: self._summarize_text(content, "medium"),
			"keywords": lambda: self._extract_keywords(content),
			"topics": lambda: self._extract_topics(content),
			"sentiment": lambda: self._analyse_sentiment(content),
		}
		handler = dispatch.get(extract_type.lower())
		if not handler:
			return {"success": False, "error": f"Unknown extract_type: {extract_type}"}
		return handler()

	@staticmethod
	def _analyse_content_type(input_text: str) -> Dict[str, Any]:
		youtube_pattern = re.compile(
			r"(?:youtube\.com/(?:watch\?v=|embed/)|youtu\.be/)[^\s]+",
			re.IGNORECASE,
		)
		if youtube_pattern.search(input_text):
			return {
				"success": True,
				"content_type": "youtube",
				"url": input_text,
				"suggested_action": "summarize_youtube_video",
			}

		if re.search(r"https?://[^\s]+", input_text):
			return {
				"success": True,
				"content_type": "url",
				"url": input_text,
				"suggested_action": "extract_web_content",
			}

		return {
			"success": True,
			"content_type": "text",
			"suggested_action": "summarize_text_content",
		}

	@staticmethod
	def _extract_keywords(content: str) -> Dict[str, Any]:
		words = re.findall(r"\b[a-zA-Z]{3,}\b", content.lower())
		stop_words = {
			"the",
			"a",
			"an",
			"and",
			"or",
			"but",
			"in",
			"on",
			"at",
			"to",
			"for",
			"of",
			"with",
			"by",
			"from",
			"is",
			"are",
			"was",
			"were",
		}
		filtered = [word for word in words if word not in stop_words]
		counts: Dict[str, int] = {}
		for word in filtered:
			counts[word] = counts.get(word, 0) + 1
		top_keywords = sorted(counts, key=counts.get, reverse=True)[:10]
		return {"success": True, "keywords": top_keywords, "extract_type": "keywords"}

	@staticmethod
	def _extract_topics(content: str) -> Dict[str, Any]:
		sentences = [s.strip() for s in content.split(".") if len(s.strip()) > 20]
		topics = [
			sentence[:100] + "..." if len(sentence) > 100 else sentence
			for sentence in sentences[:5]
		]
		return {"success": True, "topics": topics, "extract_type": "topics"}

	@staticmethod
	def _analyse_sentiment(content: str) -> Dict[str, Any]:
		positive_words = {
			"good",
			"great",
			"excellent",
			"amazing",
			"wonderful",
			"fantastic",
			"positive",
			"love",
			"like",
			"happy",
			"pleased",
		}
		negative_words = {
			"bad",
			"terrible",
			"awful",
			"horrible",
			"negative",
			"hate",
			"dislike",
			"sad",
			"angry",
			"disappointed",
		}
		content_lower = content.lower()
		positive_count = sum(1 for word in positive_words if word in content_lower)
		negative_count = sum(1 for word in negative_words if word in content_lower)
		if positive_count > negative_count:
			sentiment = "positive"
		elif negative_count > positive_count:
			sentiment = "negative"
		else:
			sentiment = "neutral"
		return {
			"success": True,
			"sentiment": sentiment,
			"positive_score": positive_count,
			"negative_score": negative_count,
			"extract_type": "sentiment",
		}


_agent_instance: Optional[ContentProcessingAgent] = None


def get_content_processing_agent() -> ContentProcessingAgent:
	global _agent_instance
	if _agent_instance is None:
		_agent_instance = ContentProcessingAgent()
	return _agent_instance


def get_client_and_config():
	agent = get_content_processing_agent()
	return agent._model, agent.GENERATION_CONFIG


def register_functions():
	agent = get_content_processing_agent()
	return dict(agent.available_functions)
