import { useCallback, useState } from "react";

const DEFAULT_ERROR_MESSAGE = "Request failed";

const getRequestErrorMessage = (error, fallback = DEFAULT_ERROR_MESSAGE) =>
  error?.response?.data?.message || error?.message || fallback;

export default function useApiRequest({ initialLoading = false } = {}) {
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState("");

  const run = useCallback(async (request, options = {}) => {
    const {
      fallbackMessage = DEFAULT_ERROR_MESSAGE,
      onError,
      onSuccess,
      setLoadingState = true,
      clearError = true,
      rethrow = false,
    } = options;

    if (clearError) setError("");
    if (setLoadingState) setLoading(true);

    try {
      const result = await request();
      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = getRequestErrorMessage(err, fallbackMessage);
      setError(message);
      onError?.(message, err);
      if (rethrow) throw err;
      return null;
    } finally {
      if (setLoadingState) setLoading(false);
    }
  }, []);

  return { loading, error, run, setError, setLoading };
}
