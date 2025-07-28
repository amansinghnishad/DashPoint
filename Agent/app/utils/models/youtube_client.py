"""
Enhanced YouTube video summarization client for the DashPoint AI Agent.
This module provides improved YouTube content processing and transcript analysis.
"""

def summarize_youtube_video(youtube_url, summary_length="medium"):
    """
    Enhanced YouTube video summarization with improved transcript processing.
    
    Args:
        youtube_url (str): The YouTube video URL to summarize
        summary_length (str): Length of summary - 'short', 'medium', 'long', 
                             numeric value, or text with units (default: 'medium')
    
    Returns:
        str: Enhanced summary of the YouTube video content
    """
    try:
        # Import required libraries
        from youtube_transcript_api import YouTubeTranscriptApi
        
        # Extract video ID from URL
        video_id = extract_video_id_youtube(youtube_url)
        if not video_id:
            return "Error: Invalid YouTube URL format"
        
        # Get transcript with error handling for different languages
        transcript = get_transcript_with_fallback(video_id)
        if not transcript:
            return "Error: Could not retrieve transcript for this video"
        
        # Process transcript into clean text
        full_text = process_transcript_text(transcript)
        
        # Determine target word count
        target_words = parse_summary_length_youtube(summary_length)
        
        # Generate enhanced summary
        summary = generate_enhanced_youtube_summary(full_text, target_words)
        
        return summary
        
    except Exception as e:
        return f"Error summarizing YouTube video: {str(e)}"


