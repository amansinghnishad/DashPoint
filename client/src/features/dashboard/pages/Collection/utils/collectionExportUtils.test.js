import { describe, expect, it } from "vitest";

import {
  exportCollectionToJson,
  exportCollectionToMarkdown,
  parseImportedData,
} from "./collectionExportUtils";

describe("Collection Export & Import Utilities", () => {
  const mockCollection = {
    _id: "col-123",
    name: "Design Sprint 2026",
    description: "Spatial design system backlog",
    tags: ["frontend", "ux"],
  };

  const mockItems = [
    {
      _id: "widget-1",
      itemType: "planner",
      widgetType: "todo-list",
      title: "Sprint Checklist",
      data: {
        items: [
          { text: "Build export modal", completed: true },
          { text: "Write unit tests", completed: false },
        ],
      },
    },
    {
      _id: "note-1",
      itemType: "planner",
      widgetType: "notes",
      title: "Design Notes",
      data: {
        note: "Ensure high contrast on dark themes.",
      },
    },
  ];

  describe("exportCollectionToMarkdown", () => {
    it("should export markdown with title, tasks and notes in Obsidian-compatible format", () => {
      const md = exportCollectionToMarkdown(mockCollection, mockItems);

      expect(md).toContain("# Design Sprint 2026");
      expect(md).toContain("Spatial design system backlog");
      expect(md).toContain("## Sprint Checklist");
      expect(md).toContain("- [x] Build export modal");
      expect(md).toContain("- [ ] Write unit tests");
      expect(md).toContain("## Design Notes");
      expect(md).toContain("Ensure high contrast on dark themes.");
    });
  });

  describe("exportCollectionToJson", () => {
    it("should generate valid JSON backup matching schema", () => {
      const jsonStr = exportCollectionToJson(mockCollection, mockItems);
      const parsed = JSON.parse(jsonStr);

      expect(parsed.collection.name).toBe("Design Sprint 2026");
      expect(parsed.manifestVersion).toBe("2.0");
      expect(parsed.items).toHaveLength(2);
      expect(parsed.exportedAt).toBeDefined();
    });
  });

  describe("parseImportedData", () => {
    it("should extract title, checklist tasks, and notes from raw Markdown", () => {
      const sampleMd = `
# Project Kickoff
Initial notes and objectives.

- [ ] Set up continuous integration
- [x] Configure Vitest
      `;

      const result = parseImportedData(sampleMd, "markdown");
      expect(result.type).toBe("markdown");
      expect(result.title).toBe("Project Kickoff");
      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].text).toBe("Set up continuous integration");
      expect(result.tasks[0].completed).toBe(false);
      expect(result.tasks[1].completed).toBe(true);
      expect(result.notes).toContain("Initial notes and objectives.");
    });

    it("should parse JSON backups", () => {
      const jsonStr = JSON.stringify({
        manifestVersion: "2.0",
        collection: { name: "Imported Col" },
        items: [{ _id: "1", title: "Item 1" }],
      });

      const result = parseImportedData(jsonStr, "json");
      expect(result.type).toBe("json");
      expect(result.collection.name).toBe("Imported Col");
      expect(result.items).toHaveLength(1);
    });
  });
});
