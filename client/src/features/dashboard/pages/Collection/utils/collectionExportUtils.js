function sanitizeFilename(name) {
  return String(name || "collection")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "") || "collection";
}

function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function exportCollectionToMarkdown(collection, items = []) {
  const title = String(collection?.name || "Collection").trim();
  const description = String(collection?.description || "").trim();
  const tags = Array.isArray(collection?.tags) ? collection.tags : [];
  const exportedDate = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const lines = [
    `# ${title}`,
    "",
    description ? `> ${description}\n` : "",
    `*Exported from DashPoint on ${exportedDate}*`,
    tags.length ? `\n**Tags:** ${tags.map((t) => `#${t}`).join(" ")}` : "",
    "\n---\n",
  ];

  if (!items.length) {
    lines.push("_This collection has no items._\n");
  }

  items.forEach((item, index) => {
    const itemType = item?.itemType;

    if (itemType === "planner") {
      const widget = item.data && (item.data.widgetType || item.data.title) ? item.data : item;
      const widgetType = item.widgetType || widget.widgetType || "notes";
      const widgetTitle = item.title || widget.title || `Widget ${index + 1}`;
      const data = item.data?.items || item.data?.note || item.data?.schedule || item.data?.appointments
        ? item.data
        : widget.data || {};

      lines.push(`## ${widgetTitle}`);

      if (widgetType === "todo-list") {
        const todoItems = Array.isArray(data.items) ? data.items : [];
        if (todoItems.length) {
          todoItems.forEach((todo) => {
            const checked = todo.completed || todo.done ? "x" : " ";
            const text = todo.text || todo.title || "Untitled task";
            lines.push(`- [${checked}] ${text}`);
          });
        } else {
          lines.push("_No tasks._");
        }
      } else if (widgetType === "appointments") {
        const appointments = Array.isArray(data.appointments || data.items)
          ? data.appointments || data.items
          : [];
        if (appointments.length) {
          appointments.forEach((apt) => {
            const time = apt.time || apt.start || "";
            const text = apt.title || apt.text || "Appointment";
            lines.push(`- **${time}**: ${text}`);
          });
        } else {
          lines.push("_No appointments._");
        }
      } else if (widgetType === "daily-schedule") {
        const schedule = Array.isArray(data.schedule || data.items)
          ? data.schedule || data.items
          : [];
        if (schedule.length) {
          schedule.forEach((slot) => {
            const time = slot.time || slot.hours || "";
            const task = slot.activity || slot.task || slot.text || "Activity";
            lines.push(`- **${time}**: ${task}`);
          });
        } else {
          lines.push("_No schedule blocks._");
        }
      } else {
        const noteText = String(data.note || data.text || data.content || "").trim();
        lines.push(noteText || "_Empty note._");
      }

      lines.push("");
    } else if (itemType === "youtube") {
      const video = item.data || item;
      const videoTitle = video.title || "YouTube Video";
      const url = video.url || (video.videoId ? `https://youtube.com/watch?v=${video.videoId}` : "");
      lines.push(`## 📺 ${videoTitle}`);
      if (url) lines.push(`- **Link**: [Watch on YouTube](${url})`);
      if (video.channelTitle) lines.push(`- **Channel**: ${video.channelTitle}`);
      if (video.summary) lines.push(`\n**Summary:**\n${video.summary}`);
      lines.push("");
    } else if (itemType === "file") {
      const file = item.data || item;
      const fileName = file.fileName || file.originalName || file.name || "File";
      lines.push(`## 📄 ${fileName}`);
      if (file.fileUrl || file.url) lines.push(`- **URL**: [View File](${file.fileUrl || file.url})`);
      if (file.fileType) lines.push(`- **Format**: ${file.fileType}`);
      if (file.summary) lines.push(`\n**Summary:**\n${file.summary}`);
      lines.push("");
    }
  });

  const markdownContent = lines.join("\n").trim();
  const filename = `${sanitizeFilename(title)}_dashpoint.md`;
  if (typeof window !== "undefined" && typeof document !== "undefined" && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    try {
      triggerDownload(markdownContent, filename, "text/markdown;charset=utf-8");
    } catch {
      // Ignore in headless test environments
    }
  }
  return markdownContent;
}

export function exportCollectionToJson(collection, items = [], layouts = {}) {
  const title = String(collection?.name || "Collection").trim();
  const exportPayload = {
    manifestVersion: "2.0",
    appName: "DashPoint",
    exportedAt: new Date().toISOString(),
    collection: {
      name: collection?.name,
      description: collection?.description,
      color: collection?.color,
      icon: collection?.icon,
      tags: collection?.tags,
    },
    items,
    layouts,
  };

  const jsonContent = JSON.stringify(exportPayload, null, 2);
  const filename = `${sanitizeFilename(title)}_dashpoint_backup.json`;
  if (typeof window !== "undefined" && typeof document !== "undefined" && typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
    try {
      triggerDownload(jsonContent, filename, "application/json;charset=utf-8");
    } catch {
      // Ignore in headless test environments
    }
  }
  return jsonContent;
}

export function parseImportedData(rawContent, fileType) {
  if (fileType === "json" || String(rawContent).trim().startsWith("{")) {
    try {
      const parsed = JSON.parse(rawContent);
      return {
        type: "json",
        collection: parsed.collection || {},
        items: Array.isArray(parsed.items) ? parsed.items : [],
        layouts: parsed.layouts || {},
      };
    } catch {
      throw new Error("Invalid JSON backup file format");
    }
  }

  // Parse Markdown note
  const lines = String(rawContent).split("\n");
  let title = "Imported Notes";
  const tasks = [];
  const noteParagraphs = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("# ") && title === "Imported Notes") {
      title = trimmed.slice(2).trim();
      continue;
    }

    if (trimmed.startsWith("- [ ] ") || trimmed.startsWith("- [x] ")) {
      const completed = trimmed.startsWith("- [x] ");
      const text = trimmed.slice(6).trim();
      if (text) tasks.push({ id: `todo-${Date.now()}-${tasks.length}`, text, completed });
      continue;
    }

    if (!trimmed.startsWith("---") && !trimmed.startsWith("#")) {
      noteParagraphs.push(trimmed);
    }
  }

  return {
    type: "markdown",
    title,
    tasks,
    notes: noteParagraphs.join("\n\n"),
  };
}
