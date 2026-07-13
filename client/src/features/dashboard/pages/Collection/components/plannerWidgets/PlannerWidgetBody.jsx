import PlannerAppointmentsCard from "./PlannerAppointmentsCard";
import PlannerDailyScheduleCard from "./PlannerDailyScheduleCard";
import PlannerNotesCard from "./PlannerNotesCard";
import PlannerTodoListCard from "./PlannerTodoListCard";

const REGISTRY = {
  "todo-list": PlannerTodoListCard,
  appointments: PlannerAppointmentsCard,
  "daily-schedule": PlannerDailyScheduleCard,
  notes: PlannerNotesCard,
  "notes-tomorrow": PlannerNotesCard,
};

export default function PlannerWidgetBody({ widget }) {
  const widgetType = String(widget?.widgetType || "");

  const Component = REGISTRY[widgetType];
  if (Component) return <Component widget={widget} />;

  return (
    <div className="text-muted text-xs font-semibold">
      This planner widget type is not supported: {widgetType || "unknown"}
    </div>
  );
}
