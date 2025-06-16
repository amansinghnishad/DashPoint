import { validateUrl, cleanUrl, getDomainFromUrl } from "../../../utils/urlUtils";
import { contentAPI } from "../../../services/api";

export const extractContentFromUrl = async (url, existingContents) => {
  if (!url.trim()) {
    throw new Error("Please enter a URL");
  }

  if (!validateUrl(url)) {
    throw new Error("Please enter a valid URL");
  }

  const cleanedUrl = cleanUrl(url);

  // Check if content already extracted
  const existing = existingContents.find(
    (content) => content.url === cleanedUrl
  );
  if (existing) {
    return { existing: true, content: existing };
  }

  // Call the backend API for content extraction
  const response = await contentAPI.extractContent(cleanedUrl);
  const extractedContent = response.data;

  // Process the extracted content
  const processedContent = {
    url: cleanedUrl,
    title:
      extractedContent.title ||
      `Content from ${getDomainFromUrl(cleanedUrl)}`,
    content: extractedContent.text || extractedContent.content,
    wordCount:
      extractedContent.wordCount ||
      extractedContent.text?.split(" ").length ||
      0,
    domain: getDomainFromUrl(cleanedUrl),
    category: extractedContent.category || "general",
  };

  // Save to database
  const saveResponse = await contentAPI.create(processedContent);
  if (saveResponse.success) {
    return { existing: false, content: saveResponse.data };
  }

  throw new Error("Failed to save extracted content");
};

export const exportContentAsJson = (content) => {
  const dataStr = JSON.stringify(content, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `content-${content.domain}-${new Date().toISOString().split("T")[0]
    }.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};
