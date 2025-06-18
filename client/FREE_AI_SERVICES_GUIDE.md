# Free AI Services for Text Formatting

This document provides a comprehensive guide to the free AI services integrated into DashPoint for enhanced text formatting and readability.

## Available Services

### 1. Hugging Face Inference API
**Status**: ✅ Already Configured  
**Free Tier**: 30,000 requests/month  
**Capabilities**: Summarization, keyword extraction, sentiment analysis, text generation  

### 2. LanguageTool API
**Status**: 🆓 No API Key Required  
**Free Tier**: 20 requests/minute  
**Capabilities**: Grammar checking, spell checking, style suggestions  

### 3. TextRazor API (Optional)
**Status**: 🔧 Configuration Required  
**Free Tier**: 500 requests/day  
**Capabilities**: Advanced text analysis, entity extraction, topic classification  

## Features

### AI-Powered Text Formatting
- **Grammar Correction**: Fix grammatical errors and typos
- **Punctuation Restoration**: Add missing punctuation marks
- **Sentence Simplification**: Break down complex sentences
- **Structure Improvement**: Better paragraph organization
- **Readability Enhancement**: Improve text clarity and flow
- **Text Cleaning**: Remove web artifacts and unwanted content

### Formatting Quality Indicators
- **Quality Score**: 0-100 rating of text readability
- **Confidence Score**: AI processing confidence level
- **Applied Improvements**: List of enhancements made
- **Processing Time**: Time taken for AI processing

### Smart Suggestions
- **Readability Issues**: Long sentences, complex structure
- **Grammar Problems**: Common grammatical errors
- **Structure Issues**: Poor paragraph organization
- **Priority Levels**: High, medium, low priority suggestions

## Setup Instructions

### Hugging Face (Already Configured)
Your Hugging Face token is already set up and working:
```
VITE_HUGGING_FACE_TOKEN=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
```

### LanguageTool (No Setup Required)
LanguageTool's public API is used without authentication for basic grammar checking.

### TextRazor (Optional Enhancement)
1. Visit [TextRazor](https://www.textrazor.com/plans)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to your `.env` file:
```
VITE_TEXTRAZOR_API_KEY=your_textrazor_api_key_here
```

## Usage Guide

### Using the AI Formatting Panel

1. **Extract content** from any webpage
2. **Click "AI Format"** button in the content viewer
3. **Select formatting options**:
   - ✅ Correct Grammar
   - ✅ Restore Punctuation
   - ✅ Simplify Sentences
   - ✅ Improve Structure
   - ✅ Enhance Readability
   - ✅ Clean Text

4. **Choose enhancement level**:
   - **Free AI Enhancement**: Uses LanguageTool + Hugging Face
   - **Advanced AI**: Uses premium Hugging Face models (if configured)

### Formatting Options Explained

#### Correct Grammar
- Fixes verb tense errors
- Corrects subject-verb agreement
- Fixes common grammatical mistakes
- Uses LanguageTool API for accurate corrections

#### Restore Punctuation
- Adds missing commas, periods, question marks
- Fixes spacing around punctuation
- Uses AI models trained on proper punctuation

#### Simplify Sentences
- Breaks down overly complex sentences
- Improves sentence flow and readability
- Maintains original meaning while enhancing clarity

#### Improve Structure
- Organizes text into logical paragraphs
- Improves transitions between ideas
- Enhances overall document structure

#### Enhance Readability
- Simplifies complex vocabulary when appropriate
- Improves sentence variety
- Optimizes text for better comprehension

#### Clean Text
- Removes web artifacts (ads, navigation, etc.)
- Eliminates duplicate content
- Standardizes formatting and spacing

## Free Service Limits

### Hugging Face Inference API
- **Monthly Limit**: 30,000 requests
- **Rate Limit**: No specific limit, but requests may queue
- **Models Available**: 
  - Grammar: `textattack/roberta-base-CoLA`
  - Punctuation: `felflare/bert-restore-punctuation`
  - Paraphrasing: `tuner007/pegasus_paraphrase`
  - Summarization: `facebook/bart-large-cnn`

### LanguageTool API
- **Rate Limit**: 20 requests per minute
- **Text Length**: Up to 20,000 characters per request
- **Languages**: 25+ languages supported
- **No API Key Required**: Public endpoint available

### TextRazor API (Optional)
- **Daily Limit**: 500 requests
- **Text Length**: Up to 200,000 characters per request
- **Advanced Features**: Entity extraction, topic classification
- **Requires**: Free registration and API key

## Best Practices

### 1. Optimize for Free Limits
- Process text in chunks if it's very long
- Use rate limiting to avoid hitting API limits
- Cache results to avoid repeated processing

### 2. Fallback Strategy
- Always have rule-based formatting as backup
- Apply basic text cleaning before AI processing
- Use multiple services for redundancy

### 3. Quality Control
- Check confidence scores before applying changes
- Allow users to preview changes before accepting
- Keep original text for comparison

### 4. Performance Tips
- Process shorter texts for faster results
- Use background processing for large documents
- Show processing progress to users

## Alternative Free Services

If you need additional capabilities, consider these alternatives:

### OpenAI GPT-3.5 Turbo (Paid but affordable)
- **Cost**: $0.002/1K tokens
- **Quality**: Excellent text formatting
- **Setup**: Add `VITE_OPENAI_API_KEY` to environment

### Google Cloud Natural Language API
- **Free Tier**: 5,000 units/month
- **Capabilities**: Entity analysis, sentiment, syntax
- **Good for**: Content analysis and structure

### IBM Watson Natural Language Understanding
- **Free Tier**: 30,000 API calls/month
- **Capabilities**: Advanced text analysis
- **Good for**: Enterprise-level text processing

## Troubleshooting

### Common Issues

#### "Hugging Face token not configured"
- Check that `VITE_HUGGING_FACE_TOKEN` is set in `.env`
- Verify token is valid and not expired
- Restart development server after changing `.env`

#### "LanguageTool API error"
- Check internet connection
- Reduce text length if over 20,000 characters
- Wait if rate limit is exceeded (20 requests/minute)

#### Low confidence scores
- Text may be too short or already well-formatted
- Try different formatting options
- Use fallback rule-based formatting

#### Processing takes too long
- Reduce text length
- Check API service status
- Use background processing for large texts

## Future Enhancements

### Planned Features
- **Batch Processing**: Format multiple texts at once
- **Custom Rules**: User-defined formatting preferences
- **Learning System**: Improve based on user feedback
- **Offline Mode**: Local text processing without APIs

### Additional AI Services Integration
- **Grammarly API**: When it becomes available
- **ProWritingAid API**: Professional writing assistance
- **Custom Models**: Train specific models for your use case

## Support

For issues or questions about AI formatting:
1. Check the browser console for error messages
2. Verify API configurations in `.env` file
3. Test with shorter text samples first
4. Check service status pages for any outages

The AI formatting system is designed to gracefully handle failures and always provide usable output, even when AI services are unavailable.
