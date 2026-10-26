import { Body, Container, Head, Html, Preview, Text } from "@react-email/components";
import { resolved } from "@vows/tokens";

import type { CSSProperties, ReactElement, ReactNode } from "react";

const site = resolved.site;
const serif = 'Georgia, "Times New Roman", serif';

export const styles = {
  body: { backgroundColor: site.bgPage, margin: 0, padding: "32px 16px" },
  card: { backgroundColor: site.bgSurface, maxWidth: 560, padding: "32px" },
  wordmark: { color: site.textPrimary, fontFamily: serif, fontSize: 20, margin: "0 0 24px" },
  heading: {
    color: site.textHeading,
    fontFamily: serif,
    fontSize: 28,
    fontWeight: 400,
    margin: "0 0 16px",
  },
  text: {
    color: site.textPrimary,
    fontFamily: serif,
    fontSize: 16,
    lineHeight: "24px",
    margin: "0 0 16px",
  },
  label: { color: site.textMuted, fontFamily: serif, fontSize: 14, lineHeight: "22px", margin: 0 },
  value: {
    color: site.textPrimary,
    fontFamily: serif,
    fontSize: 16,
    lineHeight: "24px",
    margin: "0 0 12px",
  },
  rule: { borderColor: site.borderHairline, margin: "24px 0" },
  link: { color: site.textPrimary, textDecoration: "underline" },
} satisfies Record<string, CSSProperties>;

export interface LayoutProps {
  preview: string;
  children: ReactNode;
}

/** The frame both emails share: the page ground, one white card, the wordmark. */
export function Layout({ preview, children }: LayoutProps): ReactElement {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={styles.body}>
        <Container style={styles.card}>
          <Text style={styles.wordmark}>VOWS</Text>
          {children}
        </Container>
      </Body>
    </Html>
  );
}
