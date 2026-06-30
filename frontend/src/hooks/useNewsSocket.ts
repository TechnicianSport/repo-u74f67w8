import { useEffect, useRef, useCallback } from "react";
import { useNewsStore } from "../store/useNewsStore";
import { useMapStore } from "../store/useMapStore";
import { useModeStore } from "../store/useModeStore";
import { VITE_WS_URL, VITE_MOCK_NEWS } from "../constants/mapConfig";
import type { NewsPackage } from "../types/news.types";

export function useNewsSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectDelayRef = useRef(1000);
  const connectRef = useRef<(() => void) | undefined>(undefined);

  const mode = useModeStore((s) => s.mode);
  const setLastUpdate = useModeStore((s) => s.setLastUpdate);

  const scheduleReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
    }
    reconnectTimerRef.current = setTimeout(() => {
      reconnectDelayRef.current = Math.min(
        reconnectDelayRef.current * 2,
        30000
      );
      connectRef.current?.();
    }, reconnectDelayRef.current);
  }, []);

  const connect = useCallback(() => {
    if (VITE_MOCK_NEWS) return;

    try {
      const ws = new WebSocket(VITE_WS_URL);

      ws.onopen = () => {
        useMapStore.getState().setWsConnected(true);
        reconnectDelayRef.current = 1000;
        ws.send(JSON.stringify({ type: "request_today_packages" }));
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          switch (msg.type) {
            case "new_package": {
              const pkg = msg.package as NewsPackage;
              useNewsStore.getState().addPackage(pkg);
              setLastUpdate(Date.now());
              if (pkg.classification.is_breaking) {
                useMapStore.getState().triggerBreaking(pkg);
                useNewsStore.getState().pushBreaking(pkg);
              }
              break;
            }
            case "breaking_alert": {
              const pkg = msg.package as NewsPackage;
              useMapStore.getState().triggerBreaking(pkg);
              useNewsStore.getState().pushBreaking(pkg);
              break;
            }
            case "heartbeat": {
              setLastUpdate(Date.now());
              break;
            }
            case "connected": {
              useMapStore.getState().setWsConnected(true);
              break;
            }
            case "today_packages": {
              if (msg.packages) {
                useNewsStore.getState().addPackages(msg.packages);
              }
              break;
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      ws.onclose = () => {
        useMapStore.getState().setWsConnected(false);
        wsRef.current = null;
        scheduleReconnect();
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      scheduleReconnect();
    }
  }, [setLastUpdate, scheduleReconnect]);

  connectRef.current = connect;

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    useMapStore.getState().setWsConnected(false);
  }, []);

  useEffect(() => {
    if (mode === "live" && !VITE_MOCK_NEWS) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [mode, connect, disconnect]);

  return { connect, disconnect };
}
