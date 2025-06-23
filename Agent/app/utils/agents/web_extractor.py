"""
Web content extraction utility for the agent
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from typing import Dict, List, Optional, Any

def extract_web_content(url: str, generate_summary: bool = False, summary_length: str = "medium") -> Dict[str, Any]:
    """
    Extract content from a web URL with optional AI summarization
    
    Args:
        url (str): The web URL to extract content from
        generate_summary (bool): Whether to generate AI summary
        summary_length (str): Length of summary if generated
    
    Returns:
        Dict containing extracted content and optional summary
    """
    try:
        # Validate URL
        parsed_url = urlparse(url)
        if not parsed_url.scheme or not parsed_url.netloc:
            raise ValueError("Invalid URL provided")
        
        # Set headers to mimic a real browser
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
        
        # Make request
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Parse HTML
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract metadata
        title = extract_title(soup)
        description = extract_description(soup)
        
        # Extract main content
        content = extract_main_content(soup)
        
        # Extract additional elements
        images = extract_images(soup, url)
        links = extract_links(soup, url)
        
        # Prepare result
        result = {
            "url": url,
            "title": title,
            "description": description,
            "content": content,
            "images": images[:10],  # Limit to first 10 images
            "links": links[:20],    # Limit to first 20 links
            "metadata": {
                "domain": parsed_url.netloc,
                "word_count": len(content.split()) if content else 0,
                "char_count": len(content) if content else 0
            }
        }
        
        # Generate summary if requested
        if generate_summary and content and len(content.strip()) > 100:
            from ..models.textsum_client import summarize_text_content
            try:
                summary = summarize_text_content(content, summary_length)
                result["summary"] = summary
                result["summary_generated"] = True
            except Exception as e:
                result["summary_error"] = str(e)
                result["summary_generated"] = False
        
        return result
        
    except Exception as e:
        return {
            "url": url,
            "error": str(e),
            "success": False
        }

def extract_title(soup: BeautifulSoup) -> str:
    """Extract page title"""
    # Try various title sources
    title_sources = [
        soup.find('title'),
        soup.find('meta', property='og:title'),
        soup.find('meta', name='twitter:title'),
        soup.find('h1')
    ]
    
    for source in title_sources:
        if source:
            if source.name == 'meta':
                title = source.get('content', '').strip()
            else:
                title = source.get_text().strip()
            
            if title:
                return title
    
    return "No title found"

def extract_description(soup: BeautifulSoup) -> str:
    """Extract page description"""
    # Try various description sources
    desc_sources = [
        soup.find('meta', name='description'),
        soup.find('meta', property='og:description'),
        soup.find('meta', name='twitter:description')
    ]
    
    for source in desc_sources:
        if source:
            desc = source.get('content', '').strip()
            if desc:
                return desc
    
    return ""

def extract_main_content(soup: BeautifulSoup) -> str:
    """Extract main content from the page"""
    # Remove script and style elements
    for script in soup(["script", "style", "nav", "footer", "header", "aside"]):
        script.decompose()
    
    # Try to find main content areas
    content_selectors = [
        'main',
        'article',
        '[role="main"]',
        '.content',
        '.main-content',
        '.post-content',
        '.entry-content',
        '.article-content',
        '.content-body'
    ]
    
    for selector in content_selectors:
        content_element = soup.select_one(selector)
        if content_element:
            return clean_text(content_element.get_text())
    
    # Fallback to body content
    body = soup.find('body')
    if body:
        return clean_text(body.get_text())
    
    return clean_text(soup.get_text())

def extract_images(soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
    """Extract images from the page"""
    images = []
    
    for img in soup.find_all('img', src=True):
        src = img.get('src')
        if src:
            # Convert relative URLs to absolute
            src = urljoin(base_url, src)
            
            # Skip data URLs and very small images
            if src.startswith('data:') or 'pixel' in src.lower():
                continue
            
            images.append({
                'src': src,
                'alt': img.get('alt', ''),
                'title': img.get('title', '')
            })
    
    return images

def extract_links(soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
    """Extract links from the page"""
    links = []
    
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if href:
            # Convert relative URLs to absolute
            href = urljoin(base_url, href)
            
            # Skip javascript and anchor links
            if href.startswith(('javascript:', '#', 'mailto:')):
                continue
            
            links.append({
                'url': href,
                'text': link.get_text().strip(),
                'title': link.get('title', '')
            })
    
    return links

def clean_text(text: str) -> str:
    """Clean extracted text"""
    if not text:
        return ""
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters but keep basic punctuation
    text = re.sub(r'[^\w\s\.\,\!\?\;\:\-\(\)\[\]\{\}\"\'\/]', '', text)
    
    return text.strip()
