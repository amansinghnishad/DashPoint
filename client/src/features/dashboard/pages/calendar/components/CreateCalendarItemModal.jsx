import Modal from "../../../../../shared/ui/modals/Modal";
import { CREATE_ITEM_COLORS, CREATE_ITEM_TYPES } from "../constants";

export default function CreateCalendarItemModal({
  open,
  onClose,
  creating,
  onSubmit,
  form,
  isTimedEvent,
  onChangeField,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Calendar Item"
      description="Add an event, task, or to-do and sync it to Google Calendar."
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent hover:bg-hairline-soft border border-hairline text-ink rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            disabled={creating}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="bg-primary hover:bg-primary-active text-canvas rounded-full px-5 py-2 text-sm font-semibold transition-colors"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      }
    >
      <div className="space-y-4 text-ink">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="calendar-item-type" className="text-sm font-semibold">
              Type
            </label>
            <select
              id="calendar-item-type"
              value={form.type}
              onChange={(event) => onChangeField("type", event.target.value)}
              className="mt-2 border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
            >
              {CREATE_ITEM_TYPES.map((itemType) => (
                <option key={itemType.value} value={itemType.value}>
                  {itemType.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="calendar-item-color" className="text-sm font-semibold">
              Color
            </label>
            <select
              id="calendar-item-color"
              value={form.color}
              onChange={(event) => onChangeField("color", event.target.value)}
              className="mt-2 border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
            >
              {CREATE_ITEM_COLORS.map((itemColor) => (
                <option key={itemColor.value} value={itemColor.value}>
                  {itemColor.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="calendar-item-title" className="text-sm font-semibold">
            Title
          </label>
          <input
            id="calendar-item-title"
            value={form.title}
            onChange={(event) => onChangeField("title", event.target.value)}
            className="mt-2 border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
            placeholder="What is it?"
          />
        </div>

        <div>
          <label htmlFor="calendar-item-date" className="text-sm font-semibold">
            Date
          </label>
          <input
            id="calendar-item-date"
            type="date"
            value={form.date}
            onChange={(event) => onChangeField("date", event.target.value)}
            className="mt-2 border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>

        {isTimedEvent ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label htmlFor="calendar-item-start" className="text-sm font-semibold">
                Start
              </label>
              <input
                id="calendar-item-start"
                type="time"
                value={form.startTime}
                onChange={(event) => onChangeField("startTime", event.target.value)}
                className="mt-2 border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div>
              <label htmlFor="calendar-item-end" className="text-sm font-semibold">
                End
              </label>
              <input
                id="calendar-item-end"
                type="time"
                value={form.endTime}
                onChange={(event) => onChangeField("endTime", event.target.value)}
                className="mt-2 border border-hairline bg-canvas-soft text-ink w-full rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        ) : (
          <p className="text-muted mt-2 text-xs">Tasks and to-dos are created as all-day items.</p>
        )}
      </div>
    </Modal>
  );
}
