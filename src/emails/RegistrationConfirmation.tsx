import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";

type Props = {
  fullName: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string | null;
  guestCount: number;
  totalAmountCents: number;
  registrationId: string;
  stripeReceiptUrl?: string | null;
};

export default function RegistrationConfirmation({
  fullName = "John Doe",
  eventTitle = "Friday Night Poker",
  eventDate = "Friday, 14 March 2026",
  eventTime = "19:00",
  eventLocation = "Poker Studio, Canary Wharf",
  guestCount = 0,
  totalAmountCents = 5000,
  registrationId = "clx1234567890",
  stripeReceiptUrl,
}: Props) {
  const totalPeople = 1 + guestCount;
  const totalFormatted = `€${(totalAmountCents / 100).toFixed(2)}`;

  return (
    <Html>
      <Head />
      <Preview>
        Your registration for {eventTitle} is confirmed
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              POKER <span style={logoAccent}>STUDIO</span>
            </Text>
          </Section>

          {/* Confirmation badge */}
          <Section style={badgeSection}>
            <div style={badge}>
              <Text style={badgeText}>BOOKING CONFIRMED</Text>
            </div>
          </Section>

          {/* Greeting */}
          <Section style={contentSection}>
            <Heading style={heading}>
              Thank you, {fullName}!
            </Heading>
            <Text style={paragraph}>
              Your registration has been confirmed and payment received. We look
              forward to seeing you at the event.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Event details */}
          <Section style={contentSection}>
            <Text style={sectionLabel}>EVENT DETAILS</Text>

            <Section style={detailCard}>
              <Row>
                <Column style={detailLabel}>Event</Column>
                <Column style={detailValue}>{eventTitle}</Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Date</Column>
                <Column style={detailValue}>{eventDate}</Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Time</Column>
                <Column style={detailValue}>{eventTime}</Column>
              </Row>
              {eventLocation && (
                <Row>
                  <Column style={detailLabel}>Location</Column>
                  <Column style={detailValue}>{eventLocation}</Column>
                </Row>
              )}
              <Row>
                <Column style={detailLabel}>Guests</Column>
                <Column style={detailValue}>
                  {totalPeople} {totalPeople === 1 ? "person" : "people"}
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Payment summary */}
          <Section style={contentSection}>
            <Text style={sectionLabel}>PAYMENT SUMMARY</Text>

            <Section style={detailCard}>
              <Row>
                <Column style={detailLabel}>Booking ID</Column>
                <Column style={{ ...detailValue, fontFamily: "monospace", fontSize: 12 }}>
                  {registrationId}
                </Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Amount Paid</Column>
                <Column style={totalStyle}>{totalFormatted}</Column>
              </Row>
              <Row>
                <Column style={detailLabel}>Status</Column>
                <Column style={paidBadge}>PAID</Column>
              </Row>
            </Section>

            {stripeReceiptUrl && (
              <Text style={receiptLink}>
                <Link href={stripeReceiptUrl} style={link}>
                  View Payment Receipt →
                </Link>
              </Text>
            )}
          </Section>

          <Hr style={divider} />

          {/* Reminders */}
          <Section style={contentSection}>
            <Text style={sectionLabel}>REMINDERS</Text>
            <Text style={reminderText}>
              • Please arrive 15 minutes before the event start time
            </Text>
            <Text style={reminderText}>
              • Dress code: Smart Casual
            </Text>
            <Text style={reminderText}>
              • Present this email or your booking ID at the door
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerLogo}>
              POKER <span style={logoAccent}>STUDIO</span>
            </Text>
            <Text style={footerText}>
              Private Events · Canary Wharf, London
            </Text>
            <Text style={footerText}>
              <Link href="mailto:info@pokerstudio.co.uk" style={footerLink}>
                info@pokerstudio.co.uk
              </Link>
              {" · "}
              <Link href="tel:+442012345678" style={footerLink}>
                +44 20 1234 5678
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const body: React.CSSProperties = {
  backgroundColor: "#09090b",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: 0,
};

const container: React.CSSProperties = {
  maxWidth: 560,
  margin: "0 auto",
  backgroundColor: "#111113",
  borderRadius: 12,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.06)",
};

const header: React.CSSProperties = {
  backgroundColor: "#0a0a0c",
  padding: "28px 40px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  textAlign: "center" as const,
};

const logo: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: "#f5f5f0",
  letterSpacing: "0.06em",
  margin: 0,
};

const logoAccent: React.CSSProperties = {
  color: "#c9a96e",
};

const badgeSection: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "32px 40px 0",
};

const badge: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.25)",
  borderRadius: 100,
  padding: "6px 20px",
};

const badgeText: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.22em",
  color: "#22c55e",
  margin: 0,
};

const contentSection: React.CSSProperties = {
  padding: "0 40px",
};

const heading: React.CSSProperties = {
  fontSize: 26,
  fontWeight: 400,
  color: "#f5f5f0",
  margin: "24px 0 12px",
  lineHeight: 1.3,
};

const paragraph: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.7,
  color: "rgba(255,255,255,0.55)",
  margin: "0 0 8px",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.06)",
  margin: "24px 40px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.22em",
  color: "#c9a96e",
  margin: "0 0 16px",
  textTransform: "uppercase" as const,
};

const detailCard: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: "16px 20px",
};

const detailLabel: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.4)",
  padding: "6px 0",
  width: "35%",
  verticalAlign: "top",
};

const detailValue: React.CSSProperties = {
  fontSize: 14,
  color: "#f5f5f0",
  fontWeight: 500,
  padding: "6px 0",
  textAlign: "right" as const,
};

const totalStyle: React.CSSProperties = {
  ...detailValue,
  fontSize: 18,
  fontWeight: 600,
  color: "#c9a96e",
};

const paidBadge: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.14em",
  color: "#22c55e",
  backgroundColor: "rgba(34,197,94,0.1)",
  borderRadius: 4,
  padding: "3px 10px",
  textAlign: "right" as const,
  display: "inline-block",
};

const receiptLink: React.CSSProperties = {
  textAlign: "center" as const,
  marginTop: 16,
};

const link: React.CSSProperties = {
  fontSize: 13,
  color: "#c9a96e",
  textDecoration: "underline",
};

const reminderText: React.CSSProperties = {
  fontSize: 13,
  color: "rgba(255,255,255,0.5)",
  margin: "0 0 6px",
  lineHeight: 1.6,
};

const footer: React.CSSProperties = {
  backgroundColor: "#0a0a0c",
  padding: "28px 40px",
  textAlign: "center" as const,
  borderTop: "1px solid rgba(255,255,255,0.06)",
};

const footerLogo: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#f5f5f0",
  letterSpacing: "0.06em",
  margin: "0 0 8px",
};

const footerText: React.CSSProperties = {
  fontSize: 11,
  color: "rgba(255,255,255,0.3)",
  margin: "0 0 4px",
};

const footerLink: React.CSSProperties = {
  color: "rgba(255,255,255,0.3)",
  textDecoration: "none",
};
