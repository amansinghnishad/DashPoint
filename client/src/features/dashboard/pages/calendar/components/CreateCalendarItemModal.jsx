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
      title="Create"
      description="Add an event, task, or to-do and sync to Google Calendar."
      size="sm"
      footer={
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold"
            disabled={creating}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold"
            disabled={creating}
          >
            {creating ? "Creating..." : "Create"}
          </button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="dp-text text-sm font-semibold">Type</label>
          <select
            value={form.type}
            onChange={(event) => onChangeField("type", event.target.value)}
            className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
          >
            {CREATE_ITEM_TYPES.map((itemType) => (
              <option key={itemType.value} value={itemType.value}>
                {itemType.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="dp-text text-sm font-semibold">Title</label>
          <input
            value={form.title}
            onChange={(event) => onChangeField("title", event.target.value)}
            className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
            placeholder="What is it?"
          />
        </div>

        <div>
          <label className="dp-text text-sm font-semibold">Color</label>
          <select
            value={form.color}
            onChange={(event) => onChangeField("color", event.target.value)}
            className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
          >
            {CREATE_ITEM_COLORS.map((itemColor) => (
              <option key={itemColor.value} value={itemColor.value}>
                {itemColor.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="dp-text text-sm font-semibold">Date</label>
          <input
            type="date"
            value={form.date}
            onChange={(event) => onChangeField("date", event.target.value)}
            className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
          />
        </div>

        {isTimedEvent ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="dp-text text-sm font-semibold">Start</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(event) =>
                  onChangeField("startTime", event.target.value)
                }
                className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
              />
            </div>

            <div>
              <label className="dp-text text-sm font-semibold">End</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(event) => onChangeField("endTime", event.target.value)}
                className="mt-2 dp-surface dp-border dp-text w-full rounded-xl border px-3 py-2 text-sm outline-none"
              />
            </div>
          </div>
        ) : (
          <p className="dp-text-muted text-sm">
            Tasks and to-dos are created as all-day items.
          </p>
        )}
      </div>
    </Modal>
  );
}
