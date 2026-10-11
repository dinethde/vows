import {
  Body,
  Controller,
  Get,
  HttpCode,
  Ip,
  Param,
  Patch,
  Post,
  Query,
  Headers,
} from '@nestjs/common';
import { createEnquiry, enquiryId, enquiryListQuery, updateEnquiry } from '@vows/contracts';
import type {
  CreateEnquiry,
  Enquiry,
  EnquiryAccepted,
  EnquiryList,
  EnquiryListQuery,
  UpdateEnquiry,
} from '@vows/contracts';

import { CurrentActor, RequestId, Roles } from '../../common/decorators/auth';
import { ZodPipe } from '../../common/pipes/zod.pipe';
import type { Actor } from '../../common/request';

import { EnquiryService } from './enquiry.service';

@Controller('v1')
export class EnquiryController {
  constructor(private readonly enquiries: EnquiryService) {}

  /** 202: the enquiry is stored and the email is on its way, not sent. */
  @Post('enquiries')
  @HttpCode(202)
  create(
    @Body(new ZodPipe(createEnquiry)) body: CreateEnquiry,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string | undefined,
    @RequestId() requestId: string,
  ): Promise<EnquiryAccepted> {
    return this.enquiries.create(body, { ip, userAgent, requestId });
  }

  @Get('studio/enquiries')
  @Roles('owner', 'editor')
  list(@Query(new ZodPipe(enquiryListQuery)) query: EnquiryListQuery): Promise<EnquiryList> {
    return this.enquiries.list(query);
  }

  @Patch('studio/enquiries/:id')
  @Roles('owner', 'editor')
  setStatus(
    @Param('id', new ZodPipe(enquiryId)) id: string,
    @Body(new ZodPipe(updateEnquiry)) body: UpdateEnquiry,
    @CurrentActor() actor: Actor,
  ): Promise<Enquiry> {
    return this.enquiries.setStatus(id, body.status, actor);
  }
}
