import { useCallback, useEffect, useRef, useState } from "react";
import { collectionsAPI } from "../../../../../services/modules/collectionsApi";

const LOAD_ERROR_MESSAGE = "Failed to load collection";

const getCollectionData = (response) => response?.data?.data ?? response?.data ?? null;

const getCollectionItems = (data) => (Array.isArray(data?.items) ? data.items : []);

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

// Data loading
export default function useCollectionData({ collectionId, onError }) {
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

    if (inflightReloadRef.current) {
      return inflightReloadRef.current;
    }

    setLoading(true);
    const promise = (async () => {
      try {
        const response = await collectionsAPI.getCollectionWithItems(collectionId);
        if (!response?.success) {
          throw new Error(response?.message || LOAD_ERROR_MESSAGE);
        }

        const data = getCollectionData(response);
        setCollection(data);
        setItems(getCollectionItems(data));
      } catch (err) {
        const message = getErrorMessage(err, LOAD_ERROR_MESSAGE);
        onError?.(message);
      } finally {
        setLoading(false);
        inflightReloadRef.current = null;
      }
    })();

    inflightReloadRef.current = promise;
    return promise;
  }, [collectionId, onError, reset]);

  useEffect(() => {
    if (!collectionId) {
      reset();
      return;
    }

    reload();
  }, [collectionId, reload, reset]);

  return { collection, items, loading, reload, setCollection, setItems };
}
