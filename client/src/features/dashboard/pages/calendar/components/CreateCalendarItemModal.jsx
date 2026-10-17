import { CalendarDays, Check, ClipboardList, ListTodo } from "lucide-react";

import Modal from "../../../../../shared/ui/modals/Modal";
import { CREATE_ITEM_COLORS, CREATE_ITEM_TYPES } from "../constants";

const TYPE_DETAILS = {
  event: { icon: CalendarDays, hint: "A timed event on your calendar" },
  task: { icon: ClipboardList, hint: "An all-day task for this date" },
  todo: { icon: ListTodo, hint: "A quick all-day to-do" },
};

const COLOR_STYLES = {
  info: "bg-sky-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

const inputClass = "mt-1.5 w-full rounded-xl border border-hairline bg-canvas-soft px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/10";

export default function CreateCalendarItemModal({
  open,
  onClose,
  creating,
  onSubmit,
  form,
  isTimedEvent,
  onChangeField,
}) {
  const selectedType = CREATE_ITEM_TYPES.find((itemType) => itemType.value === form.type);
  const itemLabel = selectedType?.label || "Event";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Create ${itemLabel.toLowerCase()}`}
      description="Add it to your Google Calendar."
      size="md"
      disableClose={creating}
      footer={(
        <div className="flex items-center justify-between gap-3">
          <p className="hidden text-xs text-muted sm:block">Saved to Google Calendar</p>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="dp-btn-secondary rounded-full px-5 py-2 text-sm font-semibold transition-colors"
              disabled={creating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              className="dp-btn-primary rounded-full px-5 py-2 text-sm font-semibold transition-colors"
              disabled={creating}
            >
              {creating ? "Creating…" : `Create ${itemLabel.toLowerCase()}`}
            </button>
          </div>
        </div>
      )}
    >
      <div className="space-y-5 text-ink">
        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-muted">What are you adding?</legend>
          <div className="grid grid-cols-3 gap-2">
            {CREATE_ITEM_TYPES.map((itemType) => {
              const details = TYPE_DETAILS[itemType.value];
              const Icon = details.icon;
              const selected = form.type === itemType.value;
              return (
                <button
                  key={itemType.value}
                  type="button"
                  onClick={() => onChangeField("type", itemType.value)}
                  aria-pressed={selected}
                  className={`flex min-w-0 flex-col items-start rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-primary/50 bg-primary/5 ring-2 ring-primary/10"
                      : "border-hairline bg-surface-card hover:bg-canvas-soft"
                  }`}
                >
                  <Icon size={17} className={selected ? "text-primary" : "text-muted"} aria-hidden="true" />
                  <span className="mt-2 text-xs font-semibold text-ink">{itemType.label}</span>
                  <span className="mt-1 hidden text-[10px] leading-4 text-muted sm:block">{details.hint}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs font-semibold text-muted">Title</span>
          <input
            id="calendar-item-title"
            value={form.title}
            onChange={(event) => onChangeField("title", event.target.value)}
            className={`${inputClass} text-base`}
            placeholder={form.type === "todo" ? "What needs to get done?" : form.type === "task" ? "Name this task" : "Add an event title"}
            autoComplete="off"
          />
        </label>

        <div className="rounded-2xl border border-hairline bg-canvas-soft/50 p-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-semibold text-muted">Date</span>
              <input
                id="calendar-item-date"
                type="date"
                value={form.date}
                onChange={(event) => onChangeField("date", event.target.value)}
                className={inputClass}
              />
            </label>

            {isTimedEvent ? (
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="text-xs font-semibold text-muted">Starts</span>
                  <input
                    id="calendar-item-start"
                    type="time"
                    value={form.startTime}
                    onChange={(event) => onChangeField("startTime", event.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-muted">Ends</span>
                  <input
                    id="calendar-item-end"
                    type="time"
                    value={form.endTime}
                    onChange={(event) => onChangeField("endTime", event.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-col justify-center rounded-xl border border-hairline bg-surface-card px-3.5 py-2.5">
                <span className="text-xs font-semibold text-ink">All day</span>
                <span className="mt-1 text-[11px] text-muted">Tasks and to-dos use the full day.</span>
              </div>
            )}
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-xs font-semibold text-muted">Color</legend>
          <div className="flex flex-wrap gap-2">
            {CREATE_ITEM_COLORS.map((itemColor) => {
              const selected = form.color === itemColor.value;
              return (
                <button
                  key={itemColor.value}
                  type="button"
                  onClick={() => onChangeField("color", itemColor.value)}
                  aria-label={`${itemColor.label} color`}
                  aria-pressed={selected}
                  title={itemColor.label}
                  className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-medium transition ${
                    selected ? "border-primary/40 bg-primary/5 text-ink" : "border-hairline bg-surface-card text-muted hover:bg-canvas-soft"
                  }`}
                >
                  <span className={`h-3 w-3 rounded-full ${COLOR_STYLES[itemColor.value]}`} aria-hidden="true" />
                  {itemColor.label}
                  {selected ? <Check size={13} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </Modal>
  );
}
