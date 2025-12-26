import Modal from "../../components/Modals/Modal";
import CalendarWidget from "../../pages/dashboard/Widgets/Calendar";
import PlannerAppointmentsWidget from "../../pages/dashboard/Widgets/PlannerAppointments";
import PlannerCallsEmailsWidget from "../../pages/dashboard/Widgets/PlannerCallsEmails";
import PlannerDailyScheduleWidget from "../../pages/dashboard/Widgets/PlannerDailySchedule";
import PlannerExpenseTrackerWidget from "../../pages/dashboard/Widgets/PlannerExpenseTracker";
import PlannerMealPlannerWidget from "../../pages/dashboard/Widgets/PlannerMealPlanner";
import PlannerNotesTomorrowWidget from "../../pages/dashboard/Widgets/PlannerNotesTomorrow";
import PlannerRateYourDayWidget from "../../pages/dashboard/Widgets/PlannerRateYourDay";
import PlannerTodoListWidget from "../../pages/dashboard/Widgets/PlannerTodoList";
import PlannerTopPrioritiesWidget from "../../pages/dashboard/Widgets/PlannerTopPriorities";
import PlannerWaterTrackerWidget from "../../pages/dashboard/Widgets/PlannerWaterTracker";

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
          title="Top priorities"
          description="Your 3 most important wins today."
        >
          <PlannerTopPrioritiesWidget />
        </WidgetCard>

        <WidgetCard
          title="To do list"
          description="Small tasks you want to get done."
        >
          <PlannerTodoListWidget />
        </WidgetCard>

        <WidgetCard
          title="Water tracker"
          description="Track your water intake."
        >
          <PlannerWaterTrackerWidget />
        </WidgetCard>

        <WidgetCard
          title="Appointments"
          description="Meetings and time-based commitments."
        >
          <PlannerAppointmentsWidget />
        </WidgetCard>

        <WidgetCard
          title="Calls / emails"
          description="People to follow up with today."
        >
          <PlannerCallsEmailsWidget />
        </WidgetCard>

        <div className="md:col-span-2">
          <WidgetCard
            title="Daily schedule"
            description="Plan out your day by time blocks."
          >
            <PlannerDailyScheduleWidget />
          </WidgetCard>
        </div>

        <WidgetCard title="Meal planner" description="Plan meals for the day.">
          <PlannerMealPlannerWidget />
        </WidgetCard>

        <WidgetCard
          title="Expense tracker"
          description="Quickly track small daily spend."
        >
          <PlannerExpenseTrackerWidget />
        </WidgetCard>

        <WidgetCard
          title="Notes for tomorrow"
          description="Things you don’t want to forget."
        >
          <PlannerNotesTomorrowWidget />
        </WidgetCard>

        <WidgetCard title="Rate your day" description="A quick daily check-in.">
          <PlannerRateYourDayWidget />
        </WidgetCard>
      </div>
    </Modal>
  );
}
