import { Heading, Hr, Text } from '@react-email/components';
import type { ReactElement } from 'react';

import { Layout, styles } from './layout';

export interface EnquiryReceivedProps {
  name: string;
  phone: string;
}

export const ENQUIRY_RECEIVED_SUBJECT = 'We have your message — Vows';

/** To the couple: it arrived, what happens next, how long. Nothing else. */
export function EnquiryReceived({ name, phone }: EnquiryReceivedProps): ReactElement {
  return (
    <Layout preview="Your message reached us. A reply usually takes a day or two.">
      <Heading style={styles.heading}>Thank you, {name}.</Heading>
      <Text style={styles.text}>
        Your message reached us, and nothing more is needed from you for now.
      </Text>
      <Text style={styles.text}>
        We read every message ourselves, so a reply usually takes a day or two. If your date is
        close, call us on {phone} instead of waiting.
      </Text>
      <Hr style={styles.rule} />
      <Text style={styles.label}>Vows Weddings · Wadduwa, Kalutara, Sri Lanka</Text>
    </Layout>
  );
}
