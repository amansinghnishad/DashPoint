def summarize_youtube_video(youtube_url, summary_length="medium"):
    """
    Summarizes a YouTube video using YouTube Data API v3 and AI analysis.
    
    Args:
        youtube_url (str): The YouTube video URL to summarize
        summary_length (str): Length of summary - 'short', 'medium', 'long' (default: 'medium')
    
    Returns:
        str: AI-powered summary of the YouTube video content
    """
    try:
        video_id = extract_video_id(youtube_url)
        if not video_id:
            return "Error: Invalid YouTube URL"
        
        video_data = get_youtube_video_details(video_id)
        if not video_data:
            return "Error: Could not retrieve video details"
        
        return generate_ai_summary(video_data, summary_length)
        
    except Exception as e:
        return f"Error summarizing video: {str(e)}"

def extract_video_id(youtube_url):
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



def get_youtube_video_details(video_id):
    """Get video details using YouTube Data API v3"""
    import os
    import requests
    import logging
    
    logger = logging.getLogger(__name__)
    
    # Ensure environment variables are loaded
    load_env_if_needed()
    
    api_key = os.getenv('YOUTUBE_API_KEY')
    logger.info(f"YouTube API key found: {bool(api_key)}")
    
    if not api_key:
        logger.error("YouTube API key not found in environment variables")
        raise Exception("YouTube API key not found in environment variables")
    
    # YouTube Data API v3 endpoint
    url = "https://www.googleapis.com/youtube/v3/videos"
    
    params = {
        'part': 'snippet,contentDetails,statistics',
        'id': video_id,
        'key': api_key
    }
    
    try:
        logger.info(f"Making request to YouTube API for video ID: {video_id}")
        response = requests.get(url, params=params, timeout=10)
        response.raise_for_status()
        
        data = response.json()
        
        if not data.get('items'):
            logger.warning(f"No video found for ID: {video_id}")
            return None
            
        logger.info(f"Successfully retrieved video details for: {data['items'][0]['snippet']['title']}")
        return data['items'][0]
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch video details: {str(e)}")
        raise Exception(f"Failed to fetch video details: {str(e)}")

def generate_ai_summary(video_data, summary_length):
    """Generate AI-powered summary based on video metadata using Gemini"""
    import os
    import google.generativeai as genai
    import logging
    
    logger = logging.getLogger(__name__)
    
    snippet = video_data.get('snippet', {})
    statistics = video_data.get('statistics', {})
    content_details = video_data.get('contentDetails', {})
    
    title = snippet.get('title', 'Unknown Title')
    description = snippet.get('description', '')
    channel_title = snippet.get('channelTitle', '')
    tags = snippet.get('tags', [])
    
    view_count = statistics.get('viewCount', '0')
    like_count = statistics.get('likeCount', '0')
    duration = content_details.get('duration', '')
    
    # Parse duration
    readable_duration = parse_duration(duration)
    
    # Try to use Gemini AI for intelligent summarization
    try:
        gemini_api_key = os.getenv('GEMINI_API_KEY')
        if gemini_api_key:
            genai.configure(api_key=gemini_api_key)
            
            # Prepare content for AI analysis
            content_for_analysis = f"""
            Video Title: {title}
            Channel: {channel_title}
            Duration: {readable_duration}
            Views: {format_number(int(view_count)) if view_count != '0' else 'Unknown'}
            Likes: {format_number(int(like_count)) if like_count != '0' else 'Unknown'}
            Tags: {', '.join(tags[:10]) if tags else 'None'}
            
            Description: {description[:2000] if description else 'No description available'}
            """
            
            # Create AI prompt based on summary length
            if summary_length.lower() == 'short':
                prompt = f"""
                Based on the YouTube video metadata below, write a concise 2-3 sentence summary that captures the main topic and purpose of this video.
                
                {content_for_analysis}
                
                Focus on what the video is about and why someone would watch it. Be direct and informative.
                """
            elif summary_length.lower() == 'long':
                prompt = f"""
                Based on the YouTube video metadata below, write a comprehensive summary (4-6 paragraphs) that includes:
                1. What the video is about and its main purpose
                2. Key topics and themes covered
                3. Target audience and content type
                4. Notable statistics and engagement
                5. Context about the creator/channel
                
                {content_for_analysis}
                
                Make it engaging and informative, as if you're explaining the video to someone who hasn't seen it.
                """
            else:  # medium
                prompt = f"""
                Based on the YouTube video metadata below, write a balanced summary (2-3 paragraphs) that covers:
                1. The main topic and purpose of the video
                2. Key themes and what viewers can expect
                3. Notable engagement or interesting facts
                
                {content_for_analysis}
                
                Write in a natural, engaging tone that gives readers a clear understanding of the video content.
                """
            
            # Generate AI summary
            model = genai.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt)
            
            if response and response.text:
                logger.info("Successfully generated AI summary using Gemini")
                return response.text.strip()
                
    except Exception as e:
        logger.warning(f"AI summarization failed, falling back to structured metadata: {str(e)}")
    
    # Fallback: Generate structured metadata summary if AI fails
    logger.info("Using fallback structured metadata summary")
    return generate_fallback_summary(video_data)

