import { env } from './env';

/**
 * The words and addresses that are the same on every page. They live in the
 * repository, so a change goes through a pull request.
 */
export const site = {
  name: 'Vows Weddings',
  wordmark: 'VOWS',
  tagline: 'Make your day forever vow.',
  email: 'info.vowslk@gmail.com',
  phone: '+94 71 657 0999',
  place: 'Wadduwa, Kalutara, Sri Lanka',
  placeShort: 'Wadduwa',
  mapUrl: 'https://www.google.com/maps/search/?api=1&query=Wadduwa%2C+Kalutara%2C+Sri+Lanka',
  since: 'Since 2013',
  copyright: '©2026 VOWS Weddings',
  /** The rates sheet. Left out of the footer until there is a file to link. */
  ratesPdf: null as string | null,
  track: 'First Light',
  intro: {
    desktop:
      'We have photographed weddings in Sri Lanka since 2013 — in temples and on beaches, at midday and long after dark. We stay out of the way, and we keep the pictures that still feel like the day.',
    tablet:
      'We have photographed weddings in Sri Lanka since 2013 — in temples and on beaches, at midday and long after dark.',
    mobile: 'We stay out of the way and keep the pictures that still feel like the day.',
  },
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/' },
    { label: 'Pinterest', href: 'https://www.pinterest.com/' },
    { label: 'Facebook', href: 'https://www.facebook.com/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/' },
    { label: 'WhatsApp', href: 'https://wa.me/94716570999' },
  ],
} as const;

export const routes = {
  home: { label: site.wordmark, href: '/' },
  contact: { label: 'Contact', href: '/contact' },
  chat: { label: 'Chat with Dinuka', href: '/contact' },
  privacy: { label: 'Privacy Policy', href: '/privacy' },
  cookies: { label: 'Cookies Policy', href: '/privacy#cookies' },
} as const;

/** One loop, fetched only after the visitor asks for it. */
export const music = {
  m4a: `${env.MEDIA_URL.replace(/\/$/, '')}/audio/vows-theme.m4a`,
  ogg: `${env.MEDIA_URL.replace(/\/$/, '')}/audio/vows-theme.ogg`,
} as const;
