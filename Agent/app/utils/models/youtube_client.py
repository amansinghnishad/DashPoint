def summarize_youtube_video(youtube_url, summary_length="medium"):
    """
    Summarizes a YouTube video by extracting and analyzing its content.
    
    Args:
        youtube_url (str): The YouTube video URL to summarize
        summary_length (str): Length of summary - 'short', 'medium', 'long', 
                             numeric value, or text with units (default: 'medium')
    
    Returns:
        str: Summary of the YouTube video content
    """
    try:
        # Import required libraries
        from youtube_transcript_api import YouTubeTranscriptApi
        
        # Extract video ID from URL
        video_id = extract_video_id_youtube(youtube_url)
        if not video_id:
            return "Error: Invalid YouTube URL"
        
        # Get transcript
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        full_text = " ".join([entry['text'] for entry in transcript])
        
        # Determine target word count
        target_words = parse_summary_length_youtube(summary_length)
        
        # Generate summary
        summary = generate_summary_youtube(full_text, target_words)
        
        return summary
        
    except Exception as e:
        return f"Error summarizing video: {str(e)}"

def extract_video_id_youtube(youtube_url):
    """Extract video ID from YouTube URL"""
    import re
    patterns = [
        r'(?:youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)([^&\n?#]+)',
        r'youtube\.com/watch\?.*v=([^&\n?#]+)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, youtube_url)
        if match:
            return match.group(1)
    return None

def parse_summary_length_youtube(summary_length):
    """Parse summary length parameter and return target word count for YouTube"""
    import re
    
    # Predefined lengths
    if summary_length.lower() == "short":
        return 75  # 50-100 words average
    elif summary_length.lower() == "medium":
        return 200  # 150-250 words average
    elif summary_length.lower() == "long":
        return 400  # 300-500 words average
    
    # Extract numeric value
    numbers = re.findall(r'\d+', summary_length)
    if numbers:
        return int(numbers[0])
    
    # Default to medium if parsing fails
    return 200

def generate_summary_youtube(text, target_words):
    """Generate summary of specified length for YouTube content"""
    sentences = text.split('. ')
    
    if len(sentences) <= 3:
        return text
    
    # Calculate sentences needed based on average sentence length
    words = text.split()
    if len(words) <= target_words:
        return text
    
    avg_words_per_sentence = len(words) / len(sentences)
    target_sentences = max(1, int(target_words / avg_words_per_sentence))
    
    # Take evenly distributed sentences for better coverage
    if len(sentences) > target_sentences:
        step = len(sentences) // target_sentences
        selected_sentences = [sentences[i * step] for i in range(target_sentences)]
    else:
        selected_sentences = sentences[:target_sentences]
    
    summary = '. '.join(selected_sentences)
    
    # Ensure it ends properly
    if not summary.endswith('.'):
        summary += '.'
    
    return summary
