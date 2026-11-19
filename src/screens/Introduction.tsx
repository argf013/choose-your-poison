import React, { useState, useRef, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExperienceStore } from "../store/experienceStore";

const VIDEO_URL =
  "https://res.cloudinary.com/dtx1gozwq/video/upload/v1781859976/glitch_jadi_huqdwn.mp4";

export const Introduction: React.FC = () => {
  const setStep = useExperienceStore((state) => state.setStep);
  const audioEnabled = useExperienceStore((state) => state.audioEnabled);

  const [showNext, setShowNext] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Attempt browser fullscreen on mount
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      // Ignore if browser blocks fullscreen without user gesture
    });
  }, []);

  // Show Next button after 5 seconds of video playback
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowNext(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#1E1D1B] z-50 flex items-center justify-center overflow-hidden select-none">
      {/* Non-interactive fullscreen video */}
      <div className="w-full h-full pointer-events-none">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={!audioEnabled}
          onTimeUpdate={(e) => {
            if (!showNext && e.currentTarget.currentTime >= 5) {
              setShowNext(true);
            }
          }}
          onEnded={() => setShowNext(true)}
        />
      </div>

      {/* Centered Next button after 5 seconds */}
      {showNext && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-auto">
          <Button
            size="lg"
            variant="primary"
            icon={<ArrowRight size={18} />}
            onClick={() => setStep("social")}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