def extract_video_id_youtube(youtube_url):
    """Extract video ID from YouTube URL with enhanced pattern matching"""
    import re
    
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/v/)([^&\n?#]+)',
        r'youtube\.com/watch\?.*v=([^&\n?#]+)',
        r'youtube\.com/shorts/([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, youtube_url)
        if match:
            return match.group(1)
    
    return None


def get_transcript_with_fallback(video_id):
    """Get transcript with language fallback options"""
    from youtube_transcript_api import YouTubeTranscriptApi
    from youtube_transcript_api._errors import TranscriptsDisabled, NoTranscriptFound
    
    try:
        # Try to get transcript in order of preference
        languages = ['en', 'en-US', 'en-GB']
        
        # First try manually created transcripts
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            
            # Look for manually created transcripts first
            for lang in languages:
                try:
                    transcript = transcript_list.find_manually_created_transcript([lang])
                    return transcript.fetch()
                except NoTranscriptFound:
                    continue
            
            # If no manual transcripts, try auto-generated
            for lang in languages:
                try:
                    transcript = transcript_list.find_generated_transcript([lang])
                    return transcript.fetch()
                except NoTranscriptFound:
                    continue
                    
            # If still no luck, get any available transcript
            available_transcripts = list(transcript_list)
            if available_transcripts:
                return available_transcripts[0].fetch()
                
        except (TranscriptsDisabled, NoTranscriptFound):
            pass
        
        # Last resort: try the simple method
        return YouTubeTranscriptApi.get_transcript(video_id)
        
    except Exception:
        return None


def process_transcript_text(transcript):
    """Process transcript entries into clean, readable text"""
    if not transcript:
        return ""
    
    # Combine transcript entries
    text_parts = []
    for entry in transcript:
        text = entry.get('text', '').strip()
        if text:
            # Clean up auto-generated transcript artifacts
            text = text.replace('[Music]', '').replace('[Applause]', '')
            text = text.replace('[Laughter]', '').replace('[Inaudible]', '')
            text_parts.append(text)
    
    full_text = " ".join(text_parts)
    
    # Additional cleaning
    import re
    
    # Remove duplicate spaces
    full_text = re.sub(r'\s+', ' ', full_text)
    
    # Fix common transcript issues
    full_text = re.sub(r'\b([a-z])\s+([a-z])\s+([a-z])\b', r'\1\2\3', full_text)  # Fix s p a c e d letters
    
    return full_text.strip()


def parse_summary_length_youtube(summary_length):
    """Parse summary length parameter with enhanced options"""
    import re
    
    # Enhanced predefined lengths for video content
    if summary_length.lower() == "short":
        return 150  # Suitable for quick overview
    elif summary_length.lower() == "medium":
        return 300  # Detailed but concise
    elif summary_length.lower() == "long":
        return 600  # Comprehensive summary
    elif summary_length.lower() == "brief":
        return 75   # Very short summary
    elif summary_length.lower() == "detailed":
        return 800  # Very detailed summary
    
    # Extract numeric value
    numbers = re.findall(r'\d+', summary_length)
    if numbers:
        return int(numbers[0])
    
    # Default to medium if parsing fails
    return 300


def generate_enhanced_youtube_summary(text, target_words):
    """Generate enhanced summary optimized for video content"""
    if not text or not text.strip():
        return "No content available to summarize"
    
    sentences = split_video_content_into_segments(text)
    
    if len(sentences) <= 3:
        return text
    
    words = text.split()
    if len(words) <= target_words:
        return text
    
    # Enhanced scoring for video content
    sentence_scores = score_video_content_segments(sentences, words)
    
    # Calculate target segments intelligently
    avg_words_per_sentence = len(words) / len(sentences)
    target_sentences = max(2, min(len(sentences), int(target_words / avg_words_per_sentence)))
    
    # Select best segments with position diversity
    scored_sentences = list(zip(sentences, sentence_scores, range(len(sentences))))
    scored_sentences.sort(key=lambda x: x[1], reverse=True)
    
    # Ensure we get segments from different parts of the video
    selected_segments = select_diverse_segments(scored_sentences, target_sentences)
    
    # Sort selected segments by original position to maintain flow
    selected_segments.sort(key=lambda x: x[2])
    
    summary_text = '. '.join([seg[0] for seg in selected_segments])
    
    # Clean up and finalize
    summary_text = clean_summary_text(summary_text)
    
    return summary_text


def split_video_content_into_segments(text):
    """Split video content into logical segments"""
    import re
    
    # Enhanced segmentation for video transcripts
    # Split on sentence boundaries but also consider natural pauses
    segments = re.split(r'[.!?]+\s+', text)
    
    # Further split very long segments
    final_segments = []
    for segment in segments:
        segment = segment.strip()
        if len(segment.split()) > 40:  # Split very long segments
            sub_segments = re.split(r'[,;]\s+', segment)
            final_segments.extend([s.strip() for s in sub_segments if len(s.strip()) > 10])
        elif len(segment) > 10:
            final_segments.append(segment)
    
    return final_segments


def score_video_content_segments(segments, words):
    """Score segments based on video content characteristics"""
    from collections import Counter
    import re
    
    # Calculate word frequencies
    clean_words = [re.sub(r'[^\w]', '', word.lower()) for word in words if len(word) > 2]
    word_freq = Counter(clean_words)
    
    # Video-specific important indicators
    video_indicators = [
        'today', 'first', 'next', 'important', 'key', 'main', 'basically',
        'so', 'now', 'here', 'this is', 'let me', 'going to', 'we need',
        'you should', 'remember', 'tip', 'trick', 'step', 'process'
    ]
    
    scores = []
    total_segments = len(segments)
    
    for i, segment in enumerate(segments):
        score = 0
        segment_words = [re.sub(r'[^\w]', '', word.lower()) for word in segment.split() if len(word) > 2]
        
        if not segment_words:
            scores.append(0)
            continue
        
        # Base frequency score
        freq_score = sum(word_freq.get(word, 0) for word in segment_words)
        score += freq_score / len(segment_words)
        
        # Position scoring for videos (beginning and key transition points)
        if i < total_segments * 0.15:  # Very beginning
            score *= 1.4
        elif i < total_segments * 0.3:  # Early content
            score *= 1.2
        elif i > total_segments * 0.8:  # Conclusion
            score *= 1.3
        
        # Video indicator bonus
        segment_lower = segment.lower()
        indicator_bonus = sum(1 for indicator in video_indicators if indicator in segment_lower)
        score += indicator_bonus * 0.5
        
        # Length optimization for video content
        segment_length = len(segment_words)
        if 8 <= segment_length <= 30:  # Optimal for video segments
            score *= 1.1
        elif segment_length < 4:
            score *= 0.7
        elif segment_length > 40:
            score *= 0.8
        
        scores.append(score)
    
    return scores


def select_diverse_segments(scored_segments, target_count):
    """Select segments ensuring diversity across the video"""
    if len(scored_segments) <= target_count:
        return scored_segments
    
    selected = []
    used_positions = set()
    
    # First, always include the highest scoring segment
    if scored_segments:
        selected.append(scored_segments[0])
        used_positions.add(scored_segments[0][2])
    
    # Then select remaining segments with position diversity
    for segment, score, position in scored_segments[1:]:
        if len(selected) >= target_count:
            break
        
        # Ensure some distance from already selected segments
        min_distance = 3 if len(scored_segments) > 20 else 1
        if not used_positions or min(abs(position - p) for p in used_positions) >= min_distance:
            selected.append((segment, score, position))
            used_positions.add(position)
    
    # Fill remaining slots if needed
    if len(selected) < target_count:
        for segment, score, position in scored_segments:
            if len(selected) >= target_count:
                break
            if (segment, score, position) not in selected:
                selected.append((segment, score, position))
    
    return selected


def clean_summary_text(text):
    """Clean and polish the final summary text"""
    import re
    
    # Remove duplicate spaces
    text = re.sub(r'\s+', ' ', text)
    
    # Ensure proper sentence endings
    if text and not text.endswith(('.', '!', '?')):
        text += '.'
    
    # Capitalize first letter
    if text:
        text = text[0].upper() + text[1:]
    
    # Fix common issues
    text = re.sub(r'\s+([.!?])', r'\1', text)  # Remove space before punctuation
    
    return text.strip()
