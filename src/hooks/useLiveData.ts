import { useState, useEffect, useCallback } from "react";

export function useLiveData<T>(
  fetcher: () => Promise<T>,
  intervalMs = 30000
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const result = await fetcher();
      setData(result);
      setLastUpdated(new Date());
      setError(null);
    } catch (e: any) {
      setError(e.message ?? "Error fetching data");
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [load, intervalMs]);

  return { data, loading, error, lastUpdated, refresh: load };
}
