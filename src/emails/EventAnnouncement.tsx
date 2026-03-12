import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

type Props = {
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string | null;
  eventDescription: string | null;
  eventCategory: string | null;
  priceInCents: number;
  eventSlug: string;
  baseUrl: string;
};

export default function EventAnnouncement({
  eventTitle = "Friday Night Poker",
  eventDate = "Friday, 14 March 2026",
  eventTime = "19:00",
  eventLocation = "Poker Studio, Canary Wharf",
  eventDescription = "Join us for an exclusive evening of poker and fine dining.",
  eventCategory = "Tournament",
  priceInCents = 5000,
  eventSlug = "friday-night-poker",
  baseUrl = "http://localhost:3000",
}: Props) {
  const price = `£${(priceInCents / 100).toFixed(2)}`;
  const plainDesc = eventDescription?.replace(/<[^>]*>/g, "").slice(0, 200);

  return (
    <Html>
      <Head />
      <Preview>
        New event: {eventTitle} — {eventDate}
      </Preview>
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logo}>
              POKER <span style={logoAccent}>STUDIO</span>
            </Text>
          </Section>

          {/* Announcement badge */}
          <Section style={badgeSection}>
            <div style={badge}>
              <Text style={badgeText}>NEW EVENT ANNOUNCED</Text>
            </div>
          </Section>

          {/* Event title */}
          <Section style={contentSection}>
            <Heading style={heading}>{eventTitle}</Heading>

            {eventCategory && (
              <div style={categoryBadge}>
                <Text style={categoryText}>{eventCategory}</Text>
              </div>
            )}

            {plainDesc && (
              <Text style={paragraph}>
                {plainDesc}
                {(eventDescription?.replace(/<[^>]*>/g, "").length ?? 0) > 200
                  ? "…"
                  : ""}
              </Text>
            )}
          </Section>

          <Hr style={divider} />

          {/* Event info grid */}
          <Section style={contentSection}>
            <Text style={sectionLabel}>EVENT DETAILS</Text>

            <Section style={infoGrid}>
              <div style={infoItem}>
                <Text style={infoLabel}>DATE</Text>
                <Text style={infoValue}>{eventDate}</Text>
              </div>
              <div style={infoItem}>
                <Text style={infoLabel}>TIME</Text>
                <Text style={infoValue}>{eventTime}</Text>
              </div>
              {eventLocation && (
                <div style={infoItem}>
                  <Text style={infoLabel}>LOCATION</Text>
                  <Text style={infoValue}>{eventLocation}</Text>
                </div>
              )}
              <div style={infoItem}>
                <Text style={infoLabel}>PRICE</Text>
                <Text style={priceStyle}>{price}</Text>
              </div>
            </Section>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button href={`${baseUrl}/events/${eventSlug}`} style={ctaButton}>
              View Event & Register →
            </Button>
            <Text style={ctaSubtext}>
              Limited seats available. Don't miss out.
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
            </Text>
            <Text style={unsubscribeText}>
              You're receiving this because you subscribed to event
              announcements.{" "}
              <Link
                href={`${baseUrl}/api/subscribers/unsubscribe?email={{email}}`}
                style={unsubscribeLink}
              >
                Unsubscribe
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
  backgroundColor: "rgba(196,30,58,0.1)",
  border: "1px solid rgba(196,30,58,0.25)",
  borderRadius: 100,
  padding: "6px 20px",
};

const badgeText: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.22em",
  color: "#c41e3a",
  margin: 0,
};

const contentSection: React.CSSProperties = {
  padding: "0 40px",
};

const heading: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 400,
  color: "#f5f5f0",
  margin: "24px 0 12px",
  lineHeight: 1.3,
};

const categoryBadge: React.CSSProperties = {
  display: "inline-block",
  backgroundColor: "rgba(201,169,110,0.1)",
  border: "1px solid rgba(201,169,110,0.25)",
  borderRadius: 4,
  padding: "3px 12px",
  marginBottom: 16,
};

const categoryText: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.16em",
  color: "#c9a96e",
  textTransform: "uppercase" as const,
  margin: 0,
};

const paragraph: React.CSSProperties = {
  fontSize: 14,
  lineHeight: 1.8,
  color: "rgba(255,255,255,0.55)",
  margin: "0 0 8px",
};

const divider: React.CSSProperties = {
  borderColor: "rgba(255,255,255,0.06)",
  margin: "28px 40px",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: "0.22em",
  color: "#c9a96e",
  margin: "0 0 16px",
  textTransform: "uppercase" as const,
};

const infoGrid: React.CSSProperties = {
  backgroundColor: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 8,
  padding: "8px 20px",
};

const infoItem: React.CSSProperties = {
  padding: "10px 0",
  borderBottom: "1px solid rgba(255,255,255,0.04)",
};

const infoLabel: React.CSSProperties = {
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: "0.2em",
  color: "rgba(255,255,255,0.35)",
  textTransform: "uppercase" as const,
  margin: "0 0 2px",
};

const infoValue: React.CSSProperties = {
  fontSize: 15,
  fontWeight: 500,
  color: "#f5f5f0",
  margin: 0,
};

const priceStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 600,
  color: "#c9a96e",
  margin: 0,
};

const ctaSection: React.CSSProperties = {
  textAlign: "center" as const,
  padding: "0 40px",
};

const ctaButton: React.CSSProperties = {
  backgroundColor: "#c41e3a",
  color: "#ffffff",
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  padding: "14px 36px",
  borderRadius: 6,
  textDecoration: "none",
  display: "inline-block",
};

const ctaSubtext: React.CSSProperties = {
  fontSize: 12,
  color: "rgba(255,255,255,0.35)",
  margin: "12px 0 0",
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

const unsubscribeText: React.CSSProperties = {
  fontSize: 10,
  color: "rgba(255,255,255,0.2)",
  marginTop: 16,
};

const unsubscribeLink: React.CSSProperties = {
  color: "rgba(255,255,255,0.3)",
  textDecoration: "underline",
};
