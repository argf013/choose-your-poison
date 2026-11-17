import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, RotateCcw, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExperienceStore } from "../store/experienceStore";

const NARRATIVE_LINES = [
  "We live in an age where everyone has the freedom to express themselves.",
  "We share our faces, opinions, locations, and personal stories.",
  "But every expression leaves something behind.",
  "Our identities become data. Our opinions become public property. Our privacy becomes negotiable.",
  "We know the risks.",
  "Yet we continue.",
  "Because freedom is a choice, even when that choice comes with consequences.",
];

export const Introduction: React.FC = () => {
  const setStep = useExperienceStore((state) => state.setStep);
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);

  const [isPlaying, setIsPlaying] = useState(true);
  const [activeLineIndex, setActiveLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [hasEnded, setHasEnded] = useState(false);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(!audioEnabled);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
      stepCount += isPlaying ? 0.02 : 0;
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
  }, [isPlaying, localVideoUrl]);

  useEffect(() => {
    if (!isPlaying) return;

    const duration = 22000;
    const intervalTime = 100;
    const stepIncrement = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          setHasEnded(true);
          return 100;
        }

        const lineIdx = Math.min(
          NARRATIVE_LINES.length - 1,
          Math.floor((next / 100) * NARRATIVE_LINES.length)
        );
        setActiveLineIndex(lineIdx);
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying]);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setProgress(0);
    setActiveLineIndex(0);
    setHasEnded(false);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-12 py-10 flex flex-col justify-between overflow-y-auto">
      {/* Top Bar: Skip button */}
      <div className="flex justify-end mb-4">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setStep("selection")}
          className="text-nordic-muted hover:text-nordic-ink"
        >
          Skip introduction →
        </Button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center my-auto">
        {/* Left: Video / Projection Surface */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="relative aspect-video w-full bg-[#1E1D1B] rounded-xl overflow-hidden shadow-soft flex items-center justify-center">
            {localVideoUrl ? (
              <video
                ref={videoRef}
                src={localVideoUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted={isMuted}
                onEnded={() => setHasEnded(true)}
              />
            ) : (
              <canvas ref={canvasRef} width={800} height={450} className="w-full h-full block" />
            )}

            {/* Subtitle pill */}
            <div className="absolute bottom-10 inset-x-6 text-center">
              <span className="inline-block bg-[#161514]/85 text-[#FAF8F5] text-xs sm:text-sm px-4 py-2 rounded-full backdrop-blur-sm max-w-xl">
                &ldquo;{NARRATIVE_LINES[activeLineIndex]}&rdquo;
              </span>
            </div>

            {/* Subtle Controls */}
            <div className="absolute bottom-0 inset-x-0 h-10 px-4 flex items-center justify-between text-[#FAF8F5]/80 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleTogglePlay}
                  className="p-1 hover:text-white"
                  aria-label="Play/Pause"
                >
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={handleRestart}
                  className="p-1 hover:text-white"
                  aria-label="Restart"
                >
                  <RotateCcw size={13} />
                </button>
              </div>

              {/* Progress track */}
              <div className="flex-1 mx-4 bg-white/20 h-1 rounded-full overflow-hidden">
                <div
                  className="bg-nordic-accent h-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="p-1 hover:text-white"
                aria-label="Mute"
              >
                {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Narrative Editorial */}
        <div className="lg:col-span-5 flex flex-col justify-center space-y-6">
          <div className="space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-nordic-ink">
              Every expression leaves something behind.
            </h2>

            <div className="space-y-3 pt-2 text-sm sm:text-base text-nordic-muted leading-relaxed">
              {NARRATIVE_LINES.map((line, idx) => {
                const isCurrent = idx === activeLineIndex;

                return (
                  <p
                    key={idx}
                    className={`transition-all duration-300 ${
                      isCurrent
                        ? "text-nordic-ink font-medium pl-3 border-l-2 border-nordic-accent"
                        : "opacity-45 pl-3 border-l-2 border-transparent"
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          </div>

          <div className="pt-4">
            <Button
              size="lg"
              variant="primary"
              icon={<ArrowRight size={18} />}
              onClick={() => setStep("selection")}
            >
              Choose your expression
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
