import { Module } from '@nestjs/common';

import { ENV } from '../../config/env';

import { EnquiryController } from './enquiry.controller';
import { EnquiryRepository } from './enquiry.repository';
import { EnquiryService } from './enquiry.service';
import { MAILER, mailerFrom, NotifyService } from './notify.service';

@Module({
  controllers: [EnquiryController],
  providers: [
    EnquiryService,
    EnquiryRepository,
    NotifyService,
    { provide: MAILER, inject: [ENV], useFactory: mailerFrom },
  ],
  exports: [EnquiryService, EnquiryRepository, NotifyService],
})
export class EnquiryModule {}
