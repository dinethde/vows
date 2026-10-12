import { enquiry, enquiryAccepted, enquiryList } from '@vows/contracts';
import type {
  CreateEnquiry,
  Enquiry,
  EnquiryAccepted,
  EnquiryList,
  EnquiryListQuery,
  EnquiryStatus,
} from '@vows/contracts';

import type { Transport } from './transport';

export interface EnquiriesApi {
  create: (body: CreateEnquiry) => Promise<EnquiryAccepted>;
  list: (query?: Partial<EnquiryListQuery>) => Promise<EnquiryList>;
  setStatus: (id: string, status: EnquiryStatus) => Promise<Enquiry>;
}

export function enquiriesApi(request: Transport): EnquiriesApi {
  return {
    create: (body) => request('/v1/enquiries', { method: 'POST', body, schema: enquiryAccepted }),
    list: (query = {}) => {
      const params = new URLSearchParams(
        Object.entries(query).flatMap(([key, value]) =>
          value === undefined ? [] : [[key, String(value)]],
        ),
      );
      const suffix = params.size > 0 ? `?${params.toString()}` : '';
      return request(`/v1/studio/enquiries${suffix}`, { schema: enquiryList });
    },
    setStatus: (id, status) =>
      request(`/v1/studio/enquiries/${id}`, { method: 'PATCH', body: { status }, schema: enquiry }),
  };
}
