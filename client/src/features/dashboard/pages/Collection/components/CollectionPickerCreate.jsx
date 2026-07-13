export default function CollectionPickerCreate({
  tool,
  busy,
  createYouTubeUrl,
  setCreateYouTubeUrl,
  createPlannerWidgetType,
  setCreatePlannerWidgetType,
  createPlannerWidgetTitle,
  setCreatePlannerWidgetTitle,
  onSubmit,
  fileInputRef,
  photoInputRef,
  uploadAndAddFiles,
}) {
  const plannerTitlePlaceholderByType = {
    "todo-list": "To do list",
    appointments: "Appointments",
    "daily-schedule": "Daily schedule",
    notes: "Notes",
  };

  const plannerTitlePlaceholder =
    plannerTitlePlaceholderByType[createPlannerWidgetType] || "Planner";

  return (
    <>
      {tool === "planner" ? (
        <div className="bg-canvas-soft border border-hairline rounded-2xl p-4">
          <p className="text-ink font-semibold text-sm">Create planner widget</p>
          <p className="text-muted mt-1 text-xs">
            Choose a widget type to add to this collection.
          </p>

          <div className="mt-4 grid gap-3.5">
            <label className="grid gap-1.5">
              <span className="text-muted text-[11px] font-bold uppercase tracking-wider">Widget type</span>
              <select
                value={createPlannerWidgetType}
                onChange={(e) => setCreatePlannerWidgetType(e.target.value)}
                className="bg-canvas border border-hairline text-ink w-full rounded-xl px-4 py-2 text-sm outline-none cursor-pointer"
                disabled={busy}
              >
                <option value="todo-list">To do list</option>
                <option value="appointments">Appointments</option>
                <option value="daily-schedule">Daily schedule</option>
                <option value="notes">Notes</option>
              </select>
            </label>

            <label className="grid gap-1.5">
              <span className="text-muted text-[11px] font-bold uppercase tracking-wider">Title</span>
              <input
                value={createPlannerWidgetTitle}
                onChange={(e) => setCreatePlannerWidgetTitle(e.target.value)}
                placeholder={plannerTitlePlaceholder}
                className="bg-canvas border border-hairline text-ink w-full rounded-xl px-4 py-2 text-sm outline-none"
                disabled={busy}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmit();
                }}
              />
            </label>
          </div>
        </div>
      ) : null}

      {tool === "youtube" ? (
        <input
          value={createYouTubeUrl}
          onChange={(e) => setCreateYouTubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="bg-canvas border border-hairline text-ink w-full rounded-xl px-4 py-2 text-sm outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter") onSubmit();
          }}
          disabled={busy}
        />
      ) : null}

      {tool === "file" || tool === "photo" ? (
        <div className="bg-canvas-soft border border-hairline rounded-2xl p-4">
          <p className="text-ink font-semibold text-sm">Upload</p>
          <p className="text-muted mt-1 text-xs">
            Choose {tool === "photo" ? "images" : "files"} to upload and add.
          </p>
          <div className="mt-4">
            <button
              type="button"
              onClick={onSubmit}
              className="bg-ink text-canvas hover:bg-primary-active rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60"
              disabled={busy}
            >
              {busy ? "Uploading..." : "Choose files"}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = "";
              uploadAndAddFiles(files, "file");
            }}
          />
          <input
            ref={photoInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              e.target.value = "";
              uploadAndAddFiles(files, "photo");
            }}
          />
        </div>
      ) : null}
    </>
  );
}
