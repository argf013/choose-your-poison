import React from "react";
import { Camera, MessageSquare, MapPin, Heart, UserCheck, Check, ArrowRight } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExperienceStore } from "../store/experienceStore";
import { EXPRESSIONS } from "../data/expressions";
import { sounds } from "../utils/audio";

const ICONS: Record<string, React.ReactNode> = {
  Camera: <Camera size={22} strokeWidth={1.5} />,
  MessageSquareQuote: <MessageSquare size={22} strokeWidth={1.5} />,
  MapPin: <MapPin size={22} strokeWidth={1.5} />,
  HeartHandshake: <Heart size={22} strokeWidth={1.5} />,
  Fingerprint: <UserCheck size={22} strokeWidth={1.5} />,
};

export const Selection: React.FC = () => {
  const {
    selectedExpressionIds,
    toggleExpression,
    selectAllExpressions,
    clearSelections,
    setStep,
    audioEnabled,
  } = useExperienceStore();

  const handleToggle = (id: string) => {
    const isCurrentlySelected = selectedExpressionIds.includes(id);
    if (audioEnabled) {
      sounds.playSelect(!isCurrentlySelected);
    }
    toggleExpression(id);
  };

  const allIds = EXPRESSIONS.map((e) => e.id);
  const isAllSelected = selectedExpressionIds.length === EXPRESSIONS.length;
  const count = selectedExpressionIds.length;

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-12 py-10 flex flex-col justify-between overflow-y-auto">
      {/* Heading & Counter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-nordic-border/50">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-nordic-ink">
            What are you willing to share?
          </h2>
          <p className="text-sm sm:text-base text-nordic-muted mt-1.5 font-normal">
            Every expression is a choice. Every choice has a consequence.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-nordic-muted">
          <span className="font-medium text-nordic-ink">
            {count} of {EXPRESSIONS.length} selected
          </span>
          <span>•</span>
          <button
            onClick={() => {
              if (isAllSelected) clearSelections();
              else selectAllExpressions(allIds);
              if (audioEnabled) sounds.playClick();
            }}
            className="hover:text-nordic-ink underline cursor-pointer"
          >
            {isAllSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
      </div>

      {/* 5 Nordic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 my-8">
        {EXPRESSIONS.map((item) => {
          const isSelected = selectedExpressionIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => handleToggle(item.id)}
              className={`p-6 rounded-xl flex flex-col justify-between cursor-pointer transition-colors duration-150 select-none min-h-[240px] border ${
                isSelected
                  ? "bg-nordic-ink text-[#FAF8F5] border-nordic-ink"
                  : "bg-white text-nordic-ink border-nordic-border/80 hover:border-nordic-mutedLight"
              }`}
            >
              <div>
                {/* Top: Icon & Check circle */}
                <div className="flex items-center justify-between pb-4">
                  <span className={isSelected ? "text-nordic-accent" : "text-nordic-muted"}>
                    {ICONS[item.iconName]}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? "bg-nordic-accent text-white"
                        : "border border-nordic-border bg-nordic-bg/50"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={2.5} />}
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base tracking-tight leading-snug">
                  {item.title}
                </h3>

                {/* Description */}
                <p
                  className={`text-xs mt-2.5 leading-relaxed font-normal ${
                    isSelected ? "text-[#FAF8F5]/80" : "text-nordic-muted"
                  }`}
                >
                  {item.description}
                </p>
              </div>

              {/* Bottom: Risk statement */}
              <div
                className={`pt-4 mt-4 border-t text-[11px] ${
                  isSelected
                    ? "border-white/10 text-nordic-accent font-medium"
                    : "border-nordic-border/50 text-nordic-muted"
                }`}
              >
                <span>Risk: {item.primaryRisk}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-nordic-border/50">
        <Button size="md" variant="ghost" onClick={() => setStep("introduction")}>
          ← Back
        </Button>

        <Button
          size="lg"
          variant={count > 0 ? "primary" : "outline"}
          disabled={count === 0}
          icon={<ArrowRight size={18} />}
          onClick={() => setStep("reflection")}
        >
          Review consequences
        </Button>
      </div>
    </div>
  );
};
