import { useCallback } from "react";
import { useNewsStore } from "../store/useNewsStore";
import { useModeStore } from "../store/useModeStore";
import { VITE_API_URL, VITE_MOCK_NEWS } from "../constants/mapConfig";

export function useArchiveFetch() {
  const setLoading = useModeStore((s) => s.setLoading);
  const setLastUpdate = useModeStore((s) => s.setLastUpdate);

  const fetchDate = useCallback(
    async (date: string) => {
      setLoading(true);
      useNewsStore.getState().clearPackages();

      if (VITE_MOCK_NEWS) {
        await new Promise((r) => setTimeout(r, 800));
        const { generateMockPackagesForDate } = await import(
          "../data/mockProvider"
        );
        const packages = generateMockPackagesForDate(date);
        useNewsStore.getState().addPackages(packages);
        setLoading(false);
        setLastUpdate(Date.now());
        return;
      }

      try {
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const res = await fetch(
            `${VITE_API_URL}/api/packages?date=${date}&limit=${limit}&offset=${offset}`
          );
          const data = await res.json();
          useNewsStore.getState().addPackages(data.packages);
          offset += data.packages.length;
          hasMore = data.packages.length === limit && offset < data.total;
        }
      } catch (err) {
        console.error("Archive fetch failed:", err);
      }

      setLoading(false);
      setLastUpdate(Date.now());
    },
    [setLoading, setLastUpdate]
  );

  return { fetchDate };
}
