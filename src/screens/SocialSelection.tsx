import React from "react";
import { ArrowRight, Check, MessageCircle, Send } from "lucide-react";
import { Button } from "../components/ui/Button";
import { useExperienceStore } from "../store/experienceStore";
import { sounds } from "../utils/audio";

export interface SocialPlatform {
  id: string;
  name: string;
  tagline: string;
  icon: React.ReactNode;
}

const HANDLE_HINT: Record<string, { placeholder: string; type: string; inputMode?: "tel" | "text" }> = {
  X: { placeholder: "@username", type: "text" },
  Facebook: { placeholder: "Username or name", type: "text" },
  Instagram: { placeholder: "@username", type: "text" },
  WhatsApp: { placeholder: "Phone number", type: "tel", inputMode: "tel" },
  Telegram: { placeholder: "@username", type: "text" },
};

export const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: "X",
    name: "X",
    tagline: "Public thoughts & real-time feeds",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    id: "Facebook",
    name: "Facebook",
    tagline: "Social graph & personal milestones",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" aria-hidden="true">
        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
      </svg>
    ),
  },
  {
    id: "Instagram",
    name: "Instagram",
    tagline: "Visual identity & daily stories",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="w-6 h-6 stroke-current fill-none"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    id: "WhatsApp",
    name: "WhatsApp",
    tagline: "Private chats & location sharing",
    icon: <MessageCircle size={24} strokeWidth={1.75} />,
  },
  {
    id: "Telegram",
    name: "Telegram",
    tagline: "Channels, groups & cloud messages",
    icon: <Send size={22} strokeWidth={1.75} />,
  },
];

export const SocialSelection: React.FC = () => {
  const {
    selectedSocials,
    toggleSocial,
    socialHandles,
    setSocialHandle,
    selectAllSocials,
    clearSocials,
    setStep,
    audioEnabled,
  } = useExperienceStore();

  const allIds = SOCIAL_PLATFORMS.map((s) => s.id);
  const isAllSelected = selectedSocials.length === SOCIAL_PLATFORMS.length;

  const handleToggle = (id: string) => {
    const isCurrentlySelected = selectedSocials.includes(id);
    if (audioEnabled) {
      sounds.playSelect(!isCurrentlySelected);
    }
    toggleSocial(id);
  };

  return (
    <div className="flex-1 w-full max-w-6xl mx-auto px-6 sm:px-12 py-10 flex flex-col justify-between overflow-y-auto">
      {/* Heading & Counter */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-nordic-border/50">
        <div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-nordic-ink">
            Which platforms do you use most?
          </h2>
          <p className="text-sm sm:text-base text-nordic-muted mt-1.5 font-normal">
            Select one, several, or all social media platforms you frequently use.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs text-nordic-muted">
          <span className="font-medium text-nordic-ink">
            {selectedSocials.length} of {SOCIAL_PLATFORMS.length} selected
          </span>
          <span>•</span>
          <button
            onClick={() => {
              if (isAllSelected) clearSocials();
              else selectAllSocials(allIds);
              if (audioEnabled) sounds.playClick();
            }}
            className="hover:text-nordic-ink underline cursor-pointer"
          >
            {isAllSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
      </div>

      {/* 5 Social Media Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 my-8">
        {SOCIAL_PLATFORMS.map((platform) => {
          const isSelected = selectedSocials.includes(platform.id);

          return (
            <div
              key={platform.id}
              onClick={() => handleToggle(platform.id)}
              className={`p-6 rounded-xl flex flex-col justify-between cursor-pointer transition-colors duration-150 select-none min-h-[190px] border ${
                isSelected
                  ? "bg-nordic-ink text-[#FAF8F5] border-nordic-ink"
                  : "bg-white text-nordic-ink border-nordic-border/80 hover:border-nordic-mutedLight"
              }`}
            >
              <div className="flex items-center justify-between pb-4">
                <span className={isSelected ? "text-nordic-accent" : "text-nordic-muted"}>
                  {platform.icon}
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

              <div>
                <h3 className="font-semibold text-lg tracking-tight leading-snug">
                  {platform.name}
                </h3>
                <p
                  className={`text-xs mt-2 leading-relaxed font-normal ${
                    isSelected ? "text-[#FAF8F5]/80" : "text-nordic-muted"
                  }`}
                >
                  {platform.tagline}
                </p>
                {isSelected && (
                  <input
                    type={HANDLE_HINT[platform.id]?.type || "text"}
                    inputMode={HANDLE_HINT[platform.id]?.inputMode}
                    value={socialHandles[platform.id] || ""}
                    onChange={(e) => setSocialHandle(platform.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={HANDLE_HINT[platform.id]?.placeholder || "Username"}
                    maxLength={40}
                    className="mt-3 w-full rounded-lg bg-white/10 border border-white/30 text-[#FAF8F5] placeholder:text-[#FAF8F5]/50 px-3 py-2 text-sm focus:outline-none focus:border-nordic-accent"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Action Bar */}
      <div className="pt-4 border-t border-nordic-border/50 flex items-center justify-between">
        <div className="text-xs text-nordic-muted">
          {selectedSocials.length === 0
            ? "Select at least one platform to continue."
            : `${selectedSocials.length} platform${selectedSocials.length > 1 ? "s" : ""} selected.`}
        </div>

        <Button
          size="lg"
          variant="primary"
          disabled={selectedSocials.length === 0}
          icon={<ArrowRight size={18} />}
          onClick={() => {
            if (audioEnabled) sounds.playClick();
            setStep("selection");
          }}
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
