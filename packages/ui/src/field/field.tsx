import type { ReactElement } from 'react';

import type { FieldProps } from './field.types';
import { SiteField } from './site-field';
import { StudioField } from './studio-field';

/* `surface` picks the Figma component: `field — site` or `field — studio`.
 * It is which field this is, not which mode the page is in. The colours still
 * come from the tokens, so either one renders under either mode. */
export function Field(props: FieldProps): ReactElement {
  return props.surface === 'site' ? <SiteField {...props} /> : <StudioField {...props} />;
}
