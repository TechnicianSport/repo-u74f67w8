import { useState, useEffect, useCallback } from "react";
import { WorldMap } from "./components/map/WorldMap";
import { HUD } from "./components/ui/HUD";
import { LoadingScreen } from "./components/ui/LoadingScreen";
import { useNewsSocket } from "./hooks/useNewsSocket";
import { useNewsStore } from "./store/useNewsStore";
import { useModeStore } from "./store/useModeStore";
import { useMapStore } from "./store/useMapStore";
import { VITE_MOCK_NEWS } from "./constants/mapConfig";
import {
  generateMockPackages,
  createMockLiveSimulator,
} from "./data/mockProvider";

function App() {
  const [loaded, setLoaded] = useState(false);
  const mode = useModeStore((s) => s.mode);

  useNewsSocket();

  useEffect(() => {
    if (!VITE_MOCK_NEWS) return;
    if (!loaded) return;

    const packages = generateMockPackages(50);
    useNewsStore.getState().addPackages(packages);
    useMapStore.getState().setWsConnected(true);

    const simulator = createMockLiveSimulator(
      (pkg) => {
        if (useModeStore.getState().mode === "live" && !useModeStore.getState().isPaused) {
          useNewsStore.getState().addPackage(pkg);
          useModeStore.getState().setLastUpdate(Date.now());
        }
      },
      (pkg) => {
        if (useModeStore.getState().mode === "live") {
          useMapStore.getState().triggerBreaking(pkg);
          useNewsStore.getState().pushBreaking(pkg);
        }
      }
    );

    if (mode === "live") {
      simulator.start();
    }

    return () => {
      simulator.stop();
    };
  }, [loaded, mode]);

  const handleLoadComplete = useCallback(() => {
    setLoaded(true);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-[#020408]">
      {!loaded && <LoadingScreen onComplete={handleLoadComplete} />}
      <WorldMap />
      {loaded && <HUD />}
    </div>
  );
}

export default App;
