export function parseYouTubeId(raw) {
  if (!raw) return null;
  const value = raw.trim();
  if (!value) return null;

  if (/^[a-zA-Z0-9_-]{6,}$/.test(value) && !value.includes("http")) {
    return value;
  }

  try {
    const url = new URL(value);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.replace("/", "").trim();
      return id || null;
    }

    if (url.hostname.includes("youtube.com")) {
      const id = url.searchParams.get("v");
      if (id) return id;

      const parts = url.pathname.split("/").filter(Boolean);
      const shortsIdx = parts.indexOf("shorts");
      if (shortsIdx >= 0 && parts[shortsIdx + 1]) return parts[shortsIdx + 1];
    }
  } catch {
    return null;
  }

  return null;
}
