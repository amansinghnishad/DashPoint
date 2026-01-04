import { useCallback, useEffect, useRef, useState } from "react";
import { collectionsAPI } from "../../../../services/api";

export default function useCollectionData({ collectionId, toast }) {
  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(collectionId));

  const inflightReloadRef = useRef(null);

  const reset = useCallback(() => {
    setCollection(null);
    setItems([]);
    setLoading(false);
  }, []);

  const reload = useCallback(async () => {
    if (!collectionId) {
      reset();
      return;
    }

    // Collapse concurrent reload calls into a single request.
    if (inflightReloadRef.current) {
      return inflightReloadRef.current;
    }

    setLoading(true);
    const promise = (async () => {
      try {
        const response = await collectionsAPI.getCollectionWithItems(collectionId);
        if (!response?.success) {
          throw new Error(response?.message || "Failed to load collection");
        }

        const data = response.data?.data ?? response.data;
        setCollection(data);
        setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load collection";
        toast?.error?.(message);
      } finally {
        setLoading(false);
        inflightReloadRef.current = null;
      }
    })();

    inflightReloadRef.current = promise;
    return promise;
  }, [collectionId, reset, toast]);

  useEffect(() => {
    if (!collectionId) {
      reset();
      return;
    }

    reload();
  }, [collectionId, reload, reset]);

  return { collection, items, loading, reload, setCollection, setItems };
}
