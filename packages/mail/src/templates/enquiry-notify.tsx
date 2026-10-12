import { Heading, Hr, Link, Text } from '@react-email/components';
import type { ReactElement } from 'react';

import { Layout, styles } from './layout';

export interface EnquiryNotifyProps {
  name: string;
  email: string;
  phone: string | null;
  weddingDate: string | null;
  weddingPlace: string | null;
  notes: string | null;
  /** When it arrived, already written out in Colombo time. */
  receivedAt: string;
  studioUrl: string;
}

interface RowProps {
  label: string;
  value: string | null;
}

function Row({ label, value }: RowProps): ReactElement {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value ?? 'Not given'}</Text>
    </>
  );
}

export function enquiryNotifySubject(
  props: Pick<EnquiryNotifyProps, 'name' | 'weddingDate'>,
): string {
  return `New enquiry — ${props.name}, ${props.weddingDate ?? 'date TBC'}`;
}

/** To the studio: every field as it was sent. The notes are text, never markup. */
export function EnquiryNotify(props: EnquiryNotifyProps): ReactElement {
  return (
    <Layout preview={`${props.name} wrote to the studio`}>
      <Heading style={styles.heading}>A new enquiry</Heading>
      <Row label="Name" value={props.name} />
      <Row label="Email" value={props.email} />
      <Row label="Mobile" value={props.phone} />
      <Row label="Wedding date" value={props.weddingDate} />
      <Row label="Wedding place" value={props.weddingPlace} />
      <Row label="Notes" value={props.notes} />
      <Row label="Received" value={`${props.receivedAt}, Colombo time`} />
      <Hr style={styles.rule} />
      <Text style={styles.text}>
        <Link href={props.studioUrl} style={styles.link}>
          Open it in the Studio
        </Link>
      </Text>
    </Layout>
  );
}
