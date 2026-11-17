import React from "react";
import { ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExperienceStore } from "../store/experienceStore";
import { EXPRESSIONS } from "../data/expressions";

export const Reflection: React.FC = () => {
  const { selectedExpressionIds, setStep } = useExperienceStore();

  const selectedExpressions = EXPRESSIONS.filter((item) => selectedExpressionIds.includes(item.id));

  return (
    <div className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-12 py-10 flex flex-col justify-between overflow-y-auto">
      {/* Header */}
      <div className="pb-6 border-b border-nordic-border/50">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-nordic-ink">
          The consequences of your choices
        </h2>
        <p className="text-sm sm:text-base text-nordic-muted mt-1.5 font-normal">
          Every expression carries potential systemic risks.
        </p>
      </div>

      {/* Selected Consequences */}
      <div className="my-8 space-y-4">
        {selectedExpressions.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl p-6 sm:p-7 border border-nordic-border/80 shadow-subtle flex flex-col sm:flex-row sm:items-start justify-between gap-6"
          >
            <div className="sm:w-1/3">
              <span className="text-[11px] font-mono text-nordic-accent tracking-wider uppercase">
                {item.primaryRisk}
              </span>
              <h3 className="text-lg font-semibold text-nordic-ink mt-0.5">{item.title}</h3>
              <p className="text-xs text-nordic-muted mt-1">{item.description}</p>
            </div>

            <div className="sm:w-2/3 border-t sm:border-t-0 sm:border-l border-nordic-border/60 pt-4 sm:pt-0 sm:pl-6">
              <p className="text-sm sm:text-base font-medium text-nordic-ink leading-relaxed italic">
                &ldquo;{item.consequenceQuote}&rdquo;
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {item.risks.map((risk, rIdx) => (
                  <span
                    key={rIdx}
                    className="inline-block bg-nordic-bg px-2.5 py-1 rounded-md text-[11px] text-nordic-muted"
                  >
                    {risk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Moral Prompt Box */}
      <div className="bg-nordic-ink text-[#FAF8F5] rounded-2xl p-7 sm:p-9 shadow-soft">
        <h3 className="text-xl sm:text-2xl font-semibold tracking-tight">
          You know the risks.
          <br />
          Do you still choose to proceed?
        </h3>
        <p className="text-xs sm:text-sm text-[#FAF8F5]/70 mt-2 max-w-xl leading-relaxed">
          Proceeding will generate a personal physical receipt documenting your conscious choices.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <Button
            size="lg"
            variant="accent"
            icon={<ArrowRight size={18} />}
            onClick={() => setStep("receipt")}
            className="w-full sm:w-auto"
          >
            I accept the consequences
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={() => setStep("selection")}
            className="w-full sm:w-auto text-[#FAF8F5]/75 hover:text-white hover:bg-white/10"
          >
            Reconsider my choices
          </Button>
        </div>
      </div>
    </div>
  );
};
