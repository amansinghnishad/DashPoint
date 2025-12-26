import PlannerAppointmentsCard from "./PlannerAppointmentsCard";
import PlannerCallsEmailsCard from "./PlannerCallsEmailsCard";
import PlannerDailyScheduleCard from "./PlannerDailyScheduleCard";
import PlannerExpenseTrackerCard from "./PlannerExpenseTrackerCard";
import PlannerGoalsCard from "./PlannerGoalsCard";
import PlannerMealPlannerCard from "./PlannerMealPlannerCard";
import PlannerNotesCard from "./PlannerNotesCard";
import PlannerRateYourDayCard from "./PlannerRateYourDayCard";
import PlannerTodoListCard from "./PlannerTodoListCard";
import PlannerTopPrioritiesCard from "./PlannerTopPrioritiesCard";
import PlannerWaterTrackerCard from "./PlannerWaterTrackerCard";

const REGISTRY = {
  "top-priorities": PlannerTopPrioritiesCard,
  "todo-list": PlannerTodoListCard,
  appointments: PlannerAppointmentsCard,
  "daily-schedule": PlannerDailyScheduleCard,
  goals: PlannerGoalsCard,
  notes: PlannerNotesCard,
  "notes-tomorrow": PlannerNotesCard,
  "meal-planner": PlannerMealPlannerCard,
  "water-tracker": PlannerWaterTrackerCard,
  "calls-emails": PlannerCallsEmailsCard,
  "expense-tracker": PlannerExpenseTrackerCard,
  "rate-your-day": PlannerRateYourDayCard,
};

export default function PlannerWidgetBody({ widget }) {
  const widgetType = String(widget?.widgetType || "");

  const Component = REGISTRY[widgetType];
  if (Component) return <Component widget={widget} />;

  return (
    <div className="dp-text-muted text-sm">
      Unsupported planner widget type: {widgetType || "unknown"}
    </div>
  );
}
