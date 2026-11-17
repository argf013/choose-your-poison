import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExperienceStore } from "../store/experienceStore";

export const Welcome: React.FC = () => {
  const setStep = useExperienceStore((state) => state.setStep);

  return (
    <div className="flex-1 w-full flex flex-col justify-center items-center px-6 sm:px-12 py-16 text-center max-w-4xl mx-auto">
      {/* Title */}
      <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-nordic-ink leading-[0.98]">
        CHOOSE
        <br />
        YOUR POISON
      </h1>

      {/* Supporting text */}
      <div className="mt-8 sm:mt-10 max-w-2xl">
        <p className="text-xl sm:text-2xl text-nordic-ink/85 font-normal leading-relaxed">
          Freedom of expression comes with a price.
          <br className="hidden sm:inline" /> What are you willing to give up?
        </p>

        <p className="text-sm sm:text-base text-nordic-muted mt-4 leading-relaxed font-normal">
          An interactive exploration of digital freedom and its consequences.
        </p>
      </div>

      {/* Primary CTA */}
      <div className="mt-10 sm:mt-12">
        <Button
          size="xl"
          variant="primary"
          icon={<ArrowRight size={18} />}
          onClick={() => setStep("introduction")}
        >
          Enter the experience
        </Button>
      </div>
    </div>
  );
};
