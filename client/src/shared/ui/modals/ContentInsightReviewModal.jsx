import { useEffect, useMemo, useState } from "react";

import { CheckSquare, Sparkles } from "@/shared/ui/icons/icons";

import { contentInsightsAPI } from "../../../services/modules/contentInsightsApi";
import { DASHPOINT_COLLECTIONS_CHANGED_EVENT } from "../../lib/dashboardEvents";
import Modal from "./Modal";

const getTaskId = (task, index) => String(task?.id || `task-${index}`);

export default function ContentInsightReviewModal({
  insight,
  open,
  onClose,
  onAccepted,
  onRejected,
}) {
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [busy, setBusy] = useState(false);
  const tasks = Array.isArray(insight?.tasks) ? insight.tasks : [];

  useEffect(() => {
    if (!open || !insight) return;
    setSelectedTaskIds(tasks.map((task, index) => getTaskId(task, index)));
  }, [insight, open, tasks]);

  const selectedCount = selectedTaskIds.length;
  const hasTasks = tasks.length > 0;

  const title = useMemo(() => {
    const label = String(insight?.sourceLabel || "content").trim();
    return label ? `Review AI suggestions: ${label}` : "Review AI suggestions";
  }, [insight?.sourceLabel]);

  const toggleTask = (taskId) => {
    setSelectedTaskIds((current) =>
      current.includes(taskId) ? current.filter((id) => id !== taskId) : [...current, taskId],
    );
  };

  const accept = async () => {
    if (!insight?._id) return;
    setBusy(true);
    try {
      const response = await contentInsightsAPI.accept(insight._id, {
        taskIds: selectedTaskIds,
      });
      window.dispatchEvent(
        new CustomEvent(DASHPOINT_COLLECTIONS_CHANGED_EVENT, {
          detail: {
            toolCalls: 1,
            tools: ["acceptContentInsight"],
            collectionChanged: Boolean(response?.data?.collection),
          },
        }),
      );
      onAccepted?.(response?.data || null);
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  const reject = async () => {
    if (!insight?._id) {
      onClose?.();
      return;
    }

    setBusy(true);
    try {
      const response = await contentInsightsAPI.reject(insight._id);
      onRejected?.(response?.data || null);
      onClose?.();
    } finally {
      setBusy(false);
    }
  };

  if (!insight) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      disableClose={busy}
      title={title}
      description="Choose which extracted tasks should become planner items."
      size="lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={reject}
            disabled={busy}
            className="dp-btn-secondary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={accept}
            disabled={busy}
            className="dp-btn-primary rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? "Saving..." : hasTasks ? `Accept ${selectedCount} task(s)` : "Accept"}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {insight.summary ? (
          <section className="dp-surface dp-border rounded-2xl border p-4">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles size={16} className="dp-text-muted" />
              <p className="dp-text text-sm font-semibold">Summary</p>
            </div>
            <p className="dp-text-muted text-sm leading-6">{insight.summary}</p>
          </section>
        ) : null}

        {Array.isArray(insight.keyPoints) && insight.keyPoints.length ? (
          <section>
            <p className="dp-text mb-2 text-sm font-semibold">Key points</p>
            <ul className="space-y-2">
              {insight.keyPoints.map((point) => (
                <li key={point} className="dp-border rounded-xl border px-3 py-2 text-sm dp-text">
                  {point}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {hasTasks ? (
          <section>
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="dp-text text-sm font-semibold">Tasks</p>
              <button
                type="button"
                onClick={() =>
                  setSelectedTaskIds(
                    selectedCount === tasks.length
                      ? []
                      : tasks.map((task, index) => getTaskId(task, index)),
                  )
                }
                className="dp-text-muted text-xs font-semibold hover:opacity-80"
              >
                {selectedCount === tasks.length ? "Clear" : "Select all"}
              </button>
            </div>
            <div className="space-y-2">
              {tasks.map((task, index) => {
                const taskId = getTaskId(task, index);
                const checked = selectedTaskIds.includes(taskId);
                return (
                  <label
                    key={taskId}
                    className="dp-hover-bg dp-border flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTask(taskId)}
                      className="mt-1 h-4 w-4"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="dp-text block text-sm font-semibold">{task.text}</span>
                      <span className="dp-text-muted mt-0.5 flex flex-wrap items-center gap-2 text-xs">
                        <span className="inline-flex items-center gap-1">
                          <CheckSquare size={13} />
                          {task.priority || "medium"}
                        </span>
                        {task.reason ? <span>{task.reason}</span> : null}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>
        ) : null}

        {Array.isArray(insight.deadlines) && insight.deadlines.length ? (
          <section>
            <p className="dp-text mb-2 text-sm font-semibold">Deadlines</p>
            <div className="space-y-2">
              {insight.deadlines.map((deadline, index) => (
                <div
                  key={`${deadline.text}-${index}`}
                  className="dp-border rounded-xl border px-3 py-2"
                >
                  <p className="dp-text text-sm font-semibold">{deadline.text}</p>
                  <p className="dp-text-muted mt-0.5 text-xs">
                    {[deadline.date, deadline.context].filter(Boolean).join(" · ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {Array.isArray(insight.entities) && insight.entities.length ? (
          <section>
            <p className="dp-text mb-2 text-sm font-semibold">People & entities</p>
            <div className="flex flex-wrap gap-2">
              {insight.entities.map((entity, index) => (
                <span
                  key={`${entity.name}-${index}`}
                  className="dp-border rounded-full border px-3 py-1 text-xs font-medium dp-text-muted"
                >
                  {entity.name}
                  {entity.type ? ` · ${entity.type}` : ""}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {insight.warning ? <p className="dp-text-muted text-xs">{insight.warning}</p> : null}
      </div>
    </Modal>
  );
}
