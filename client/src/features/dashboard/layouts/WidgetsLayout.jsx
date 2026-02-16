import { lazy, Suspense } from "react";

import Modal from "../../../shared/ui/modals/Modal";
import { styleTheme } from "../../../shared/ui/theme/styleTheme";

const CalendarWidget = lazy(() => import("../pages/Widgets/Calendar"));
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
      description="Quick calendar tool."
      size="lg"
      footer={
        <div className={styleTheme.modal.footerActionsEnd}>
          <button
            type="button"
            onClick={onClose}
            className={styleTheme.button.secondary}
          >
            Close
          </button>
        </div>
      }
    >
      <Suspense fallback={<p className="dp-text-muted text-sm">Loading widgets...</p>}>
        <div className="grid grid-cols-1 gap-5">
          <WidgetCard
            title="Calendar"
            description="Pick a date and keep your day in view."
          >
            <CalendarWidget />
          </WidgetCard>
        </div>
      </Suspense>
    </Modal>
  );
}
