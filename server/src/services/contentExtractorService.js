const axios = require('axios');
const cheerio = require('cheerio');
const { URL } = require('url');

// extractWebContent service
const extractContent = async (url, options = {}) => {
  const {
    extractImages = false,
    extractLinks = false,
    maxContentLength = 10000
  } = options;
  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    // Remove unwanted elements
    $('script, style, nav, header, footer, aside, .advertisement, .ads, .sidebar').remove();

    // Extract metadata
    const title = $('title').text().trim() ||
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content') ||
      'Untitled';

    const description = $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      '';

    const author = $('meta[name="author"]').attr('content') ||
      $('[rel="author"]').text().trim() ||
      $('.author').first().text().trim() ||
      '';

    const publishDate = $('meta[property="article:published_time"]').attr('content') ||
      $('time[datetime]').attr('datetime') ||
      $('.date').first().text().trim() ||
      null;

    const keywords = $('meta[name="keywords"]').attr('content')?.split(',').map(k => k.trim()) || [];

    const image = $('meta[property="og:image"]').attr('content') ||
      $('img').first().attr('src') ||
      '';

    const favicon = $('link[rel="shortcut icon"]').attr('href') ||
      $('link[rel="icon"]').attr('href') ||
      '/favicon.ico';

    // Extract main content
    let content = '';

    // Try to find article content
    const articleSelectors = [
      'article',
      '[role="main"]',
      '.content',
      '.post-content',
      '.entry-content',
      '.article-content',
      'main',
      '#content',
      '.main-content'
    ];

    for (const selector of articleSelectors) {
      const element = $(selector).first();
      if (element.length && element.text().trim().length > 200) {
        content = element.text().trim();
        break;
      }
    }

    // Fallback: extract all paragraph text
    if (!content || content.length < 200) {
      content = $('p').map((i, el) => $(el).text().trim()).get().join('\n\n');
    }

    // Clean up content
    content = content
      .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
      .replace(/\n+/g, '\n') // Replace multiple newlines with single newline
      .trim();

    if (maxContentLength && content.length > maxContentLength) {
      content = content.slice(0, maxContentLength).trim();
    }

    const images = extractImages
      ? $('img[src]')
          .map((index, element) => {
            const src = $(element).attr('src');
            if (!src) return null;
            const absSrc = makeAbsoluteUrl(src, url);
            return {
              src: absSrc,
              alt: ($(element).attr('alt') || '').trim(),
              width: parseInt($(element).attr('width'), 10) || null,
              height: parseInt($(element).attr('height'), 10) || null
            };
          })
          .get()
          .filter(Boolean)
      : [];

    const links = extractLinks
      ? $('a[href]')
          .map((index, element) => {
            const href = ($(element).attr('href') || '').trim();
            if (!href) return null;

            let resolvedHref = href;
            let linkType = 'external';

            if (href.startsWith('mailto:')) {
              linkType = 'email';
            } else if (href.startsWith('tel:')) {
              linkType = 'tel';
            } else {
              resolvedHref = makeAbsoluteUrl(href, url);
              try {
                const target = new URL(resolvedHref);
                linkType = target.hostname === parsedUrl.hostname ? 'internal' : 'external';
              } catch (error) {
                return null;
              }
            }

            return {
              href: resolvedHref,
              text: $(element).text().trim(),
              type: linkType
            };
          })
          .get()
          .filter(Boolean)
      : [];

    // Calculate reading time (average 200 words per minute)
    const wordCount = content.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);

    // Determine category based on URL and content
    const category = determineCategory(url, content);

    return {
      url,
      title,
      content,
      domain: parsedUrl.hostname,
      author: author || null,
      publishDate: publishDate ? new Date(publishDate) : null,
      wordCount,
      readingTime,
      category,
      metadata: {
        description,
        keywords,
        image: image ? makeAbsoluteUrl(image, url) : null,
        favicon: favicon ? makeAbsoluteUrl(favicon, url) : null
      },
      images,
      links,
      status: 'success'
    };

  } catch (error) {
    console.error('Content extraction error:', error);
    throw new Error(`Failed to extract content: ${error.message}`);
  }
};

// determineCategory function
const determineCategory = (url, content) => {
  const urlLower = url.toLowerCase();
  const contentLower = content.toLowerCase();

  // Check URL patterns
  if (urlLower.includes('/blog/') || urlLower.includes('/posts/')) {
    return 'blog';
  }
  if (urlLower.includes('/news/') || urlLower.includes('/article/')) {
    return 'news';
  }
  if (urlLower.includes('/docs/') || urlLower.includes('/documentation/')) {
    return 'documentation';
  }
  if (urlLower.includes('/research/') || urlLower.includes('/paper/')) {
    return 'research';
  }

  // Check content keywords
  const articleKeywords = ['published', 'author', 'article', 'story'];
  const blogKeywords = ['posted', 'blog', 'blogger'];
  const newsKeywords = ['breaking', 'news', 'reporter', 'update'];
  const docKeywords = ['documentation', 'guide', 'tutorial', 'reference'];

  if (articleKeywords.some(keyword => contentLower.includes(keyword))) {
    return 'article';
  }
  if (blogKeywords.some(keyword => contentLower.includes(keyword))) {
    return 'blog';
  }
  if (newsKeywords.some(keyword => contentLower.includes(keyword))) {
    return 'news';
  }
  if (docKeywords.some(keyword => contentLower.includes(keyword))) {
    return 'documentation';
  }

  return 'other';
};

// makeAbsoluteUrl function
const makeAbsoluteUrl = (url, baseUrl) => {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    return url;
  }
};

// generateSummary function
const generateSummary = (content, maxLength = 300) => {
  if (!content || content.length <= maxLength) {
    return content;
  }

  // Split into sentences
  const sentences = content.match(/[^\.!?]+[\.!?]+/g) || [content];

  let summary = '';
  for (const sentence of sentences) {
    if (summary.length + sentence.length <= maxLength) {
      summary += sentence;
    } else {
      break;
    }
  }

  return summary.trim() || content.substring(0, maxLength) + '...';
};

// validateUrl function
const validateUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return ['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return false;
  }
};

module.exports = {
  extractContent,
  generateSummary,
  validateUrl
};
