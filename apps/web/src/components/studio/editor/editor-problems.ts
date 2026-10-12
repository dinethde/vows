import type { UseFormReturn } from 'react-hook-form';

import { FIELD_ORDER } from './album-form.schema';
import type { AlbumFieldName, AlbumFormValues } from './album-form.schema';
import type { Problems } from './publish-problems';

import type { ActionFailure } from '@/components/studio/action-result';

export type AlbumForm = UseFormReturn<AlbumFormValues>;

function isField(key: string): key is AlbumFieldName {
  return (FIELD_ORDER as string[]).includes(key);
}

/**
 * Puts the API's refusal beside the fields it names. A taken address carries
 * its suggestion in the message, not in the field map, so that one is read
 * from there. Returns the first field marked, or null when the refusal was
 * not about a field at all.
 */
export function applyFieldErrors(form: AlbumForm, failure: ActionFailure): AlbumFieldName | null {
  const named = Object.entries(failure.fields).filter(([key]) => isField(key));
  for (const [key, message] of named) {
    if (!isField(key)) continue;
    const text = failure.code === 'slug_taken' && key === 'slug' ? failure.message : message;
    form.setError(key, { type: 'server', message: text });
  }
  const first = FIELD_ORDER.find((name) => named.some(([key]) => key === name));
  return first ?? null;
}

/** The first thing wrong, in the order the screen is read: fields, cover, then slots. */
export function firstProblem(form: AlbumForm, problems: Problems): string | null {
  // Asked of the form itself, not of the last render: this runs straight
  // after a check, before React has drawn what the check found.
  const invalid = FIELD_ORDER.find(
    (name) => form.getFieldState(name).invalid || problems[name] !== undefined,
  );
  return invalid ?? Object.keys(problems).find((key) => !isField(key)) ?? null;
}

/** How many separate things are wrong: a field counts once, however it is wrong. */
export function countProblems(form: AlbumForm, problems: Problems): number {
  const keys = new Set([...Object.keys(form.formState.errors), ...Object.keys(problems)]);
  return keys.size;
}

/**
 * Moves the keyboard to the control that can fix a problem: the field, the
 * slot's own button, or the description box under a slot.
 */
export function focusProblem(form: AlbumForm, key: string): void {
  if (isField(key)) {
    form.setFocus(key);
    return;
  }
  const marker = key === 'cover' ? 'photos.0' : key;
  const node = document.querySelector<HTMLElement>(`[data-problem="${marker}"]`);
  const target = node?.matches('input') ? node : node?.querySelector<HTMLElement>('button');
  target?.focus();
  target?.scrollIntoView({ block: 'center' });
}
