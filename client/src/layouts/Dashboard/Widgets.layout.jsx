import Modal from "../../components/Modals/Modal";
import CalendarWidget from "../../pages/dashboard/Widgets/Calendar";
import StickyNotesWidget from "../../pages/dashboard/Widgets/StickyNotes";
import TodoWidget from "../../pages/dashboard/Widgets/Todo";

function WidgetCard({ title, description, children }) {
  return (
    <section className="dp-surface dp-border rounded-3xl border p-5 shadow-lg">
      <div className="mb-4">
        <p className="dp-text text-base font-semibold">{title}</p>
        {description ? (
          <p className="dp-text-muted mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export default function WidgetsLayout({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Widgets"
      description="Quick tools you can open anywhere in the dashboard."
      size="lg"
      footer={
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <WidgetCard
          title="Calendar"
          description="Pick a date and keep your day in view."
        >
          <CalendarWidget />
        </WidgetCard>

        <WidgetCard
          title="Tasks"
          description="Add, complete, and manage your todos."
        >
          <TodoWidget />
        </WidgetCard>

        <div className="md:col-span-2">
          <WidgetCard
            title="Sticky notes"
            description="Capture quick thoughts and reminders."
          >
            <StickyNotesWidget />
          </WidgetCard>
        </div>
      </div>
    </Modal>
  );
}
