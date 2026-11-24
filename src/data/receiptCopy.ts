/**
 * Copy and logos used on the printed receipt (preview + ESC/POS).
 */

export const SOCIAL_COPY: Record<string, { name: string; description: string }> = {
  X: {
    name: "X",
    description: "A place for short public posts. Anyone can read what you write.",
  },
  Facebook: {
    name: "Facebook",
    description: "Keeps your friends, family and life updates in one place.",
  },
  Instagram: {
    name: "Instagram",
    description: "An app for sharing photos and videos. Anything you post can be seen by a lot of people.",
  },
  WhatsApp: {
    name: "WhatsApp",
    description: "Private chats that often include your phone number and location.",
  },
  Telegram: {
    name: "Telegram",
    description: "Chats, groups and channels, with messages stored in the cloud.",
  },
};

/** Monochrome SVG inner markup (24x24 viewBox) per platform. */
const LOGO_INNER: Record<string, { fill: boolean; inner: string }> = {
  X: {
    fill: true,
    inner:
      '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>',
  },
  Facebook: {
    fill: true,
    inner:
      '<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>',
  },
  Instagram: {
    fill: false,
    inner:
      '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>',
  },
  WhatsApp: {
    fill: false,
    inner: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
  },
  Telegram: {
    fill: false,
    inner: '<path d="M22 2 11 13"/><path d="M22 2 15 22 11 13 2 9 22 2z"/>',
  },
};

export function socialLogoSvg(id: string, size = 96): string | null {
  const logo = LOGO_INNER[id];
  if (!logo) return null;
  const paint = logo.fill
    ? 'fill="#000"'
    : 'fill="none" stroke="#000" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ${paint}>${logo.inner}</svg>`;
}

export function socialLogoDataUrl(id: string, size = 96): string | null {
  const svg = socialLogoSvg(id, size);
  return svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : null;
}

/** Side dishes: what the visitor shared, mapped from expression ids. */
export const SIDE_DISH_COPY: Record<string, { title: string; why: string }> = {
  "share-face": {
    title: "PHOTO",
    why: "Your face can be used to recognize you, not just to look at.",
  },
  "speak-mind": {
    title: "OPINION",
    why: "Words stay online long after you've moved on from them.",
  },
  "share-location": {
    title: "ADDRESS",
    why: "Other people can find out where you live.",
  },
  "share-life": {
    title: "STORY",
    why: "Once a story is shared, it's hard to take back and can stay around for a long time.",
  },
  "share-identity": {
    title: "IDENTITY",
    why: "Personal details can be pieced together to build a profile of you.",
  },
};
