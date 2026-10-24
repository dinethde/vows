import type { INestApplicationContext } from '@nestjs/common';
import type { JobPayload } from '@vows/contracts';
import { NotifyService } from '@vows/server';

/** Two emails, late if Resend is slow, never lost: the enquiry was saved before this ran. */
export function enquiryNotify(
  app: INestApplicationContext,
): (payload: JobPayload<'enquiry.notify'>) => Promise<void> {
  const notify = app.get(NotifyService);
  return ({ enquiryId }) => notify.send(enquiryId);
}
