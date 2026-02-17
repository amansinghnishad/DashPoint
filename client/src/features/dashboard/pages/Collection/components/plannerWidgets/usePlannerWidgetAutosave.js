import { useEffect, useRef } from "react";

import { plannerWidgetsAPI } from "../../../../../../services/modules/plannerWidgetsApi";

export function usePlannerWidgetAutosave({
  widgetId,
  data,
  baselineSerialized,
  delayMs = 600,
}) {
  const lastSavedRef = useRef(null);
  const saveTimerRef = useRef(null);

  useEffect(() => {
    if (typeof baselineSerialized === "string") {
      lastSavedRef.current = baselineSerialized;
      return;
    }

    lastSavedRef.current = JSON.stringify(data ?? {});
  }, [baselineSerialized, data, widgetId]);

  useEffect(() => {
    if (!widgetId) return;

    const serialized = JSON.stringify(data ?? {});
    if (serialized === lastSavedRef.current) return;

    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(async () => {
      try {
        const res = await plannerWidgetsAPI.update(widgetId, { data: data ?? {} });
        if (res?.success) {
          lastSavedRef.current = serialized;
        }
      } catch {
        // Silent fail: keep editing responsive; next edit will retry save.
      }
    }, delayMs);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [data, delayMs, widgetId]);
}
