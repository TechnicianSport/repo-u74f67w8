import { memo } from "react";
import { useCamera } from "../../hooks/useCamera";

export const CameraController = memo(function CameraController() {
  useCamera();
  return null;
});
