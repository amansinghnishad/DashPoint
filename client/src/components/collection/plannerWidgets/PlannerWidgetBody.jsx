import PlannerAppointmentsCard from "./PlannerAppointmentsCard";
import PlannerDailyScheduleCard from "./PlannerDailyScheduleCard";
import PlannerGoalsCard from "./PlannerGoalsCard";
import PlannerNotesCard from "./PlannerNotesCard";
import PlannerTodoListCard from "./PlannerTodoListCard";
import PlannerTopPrioritiesCard from "./PlannerTopPrioritiesCard";

const REGISTRY = {
  "top-priorities": PlannerTopPrioritiesCard,
  "todo-list": PlannerTodoListCard,
  appointments: PlannerAppointmentsCard,
  "daily-schedule": PlannerDailyScheduleCard,
  goals: PlannerGoalsCard,
  notes: PlannerNotesCard,
  "notes-tomorrow": PlannerNotesCard,
};

export default function PlannerWidgetBody({ widget }) {
  const widgetType = String(widget?.widgetType || "");

  const Component = REGISTRY[widgetType];
  if (Component) return <Component widget={widget} />;

  return (
    <div className="dp-text-muted text-sm">
      This planner widget type is not supported: {widgetType || "unknown"}
    </div>
  );
}
