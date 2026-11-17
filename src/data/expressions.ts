import { ExpressionItem } from "../types";

export const EXPRESSIONS: ExpressionItem[] = [
  {
    id: "share-face",
    code: "01",
    title: "SHARE MY FACE",
    subtitle: "Visual Representation",
    description:
      "Uploading or publishing personal photographs, self-portraits, and facial imagery.",
    primaryRisk: "IDENTITY EXPOSURE",
    risks: [
      "Facial recognition indexing",
      "Biometric dataset scraping",
      "Synthetic likeness generation (Deepfakes)",
      "Permanent public identification",
    ],
    consequenceQuote: "Your face can become more than a photograph. It can become a data point.",
    category: "visual",
    iconName: "Camera",
  },
  {
    id: "speak-mind",
    code: "02",
    title: "SPEAK MY MIND",
    subtitle: "Ideological Expression",
    description: "Expressing opinions, philosophical stances, and personal beliefs publicly.",
    primaryRisk: "PUBLIC SCRUTINY",
    risks: [
      "Context collapse & ideological mobbing",
      "Permanent archival of temporary emotions",
      "Targeted harassment & reputational auditing",
      "Algorithmic polarization indexing",
    ],
    consequenceQuote:
      "Your words can travel further than you intended, and remain accessible longer than you expected.",
    category: "voice",
    iconName: "MessageSquareQuote",
  },
  {
    id: "share-location",
    code: "03",
    title: "SHARE MY LOCATION",
    subtitle: "Spatial Presence",
    description:
      "Sharing current geographic coordinates, travel itineraries, and movement patterns.",
    primaryRisk: "LOCATION TRACKING",
    risks: [
      "Predictive behavioral tracking",
      "Physical privacy perimeter compromise",
      "Spatial pattern exploitation by brokers",
      "Real-time physical vulnerability",
    ],
    consequenceQuote:
      "Every location you share can reveal patterns about where you live, work, and spend your time.",
    category: "spatial",
    iconName: "MapPin",
  },
  {
    id: "share-life",
    code: "04",
    title: "SHARE MY LIFE",
    subtitle: "Intimate Narrative",
    description:
      "Publishing personal relationships, daily routines, milestones, and private moments.",
    primaryRisk: "DATA EXPLOITATION",
    risks: [
      "Loss of contextual interpersonal boundaries",
      "Monetization of domestic intimacy",
      "Psychographic vulnerability profiling",
      "Involuntary inclusion of third parties",
    ],
    consequenceQuote:
      "What was once an ephemeral human moment becomes permanent material for machine learning models.",
    category: "intimate",
    iconName: "HeartHandshake",
  },
  {
    id: "share-identity",
    code: "05",
    title: "SHARE MY IDENTITY",
    subtitle: "Civic & Personal Records",
    description:
      "Sharing verified credentials, demographic attributes, and identifying personal data.",
    primaryRisk: "IDENTITY MISUSE",
    risks: [
      "Social graph mapping & profiling",
      "Cross-platform correlation & dossier creation",
      "Targeted behavioral manipulation",
      "Compromised credential vulnerabilities",
    ],
    consequenceQuote:
      "When identity is decentralized into public feeds, ownership of who you are shifts to those who catalog you.",
    category: "civic",
    iconName: "Fingerprint",
  },
];

export const INSTALLATION_INFO = {
  title: "CHOOSE YOUR POISON",
  subtitle: "AN INTERACTIVE EXPLORATION OF DIGITAL FREEDOM AND ITS CONSEQUENCES",
  manifesto:
    "Being free to express yourself also means accepting the consequences of that freedom.",
  terminalId: "TERMINAL 01",
  location: "INTERACTIVE DIGITAL EXHIBITION",
  version: "v2.5",
};
