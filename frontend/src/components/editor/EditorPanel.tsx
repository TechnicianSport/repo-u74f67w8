import { memo } from "react";
import { useEditorStore } from "../../store/useEditorStore";

export const EditorPanel = memo(function EditorPanel() {
  const transformMode = useEditorStore((s) => s.transformMode);
  const setTransformMode = useEditorStore((s) => s.setTransformMode);
  const sceneObjects = useEditorStore((s) => s.sceneObjects);
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const setSelectedObject = useEditorStore((s) => s.setSelectedObject);
  const toggleObjectVisibility = useEditorStore((s) => s.toggleObjectVisibility);
  const toggleEditor = useEditorStore((s) => s.toggleEditor);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      {/* Toolbar */}
      <div
        className="absolute top-12 left-0 right-0 h-10 bg-[#050D1A]/95 border-b border-[#0D2137] flex items-center px-4 gap-2"
        style={{ pointerEvents: "auto" }}
      >
        <button
          onClick={() => setTransformMode("translate")}
          className={`px-3 py-1 text-[10px] uppercase border ${
            transformMode === "translate"
              ? "border-[#0088FF] text-[#0088FF]"
              : "border-[#0D2137] text-[#7799BB] hover:text-white"
          }`}
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          Move W
        </button>
        <button
          onClick={() => setTransformMode("rotate")}
          className={`px-3 py-1 text-[10px] uppercase border ${
            transformMode === "rotate"
              ? "border-[#0088FF] text-[#0088FF]"
              : "border-[#0D2137] text-[#7799BB] hover:text-white"
          }`}
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          Rotate E
        </button>
        <button
          onClick={() => setTransformMode("scale")}
          className={`px-3 py-1 text-[10px] uppercase border ${
            transformMode === "scale"
              ? "border-[#0088FF] text-[#0088FF]"
              : "border-[#0D2137] text-[#7799BB] hover:text-white"
          }`}
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          Scale R
        </button>

        <div className="w-px h-6 bg-[#0D2137] mx-2" />

        <button
          onClick={() => undo()}
          className="px-3 py-1 text-[10px] uppercase border border-[#0D2137] text-[#7799BB] hover:text-white"
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          Undo
        </button>
        <button
          onClick={() => redo()}
          className="px-3 py-1 text-[10px] uppercase border border-[#0D2137] text-[#7799BB] hover:text-white"
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          Redo
        </button>

        <div className="flex-1" />

        <button
          onClick={toggleEditor}
          className="px-3 py-1 text-[10px] uppercase border border-red-900/50 text-red-400 hover:bg-red-900/20"
          style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
        >
          Exit Editor
        </button>
      </div>

      {/* Hierarchy Panel */}
      <div
        className="absolute left-0 top-[88px] bottom-0 w-[200px] bg-[#020408]/95 backdrop-blur-md border-r border-[#0D2137] overflow-y-auto"
        style={{ pointerEvents: "auto" }}
      >
        <div className="p-3 border-b border-[#0D2137]">
          <span
            className="text-[10px] uppercase tracking-wider text-[#7799BB]"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Hierarchy
          </span>
        </div>
        <div className="p-2">
          <div className="text-[10px] text-[#7799BB] mb-2" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Scene
          </div>
          {sceneObjects.map((obj) => (
            <div
              key={obj.id}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors ${
                selectedObjectId === obj.id
                  ? "bg-[#0A1628] border-l-2 border-[#0088FF]"
                  : "hover:bg-[#0A1628]/50 border-l-2 border-transparent"
              }`}
              onClick={() => setSelectedObject(obj.id)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleObjectVisibility(obj.id);
                }}
                className={`text-[10px] ${obj.visible ? "text-[#7799BB]" : "text-[#334455]"}`}
              >
                {obj.visible ? "&#128065;" : "&#128064;"}
              </button>
              <span
                className={`text-[11px] ${
                  selectedObjectId === obj.id ? "text-[#E0EEFF]" : "text-[#7799BB]"
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {obj.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Inspector Panel */}
      <div
        className="absolute right-0 top-[88px] bottom-0 w-[250px] bg-[#020408]/95 backdrop-blur-md border-l border-[#0D2137] overflow-y-auto"
        style={{ pointerEvents: "auto" }}
      >
        <div className="p-3 border-b border-[#0D2137]">
          <span
            className="text-[10px] uppercase tracking-wider text-[#7799BB]"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            Inspector
          </span>
        </div>
        {selectedObjectId ? (
          <div className="p-3">
            <div className="mb-4">
              <div
                className="text-[9px] uppercase text-[#334455] mb-2"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Transform
              </div>
              {["Position", "Rotation", "Scale"].map((label) => (
                <div key={label} className="mb-2">
                  <div className="text-[10px] text-[#7799BB] mb-1" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                    {label}
                  </div>
                  <div className="flex gap-1">
                    {["X", "Y", "Z"].map((axis) => (
                      <div key={axis} className="flex-1">
                        <label className="text-[8px] text-[#334455]">{axis}</label>
                        <input
                          type="number"
                          step={label === "Scale" ? 0.1 : 0.5}
                          defaultValue={label === "Scale" ? 1 : 0}
                          className="w-full bg-[#0A1628] border border-[#0D2137] text-[#E0EEFF] text-[10px] px-1 py-0.5 focus:border-[#0088FF] outline-none"
                          style={{ borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <button
                className="w-full px-2 py-1 text-[10px] uppercase text-[#7799BB] border border-[#0D2137] hover:text-white hover:border-[#1A4A7A] mt-2"
                style={{ borderRadius: "2px", fontFamily: "'Rajdhani', sans-serif" }}
              >
                Reset
              </button>
            </div>

            <div className="mb-4">
              <div
                className="text-[9px] uppercase text-[#334455] mb-2"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Material
              </div>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="text-[8px] text-[#334455]">Color</label>
                  <input
                    type="color"
                    defaultValue="#0D1B2A"
                    className="w-full h-6 bg-transparent border border-[#0D2137] cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-[8px] text-[#334455]">Emissive</label>
                  <input
                    type="color"
                    defaultValue="#0A1520"
                    className="w-full h-6 bg-transparent border border-[#0D2137] cursor-pointer"
                  />
                </div>
              </div>
              <div className="mb-1">
                <label className="text-[8px] text-[#334455]">Roughness</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.7"
                  className="w-full h-1 appearance-none bg-[#0A1628]"
                />
              </div>
              <div className="mb-1">
                <label className="text-[8px] text-[#334455]">Metalness</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  defaultValue="0.4"
                  className="w-full h-1 appearance-none bg-[#0A1628]"
                />
              </div>
            </div>

            <div>
              <div
                className="text-[9px] uppercase text-[#334455] mb-2"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                Animation
              </div>
              <select
                className="w-full bg-[#0A1628] border border-[#0D2137] text-[#E0EEFF] text-[10px] px-2 py-1 outline-none focus:border-[#0088FF]"
                style={{ borderRadius: "2px", fontFamily: "'IBM Plex Mono', monospace" }}
                defaultValue="none"
              >
                <option value="none">None</option>
                <option value="float">Float</option>
                <option value="rotate">Rotate</option>
                <option value="pulse">Pulse</option>
                <option value="patrol">Patrol</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="p-3 text-[10px] text-[#334455] text-center" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
            Select an object
          </div>
        )}
      </div>
    </div>
  );
});