def generate_fallback_summary(video_data):
    """Generate structured summary from metadata as fallback"""
    snippet = video_data.get('snippet', {})
    statistics = video_data.get('statistics', {})
    content_details = video_data.get('contentDetails', {})
    
    title = snippet.get('title', 'Unknown Title')
    description = snippet.get('description', '')
    channel_title = snippet.get('channelTitle', '')
    tags = snippet.get('tags', [])
    
    view_count = statistics.get('viewCount', '0')
    like_count = statistics.get('likeCount', '0')
    duration = content_details.get('duration', '')
    
    # Parse duration
    readable_duration = parse_duration(duration)
    
    # Generate structured summary
    summary_parts = []
    
    # Basic info
    summary_parts.append(f"📺 **{title}**")
    summary_parts.append(f"📱 Channel: {channel_title}")
    
    if readable_duration:
        summary_parts.append(f"⏱️ Duration: {readable_duration}")
    
    if view_count != '0':
        summary_parts.append(f"👁️ Views: {format_number(int(view_count))}")
    
    # Description-based content analysis
    if description:
        content_summary = extract_key_content(description)
        if content_summary:
            summary_parts.append(f"\n📋 **Content Overview:**\n{content_summary}")
    
    # Tags and topics
    if tags:
        relevant_tags = tags[:8]  # Limit to first 8 tags
        summary_parts.append(f"\n🏷️ **Key Topics:** {', '.join(relevant_tags)}")
    
    # Engagement metrics
    if like_count != '0':
        summary_parts.append(f"\n📊 **Engagement:** {format_number(int(like_count))} likes")
    
    return '\n'.join(summary_parts)

def extract_key_content(description):
    """Extract key content points from video description"""
    import re
    
    if not description or len(description) < 50:
        return description
    
    # Clean and split description
    sentences = re.split(r'[.!?]+', description)
    sentences = [s.strip() for s in sentences if s.strip() and len(s.strip()) > 10]
    
    if not sentences:
        return description[:300]
    
    # Extract key sentences (first few sentences usually contain main content)
    key_sentences = []
    for sentence in sentences[:3]:  # Focus on first 3 sentences
        # Skip sentences that look like social media links or promotional content
        if any(keyword in sentence.lower() for keyword in ['subscribe', 'like and subscribe', 'follow me', 'instagram', 'twitter', 'facebook']):
            continue
        
        key_sentences.append(sentence)
    
    result = '. '.join(key_sentences)
    return result + '.' if result and not result.endswith('.') else result or description[:300]

def parse_duration(duration):
    """Parse YouTube duration format (PT4M13S) to readable format"""
    import re
    
    if not duration:
        return ""
    
    # Parse ISO 8601 duration format
    match = re.match(r'PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?', duration)
    if not match:
        return duration
    
    hours, minutes, seconds = match.groups()
    hours = int(hours) if hours else 0
    minutes = int(minutes) if minutes else 0
    seconds = int(seconds) if seconds else 0
    
    if hours > 0:
        return f"{hours}:{minutes:02d}:{seconds:02d}"
    else:
        return f"{minutes}:{seconds:02d}"

def format_number(num):
    """Format large numbers for readability"""
    if num >= 1_000_000:
        return f"{num / 1_000_000:.1f}M"
    elif num >= 1_000:
        return f"{num / 1_000:.1f}K"
    else:
        return str(num)

def load_env_if_needed():
    """Ensure environment variables are loaded"""
    import os
    from pathlib import Path
    from dotenv import load_dotenv
    
    # Try to load .env if YOUTUBE_API_KEY is not found
    if not os.getenv('YOUTUBE_API_KEY'):
        current_file = Path(__file__)
        # Check Agent root directory for .env file
        env_file = current_file.parent.parent.parent.parent / '.env'
        
        if env_file.exists():
            load_dotenv(dotenv_path=env_file)
