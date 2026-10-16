export interface PrivacySection {
  id: string;
  heading: string;
  body: string;
}

/** Edited by hand whenever the words below change. */
export const LAST_UPDATED = '11 October 2026';

export const INTRO =
  'This is a small studio and a small website. We hold almost nothing about you, and this page says exactly what.';

/** The retention period here and the one the API enforces are the same number. */
export const SECTIONS: PrivacySection[] = [
  {
    id: 'what-we-collect',
    heading: 'What we collect',
    body: 'Only what you type into the contact form: your name, your email, your phone number if you give one, the wedding date and place, and your message. Nothing is collected while you browse.',
  },
  {
    id: 'why-we-keep-it',
    heading: 'Why we keep it',
    body: 'So we can reply to you, and so we can plan your day if you book us. That is all. We never sell it and we never add you to a mailing list.',
  },
  {
    id: 'how-long',
    heading: 'How long we keep it',
    body: 'Enquiries are kept for twenty-four months and then deleted. If you want yours removed sooner, write to us and we will do it.',
  },
  {
    id: 'who-else',
    heading: 'Who else sees it',
    body: 'The company that delivers our email, and the companies that host the website. They hold it only to do that job. Nobody else sees it.',
  },
  {
    id: 'cookies',
    heading: 'Cookies',
    body: 'None for tracking. We count page visits in a way that stores nothing about you and sets no cookie. The only cookie on this site keeps the studio signed in to its own tools, and that is only for us.',
  },
  {
    id: 'the-photographs',
    heading: 'The photographs',
    body: 'We publish a wedding only when the couple has agreed to it. If you appear in a photograph here and would like it taken down, write to us and we will remove it.',
  },
];

export const CLOSING =
  'If the law where you live gives you more rights than this page describes, those rights still apply.';
