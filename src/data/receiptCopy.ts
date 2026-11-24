/**
 * Copy and logos used on the printed receipt (preview + ESC/POS).
 */

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
    fill: true,
    inner:
      '<path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.391c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.078c-.25.703-1.438 1.344-1.984 1.422-.5.078-1.141.109-1.844-.109-.438-.141-.984-.328-1.688-.641-2.969-1.281-4.906-4.281-5.047-4.469-.156-.203-1.203-1.609-1.203-3.063 0-1.453.766-2.172 1.031-2.469.281-.297.609-.375.813-.375.203 0 .406 0 .578.016.188.016.438-.078.688.516.25.609.859 2.094.938 2.25.078.156.125.328.031.531-.109.203-.156.328-.313.5-.156.172-.313.391-.453.531-.156.141-.313.297-.141.594.188.297.797 1.313 1.719 2.125 1.188 1.047 2.172 1.375 2.484 1.531.297.141.469.125.641-.078.188-.203.75-.875.953-1.172.203-.297.406-.25.688-.156.281.109 1.781.844 2.094 1 .313.156.516.234.594.359.078.125.078.734-.172 1.438z"/>',
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
