import React, { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExperienceStore } from "../store/experienceStore";

export const Introduction: React.FC = () => {
  const setStep = useExperienceStore((state) => state.setStep);
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);

  const [hasEnded, setHasEnded] = useState(false);
  const [localVideoUrl] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Attempt browser fullscreen on mount
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      // Ignore if browser blocks fullscreen without user gesture
    });
  }, []);

  // Minimal organic Nordic audio-visual ambient canvas
  useEffect(() => {
    if (localVideoUrl) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let stepCount = 0;

    const render = () => {
      stepCount += !hasEnded ? 0.02 : 0;
      ctx.fillStyle = "#1E1D1B";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerY = canvas.height * 0.5;
      ctx.lineWidth = 1.5;

      for (let w = 0; w < 3; w++) {
        ctx.beginPath();
        ctx.strokeStyle =
          w === 0
            ? "rgba(214, 85, 43, 0.85)" // Terracotta
            : `rgba(247, 245, 240, ${0.15 + w * 0.1})`;

        for (let x = 0; x < canvas.width; x += 4) {
          const freq = 0.006 + w * 0.002;
          const amp = 24 + Math.sin(stepCount * 0.4 + w) * 12;
          const y =
            centerY +
            Math.sin(x * freq + stepCount * (w + 1) * 0.7) *
              amp *
              Math.sin((x / canvas.width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [hasEnded, localVideoUrl]);

  // Ambient canvas playback timer (22s) when no video file is provided
  useEffect(() => {
    if (localVideoUrl || hasEnded) return;

    const duration = 22000;
    const timer = setTimeout(() => {
      setHasEnded(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [localVideoUrl, hasEnded]);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#1E1D1B] z-50 flex items-center justify-center overflow-hidden select-none">
      {/* Non-interactive fullscreen video/canvas surface */}
      <div className="w-full h-full pointer-events-none">
        {localVideoUrl ? (
          <video
            ref={videoRef}
            src={localVideoUrl}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={!audioEnabled}
            onEnded={() => setHasEnded(true)}
          />
        ) : (
          <canvas ref={canvasRef} width={1920} height={1080} className="w-full h-full block object-cover" />
        )}
      </div>

      {/* Next button appears only after video finishes */}
      {hasEnded && (
        <div className="absolute bottom-12 right-12 z-10 pointer-events-auto">
          <Button
            size="lg"
            variant="primary"
            icon={<ArrowRight size={18} />}
            onClick={() => setStep("selection")}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
