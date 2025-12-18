"""Utility helpers for extractive text summarisation."""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from typing import Iterable, List, Optional, Sequence, Set


_DEFAULT_STOP_WORDS: Set[str] = {
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
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those",
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
}

_IMPORTANT_INDICATORS = {
    "therefore",
    "however",
    "moreover",
    "furthermore",
    "in conclusion",
    "as a result",
    "consequently",
    "important",
    "significant",
    "key",
    "main",
    "primary",
    "essential",
}


class SummarizationError(ValueError):
    """Raised when summarisation input is invalid."""


@dataclass(frozen=True)
class SummarySettings:
    """Configuration describing the desired summary length."""

    target_words: int
    max_sentences: int

    @classmethod
    def from_length(cls, summary_length: str) -> "SummarySettings":
        length = (summary_length or "medium").strip().lower()
        presets = {"short": 75, "medium": 200, "long": 400}

        if length in presets:
            target_words = presets[length]
        else:
            numbers = re.findall(r"\d+", length)
            if numbers:
                target_words = max(30, min(int(numbers[0]), 600))
            else:
                target_words = presets["medium"]

        max_sentences = max(1, min(12, target_words // 60 + 1))
        return cls(target_words=target_words, max_sentences=max_sentences)


class TextSummarizer:
    """Simple extractive summariser with basic sentence scoring."""

    def __init__(self, stop_words: Optional[Iterable[str]] = None) -> None:
        self.stop_words = set(stop_words or _DEFAULT_STOP_WORDS)

    def summarize(self, text: str, settings: SummarySettings) -> str:
        cleaned_text = self.clean(text)
        if not cleaned_text:
            raise SummarizationError("No text content provided")

        sentences = self.split_into_sentences(cleaned_text)
        if len(sentences) <= 2:
            return cleaned_text

        words = cleaned_text.split()
        if len(words) <= settings.target_words:
            return cleaned_text

        scores = self.score_sentences(sentences, words)
        selected_sentences = self.select_sentences(sentences, scores, settings)
        if not selected_sentences:
            return cleaned_text

        summary = " ".join(selected_sentences)
        return summary.strip()

    def clean(self, text_content: str) -> str:
        text = re.sub(r"\s+", " ", (text_content or "").strip())
        text = re.sub(r"[^\w\s\.\,\!\?\;\:\-\(\)]", "", text)
        return text

    def split_into_sentences(self, text: str) -> List[str]:
        sentences = re.split(r"(?<=[.!?])\s+(?=[A-Z])", text)
        cleaned_sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
        return cleaned_sentences

    def score_sentences(self, sentences: Sequence[str], words: Sequence[str]) -> List[float]:
        clean_tokens = [self._clean_token(word) for word in words]
        clean_tokens = [token for token in clean_tokens if token and token not in self.stop_words]
        frequencies = Counter(clean_tokens)

        if not frequencies:
            return [0.0 for _ in sentences]

        total_sentences = len(sentences)
        scores: List[float] = []
        for index, sentence in enumerate(sentences):
            sentence_tokens = [self._clean_token(word) for word in sentence.split()]
            sentence_tokens = [token for token in sentence_tokens if token and token not in self.stop_words]
            if not sentence_tokens:
                scores.append(0.0)
                continue

            base_score = sum(frequencies.get(token, 0) for token in sentence_tokens)
            base_score /= len(sentence_tokens)

            position_multiplier = 1.0
            if index == 0:
                position_multiplier += 0.2
            elif index == total_sentences - 1:
                position_multiplier += 0.1
            elif index < total_sentences * 0.3:
                position_multiplier += 0.1

            length = len(sentence_tokens)
            if 10 <= length <= 25:
                position_multiplier += 0.1
            elif length < 5:
                position_multiplier -= 0.2
            elif length > 35:
                position_multiplier -= 0.1

            indicator_multiplier = 1.3 if any(
                indicator in sentence.lower() for indicator in _IMPORTANT_INDICATORS
            ) else 1.0

            scores.append(base_score * position_multiplier * indicator_multiplier)

        return scores

    def select_sentences(
        self,
        sentences: Sequence[str],
        scores: Sequence[float],
        settings: SummarySettings,
    ) -> List[str]:
        ranked = sorted(
            ((index, scores[index]) for index in range(len(sentences))),
            key=lambda item: item[1],
            reverse=True,
        )

        chosen_indices: List[int] = []
        for index, score in ranked:
            if len(chosen_indices) >= settings.max_sentences:
                break
            if score <= 0:
                continue
            if any(abs(index - existing) <= 1 for existing in chosen_indices):
                continue
            chosen_indices.append(index)

        if len(chosen_indices) < settings.max_sentences:
            for index, score in ranked:
                if len(chosen_indices) >= settings.max_sentences:
                    break
                if index not in chosen_indices:
                    chosen_indices.append(index)

        chosen_indices.sort()

        summary_sentences: List[str] = []
        word_count = 0
        for index in chosen_indices:
            sentence = sentences[index]
            summary_sentences.append(sentence)
            word_count += len(sentence.split())
            if word_count >= settings.target_words:
                break

        return summary_sentences

    @staticmethod
    def _clean_token(token: str) -> str:
        return re.sub(r"[^a-z0-9]", "", token.lower())


_DEFAULT_SUMMARIZER = TextSummarizer()


def summarize_text_content(text_content: str, summary_length: str = "medium") -> str:
    """Summarise *text_content* according to the requested *summary_length*."""

    try:
        if not text_content or not text_content.strip():
            raise SummarizationError("No text content provided")
        settings = SummarySettings.from_length(summary_length)
        return _DEFAULT_SUMMARIZER.summarize(text_content, settings)
    except SummarizationError as exc:
        return f"Error: {exc}"
    except Exception as exc:  # pragma: no cover - defensive guard
        return f"Error summarizing text: {exc}"


def clean_text_content(text_content: str) -> str:
    return _DEFAULT_SUMMARIZER.clean(text_content)


def parse_summary_length_text(summary_length: str) -> int:
    return SummarySettings.from_length(summary_length).target_words


def generate_summary_text(text: str, target_words: int) -> str:
    settings = SummarySettings(target_words=target_words, max_sentences=max(1, target_words // 60 + 1))
    return _DEFAULT_SUMMARIZER.summarize(text, settings)


def split_into_sentences(text: str) -> List[str]:
    return _DEFAULT_SUMMARIZER.split_into_sentences(text)


def score_sentences_improved(sentences: Sequence[str], words: Sequence[str]) -> List[float]:
    return _DEFAULT_SUMMARIZER.score_sentences(sentences, words)


def score_sentences(sentences: Sequence[str], words: Sequence[str]) -> List[float]:
    return _DEFAULT_SUMMARIZER.score_sentences(sentences, words)
