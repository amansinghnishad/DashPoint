"""YouTube transcript summarisation utilities."""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass
from typing import Iterable, List, Optional, Sequence, Tuple

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, TranscriptsDisabled


class YoutubeSummaryError(ValueError):
    """Raised when a YouTube summary cannot be produced."""


@dataclass(frozen=True)
class YoutubeSummarySettings:
    """Configuration for YouTube transcript summarisation."""

    target_words: int
    max_segments: int

    @classmethod
    def from_length(cls, summary_length: str) -> "YoutubeSummarySettings":
        presets = {
            "brief": 75,
            "short": 150,
            "medium": 300,
            "long": 600,
            "detailed": 800,
        }
        length = (summary_length or "medium").strip().lower()
        if length in presets:
            target_words = presets[length]
        else:
            numbers = re.findall(r"\d+", length)
            target_words = int(numbers[0]) if numbers else presets["medium"]
        target_words = max(60, min(target_words, 1200))
        max_segments = max(2, min(20, target_words // 80 + 1))
        return cls(target_words=target_words, max_segments=max_segments)


class YoutubeTranscriptProcessor:
    """Fetches transcripts and produces extractive summaries."""

    def __init__(self) -> None:
        self.video_patterns = [
            r"(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/v/)([^&\n?#]+)",
            r"youtube\.com/watch\?.*v=([^&\n?#]+)",
            r"youtube\.com/shorts/([^&\n?#]+)",
        ]
        self._indicator_phrases = {
            "today",
            "first",
            "next",
            "important",
            "key",
            "main",
            "basically",
            "so",
            "now",
            "remember",
            "tip",
            "trick",
            "step",
            "process",
            "we need",
            "you should",
        }

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def summarise(self, youtube_url: str, summary_length: str = "medium") -> str:
        settings = YoutubeSummarySettings.from_length(summary_length)
        video_id = self.extract_video_id(youtube_url)
        if not video_id:
            return "Error: Invalid YouTube URL format"

        transcript = self._get_transcript(video_id)
        if not transcript:
            return "Error: Could not retrieve transcript for this video"

        full_text = self._transcript_to_text(transcript)
        if not full_text:
            return "Error: Transcript is empty"

        summary = self._summarise_text(full_text, settings)
        return summary

    # ------------------------------------------------------------------
    # Transcript helpers
    # ------------------------------------------------------------------
    def extract_video_id(self, youtube_url: str) -> Optional[str]:
        for pattern in self.video_patterns:
            match = re.search(pattern, youtube_url)
            if match:
                return match.group(1)
        return None

    def _get_transcript(self, video_id: str):
        languages = ["en", "en-US", "en-GB"]
        try:
            transcripts = YouTubeTranscriptApi.list_transcripts(video_id)
        except (TranscriptsDisabled, NoTranscriptFound):
            transcripts = None

        if transcripts:
            for finder in (transcripts.find_manually_created_transcript, transcripts.find_generated_transcript):
                for language in languages:
                    try:
                        transcript = finder([language])
                        return transcript.fetch()
                    except NoTranscriptFound:
                        continue

            for transcript in transcripts:
                try:
                    return transcript.fetch()
                except Exception:
                    continue

        try:
            return YouTubeTranscriptApi.get_transcript(video_id)
        except Exception:
            return None

    def _transcript_to_text(self, transcript: List[dict]) -> str:
        cleaned_lines: List[str] = []
        for entry in transcript:
            text = entry.get("text", "").strip()
            if not text:
                continue
            text = re.sub(r"\[(Music|Applause|Laughter|Inaudible)\]", "", text, flags=re.IGNORECASE)
            cleaned_lines.append(text)

        full_text = " ".join(cleaned_lines)
        full_text = re.sub(r"\s+", " ", full_text)
        full_text = re.sub(r"\b([a-z])\s+([a-z])\s+([a-z])\b", r"\1\2\3", full_text)
        return full_text.strip()

    # ------------------------------------------------------------------
    # Summarisation pipeline
    # ------------------------------------------------------------------
    def _summarise_text(self, text: str, settings: YoutubeSummarySettings) -> str:
        segments = self._split_into_segments(text)
        if len(segments) <= 3:
            return text

        words = text.split()
        if len(words) <= settings.target_words:
            return text

        scores = self._score_segments(segments, words)
        selected = self._select_segments(segments, scores, settings)
        if not selected:
            return text

        ordered = sorted(selected, key=lambda item: item[2])
        summary = ". ".join(segment for segment, _score, _pos in ordered)
        summary = re.sub(r"\s+", " ", summary)
        if summary and not summary.endswith((".", "!", "?")):
            summary += "."
        return summary.strip().capitalize()

    def _split_into_segments(self, text: str) -> List[str]:
        initial_segments = re.split(r"[.!?]+\s+", text)
        segments: List[str] = []
        for segment in initial_segments:
            segment = segment.strip()
            if not segment or len(segment) < 20:
                continue
            if len(segment.split()) > 40:
                sub_segments = re.split(r"[,;]\s+", segment)
                segments.extend(sub.strip() for sub in sub_segments if len(sub.strip()) > 10)
            else:
                segments.append(segment)
        return segments

    def _score_segments(self, segments: Sequence[str], words: Sequence[str]) -> List[float]:
        clean_words = [re.sub(r"[^a-z0-9]", "", word.lower()) for word in words if len(word) > 2]
        frequencies = Counter(clean_words)
        total_segments = len(segments)

        scores: List[float] = []
        for index, segment in enumerate(segments):
            segment_tokens = [re.sub(r"[^a-z0-9]", "", token.lower()) for token in segment.split()]
            segment_tokens = [token for token in segment_tokens if len(token) > 2]
            if not segment_tokens:
                scores.append(0.0)
                continue

            base_score = sum(frequencies.get(token, 0) for token in segment_tokens) / len(segment_tokens)

            position_multiplier = 1.0
            if index < total_segments * 0.15:
                position_multiplier += 0.4
            elif index < total_segments * 0.3:
                position_multiplier += 0.2
            elif index > total_segments * 0.8:
                position_multiplier += 0.3

            length = len(segment_tokens)
            if 8 <= length <= 30:
                position_multiplier += 0.1
            elif length < 4:
                position_multiplier -= 0.3
            elif length > 40:
                position_multiplier -= 0.2

            indicator_bonus = sum(1 for phrase in self._indicator_phrases if phrase in segment.lower())
            score = base_score * position_multiplier + indicator_bonus * 0.5
            scores.append(score)

        return scores

    def _select_segments(
        self,
        segments: Sequence[str],
        scores: Sequence[float],
        settings: YoutubeSummarySettings,
    ) -> List[Tuple[str, float, int]]:
        ranked = sorted(
            ((segments[index], scores[index], index) for index in range(len(segments))),
            key=lambda item: item[1],
            reverse=True,
        )

        selected: List[Tuple[str, float, int]] = []
        used_positions: List[int] = []

        for segment, score, position in ranked:
            if len(selected) >= settings.max_segments:
                break
            if score <= 0:
                continue
            if used_positions and min(abs(position - existing) for existing in used_positions) < 2:
                continue
            selected.append((segment, score, position))
            used_positions.append(position)

        if len(selected) < settings.max_segments:
            for segment, score, position in ranked:
                if len(selected) >= settings.max_segments:
                    break
                if (segment, score, position) not in selected:
                    selected.append((segment, score, position))

        return selected


_DEFAULT_PROCESSOR = YoutubeTranscriptProcessor()


# ----------------------------------------------------------------------
# Legacy compatibility wrappers
# ----------------------------------------------------------------------

def summarize_youtube_video(youtube_url: str, summary_length: str = "medium") -> str:
    try:
        return _DEFAULT_PROCESSOR.summarise(youtube_url, summary_length)
    except YoutubeSummaryError as exc:
        return f"Error: {exc}"
    except Exception as exc:  # pragma: no cover - defensive guard
        return f"Error summarizing YouTube video: {exc}"


def extract_video_id_youtube(youtube_url: str) -> Optional[str]:
    return _DEFAULT_PROCESSOR.extract_video_id(youtube_url)


def get_transcript_with_fallback(video_id: str):
    return _DEFAULT_PROCESSOR._get_transcript(video_id)


def process_transcript_text(transcript: Iterable[dict]) -> str:
    return _DEFAULT_PROCESSOR._transcript_to_text(list(transcript) if transcript else [])


def parse_summary_length_youtube(summary_length: str) -> int:
    return YoutubeSummarySettings.from_length(summary_length).target_words


def generate_enhanced_youtube_summary(text: str, target_words: int) -> str:
    settings = YoutubeSummarySettings(target_words=target_words, max_segments=max(2, target_words // 80 + 1))
    return _DEFAULT_PROCESSOR._summarise_text(text, settings)


def split_video_content_into_segments(text: str) -> List[str]:
    return _DEFAULT_PROCESSOR._split_into_segments(text)


def score_video_content_segments(segments: Sequence[str], words: Sequence[str]) -> List[float]:
    return _DEFAULT_PROCESSOR._score_segments(segments, words)


def select_diverse_segments(scored_segments, target_count):
    ranked = sorted(scored_segments, key=lambda item: item[1], reverse=True)
    settings = YoutubeSummarySettings(target_words=target_count * 80, max_segments=target_count)
    return _DEFAULT_PROCESSOR._select_segments(
        [segment for segment, _score, _pos in ranked],
        [score for _segment, score, _pos in ranked],
        settings,
    )


def clean_summary_text(text: str) -> str:
    cleaned = re.sub(r"\s+", " ", text or "")
    if cleaned and not cleaned.endswith((".", "!", "?")):
        cleaned += "."
    return cleaned.strip().capitalize()
