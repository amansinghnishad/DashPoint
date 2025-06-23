def summarize_text_content(text_content, summary_length="medium"):
    """
    Summarizes provided text content with specified length.
    
    Args:
        text_content (str): The text content to summarize
        summary_length (str): Length of summary - 'short', 'medium', 'long',
                             numeric value, or text with units (default: 'medium')
    
    Returns:
        str: Summary of the provided text content
    """
    try:
        if not text_content or not text_content.strip():
            return "Error: No text content provided"
        
        # Clean the text content
        cleaned_text = clean_text_content(text_content)
        
        # Determine target word count
        target_words = parse_summary_length_text(summary_length)
        
        # Generate summary
        summary = generate_summary_text(cleaned_text, target_words)
        
        return summary
        
    except Exception as e:
        return f"Error summarizing text: {str(e)}"

def clean_text_content(text_content):
    """Clean and preprocess text content"""
    import re
    
    # Remove extra whitespace and normalize
    text = re.sub(r'\s+', ' ', text_content.strip())
    
    # Remove special characters but keep punctuation
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)]', '', text)
    
    return text

def parse_summary_length_text(summary_length):
    """Parse summary length parameter and return target word count for text"""
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

def generate_summary_text(text, target_words):
    """Generate summary of specified length for text content"""
    sentences = split_into_sentences(text)
    
    if len(sentences) <= 2:
        return text
    
    words = text.split()
    if len(words) <= target_words:
        return text
    
    # Score sentences by position and word frequency
    sentence_scores = score_sentences(sentences, words)
    
    # Select top sentences
    avg_words_per_sentence = len(words) / len(sentences)
    target_sentences = max(1, int(target_words / avg_words_per_sentence))
    
    # Sort by score and take top sentences
    scored_sentences = list(zip(sentences, sentence_scores))
    scored_sentences.sort(key=lambda x: x[1], reverse=True)
    
    selected_sentences = [sent for sent, score in scored_sentences[:target_sentences]]
    
    # Reorder sentences to maintain original flow
    summary_sentences = []
    for sentence in sentences:
        if sentence in selected_sentences:
            summary_sentences.append(sentence)
    
    summary = ' '.join(summary_sentences)
    
    return summary

def split_into_sentences(text):
    """Split text into sentences"""
    import re
    
    # Simple sentence splitting
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]
    
    return sentences

def score_sentences(sentences, words):
    """Score sentences based on word frequency and position"""
    from collections import Counter
    
    # Calculate word frequencies
    word_freq = Counter(word.lower() for word in words if len(word) > 3)
    
    scores = []
    for i, sentence in enumerate(sentences):
        sentence_words = sentence.lower().split()
        
        # Score based on word frequency
        freq_score = sum(word_freq.get(word, 0) for word in sentence_words)
        
        # Bonus for position (first and last sentences often important)
        position_bonus = 0
        if i == 0 or i == len(sentences) - 1:
            position_bonus = freq_score * 0.2
        
        # Penalty for very short sentences
        length_penalty = 0
        if len(sentence_words) < 5:
            length_penalty = freq_score * 0.3
        
        total_score = freq_score + position_bonus - length_penalty
        scores.append(total_score)
    
    return scores
