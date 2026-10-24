import { z } from 'zod';

/** The short list of things the studio edits that are not content. */
export const SETTING_KEYS = ['notifyEmail', 'phone', 'instagram', 'trackName'] as const;
export const settingKey = z.enum(SETTING_KEYS);
export type SettingKey = z.infer<typeof settingKey>;

export const settings = z.object({
  notifyEmail: z.string().email(),
  phone: z.string(),
  instagram: z.string().nullable(),
  trackName: z.string(),
});
export type Settings = z.infer<typeof settings>;
