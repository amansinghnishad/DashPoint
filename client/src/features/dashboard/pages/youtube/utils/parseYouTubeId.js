export function parseYouTubeId(raw) {
  if (typeof raw !== "string") return null;
  const value = raw.trim();
  if (!value) return null;

  const isVideoId = (candidate) => /^[a-zA-Z0-9_-]{11}$/.test(candidate);

  if (isVideoId(value)) return value;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;

    const hostname = url.hostname.toLowerCase();
    if (hostname === "youtu.be") {
      const id = url.pathname.split("/").filter(Boolean)[0] || "";
      return isVideoId(id) ? id : null;
    }

    const isYoutubeHost = hostname === "youtube.com" || hostname.endsWith(".youtube.com");
    if (isYoutubeHost) {
      const id = url.searchParams.get("v");
      if (id && isVideoId(id)) return id;

      const parts = url.pathname.split("/").filter(Boolean);
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && isVideoId(parts[shortsIdx + 1] || "")) {
        return parts[shortsIdx + 1];
      }
    }
  } catch {
    return null;
  }

  return null;
}
