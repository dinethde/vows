'use client';

import { useState } from 'react';
import type { ReactElement } from 'react';
import { useController } from 'react-hook-form';
import type { Control } from 'react-hook-form';

import type { EnquiryFields } from './enquiry-form.schema';

import { DatePicker } from '@/components/shared/date/date-picker';
import { formatDateText, parseDateText } from '@/components/shared/date/date-text';

export interface WeddingDateFieldProps {
  control: Control<EnquiryFields>;
}

/**
 * The wedding date, typed or picked. The box shows the date in words; the form
 * holds the plain day the API wants. Text that is not a date is kept as it
 * was typed, so the schema refuses it and the visitor sees why.
 */
export function WeddingDateField({ control }: WeddingDateFieldProps): ReactElement {
  const { field, fieldState } = useController({ control, name: 'weddingDate' });
  const [text, setText] = useState(() => formatDateText(parseDateText(field.value)));
  const message = fieldState.error?.message;

  return (
    <DatePicker
      surface="site"
      label="Wedding date"
      required
      name={field.name}
      value={text}
      inputRef={field.ref}
      onBlur={field.onBlur}
      onChange={(next) => {
        setText(next);
        field.onChange(parseDateText(next) ?? next.trim());
      }}
      {...(message ? { error: message } : {})}
    />
  );
}
