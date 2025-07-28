"""
Text summarization client - Legacy compatibility layer
This module provides backward compatibility while the system transitions to the new agent-based approach.
"""

def summarize_text_content(text_content, summary_length="medium"):
    """
    Legacy text summarization function - now uses improved algorithms
    
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
        
        # Generate summary using improved algorithm
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
    """Generate summary of specified length for text content using improved extractive summarization"""
    sentences = split_into_sentences(text)
    
    if len(sentences) <= 2:
        return text
    
    words = text.split()
    if len(words) <= target_words:
        return text
    
    # Improved sentence scoring algorithm
    sentence_scores = score_sentences_improved(sentences, words)
    
    # Select top sentences based on score and position
    avg_words_per_sentence = len(words) / len(sentences)
    target_sentences = max(1, int(target_words / avg_words_per_sentence))
    
    # Sort by score and take top sentences
    scored_sentences = list(zip(sentences, sentence_scores, range(len(sentences))))
    scored_sentences.sort(key=lambda x: x[1], reverse=True)
    
    # Select sentences but maintain some positional diversity
    selected_sentences = []
    selected_positions = []
    
    for sent, score, pos in scored_sentences[:target_sentences * 2]:  # Get more candidates
        if len(selected_sentences) >= target_sentences:
            break
        
        # Prefer sentences that aren't too close to already selected ones
        if not selected_positions or min(abs(pos - p) for p in selected_positions) > 1:
            selected_sentences.append(sent)
            selected_positions.append(pos)
    
    # If we don't have enough, fill with remaining top sentences
    if len(selected_sentences) < target_sentences:
        for sent, score, pos in scored_sentences:
            if len(selected_sentences) >= target_sentences:
                break
            if sent not in selected_sentences:
                selected_sentences.append(sent)
    
    # Reorder sentences to maintain original flow
    summary_sentences = []
    for sentence in sentences:
        if sentence in selected_sentences:
            summary_sentences.append(sentence)
    
    summary = ' '.join(summary_sentences)
    
    return summary


def split_into_sentences(text):
    """Split text into sentences with improved detection"""
    import re
    
    # Improved sentence splitting that handles abbreviations better
    sentences = re.split(r'(?<=[.!?])\s+(?=[A-Z])', text)
    
    # Filter out very short sentences and clean up
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]
    
    return sentences


def score_sentences_improved(sentences, words):
    """Improved sentence scoring algorithm"""
    from collections import Counter
    import re
    
    # Calculate word frequencies (excluding stop words)
    stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they'}
    
    # Clean and count words
    clean_words = [re.sub(r'[^\w]', '', word.lower()) for word in words if len(word) > 2]
    clean_words = [word for word in clean_words if word not in stop_words and len(word) > 2]
    word_freq = Counter(clean_words)
    
    sentence_scores = []
    total_sentences = len(sentences)
    
    for i, sentence in enumerate(sentences):
        score = 0
        sentence_words = [re.sub(r'[^\w]', '', word.lower()) for word in sentence.split()]
        sentence_words = [word for word in sentence_words if word not in stop_words and len(word) > 2]
        
        if not sentence_words:
            sentence_scores.append(0)
            continue
        
        # Word frequency score
        word_score = sum(word_freq.get(word, 0) for word in sentence_words)
        score += word_score / len(sentence_words)  # Average word frequency
        
        # Position bonus (sentences at beginning and end are often important)
        if i < total_sentences * 0.3:  # First 30%
            score *= 1.2
        elif i > total_sentences * 0.7:  # Last 30%
            score *= 1.1
        
        # Length penalty/bonus (prefer medium-length sentences)
        sentence_length = len(sentence_words)
        if 10 <= sentence_length <= 25:  # Optimal length
            score *= 1.1
        elif sentence_length < 5:  # Too short
            score *= 0.8
        elif sentence_length > 35:  # Too long
            score *= 0.9
        
        # Keyword indicators (sentences with certain words are often important)
        important_indicators = ['therefore', 'however', 'moreover', 'furthermore', 'in conclusion', 'as a result', 'consequently', 'important', 'significant', 'key', 'main', 'primary', 'essential']
        if any(indicator in sentence.lower() for indicator in important_indicators):
            score *= 1.3
        
        sentence_scores.append(score)
    
    return sentence_scores
    
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
