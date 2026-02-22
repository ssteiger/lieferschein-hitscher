import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface VerifyEmailProps {
  url: string
  baseUrl: string
}

export function VerifyEmail({ url, baseUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Bestätigen Sie Ihre E-Mail-Adresse für Lieferschein Hitscher</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoContainer}>
            <Img
              src={`${baseUrl}/hitscher_logo.png`}
              width="120"
              height="120"
              alt="Gartenbau Hitscher"
              style={logo}
            />
          </Section>
          <Hr style={hr} />
          <Text style={paragraph}>
            Vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre
            E-Mail-Adresse, indem Sie auf den folgenden Button klicken:
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={url}>
              E-Mail bestätigen
            </Button>
          </Section>
          <Text style={footnote}>
            Falls der Button nicht funktioniert, kopieren Sie diesen Link in
            Ihren Browser:
          </Text>
          <Text style={link}>{url}</Text>
          <Hr style={hr} />
          <Text style={footer}>
            Falls Sie diese E-Mail nicht angefordert haben, können Sie sie
            ignorieren.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main: React.CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
}

const container: React.CSSProperties = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '560px',
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
  marginTop: '40px',
  marginBottom: '40px',
}

const logoContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '0 0 8px',
}

const logo: React.CSSProperties = {
  borderRadius: '50%',
  margin: '0 auto',
}

const hr: React.CSSProperties = {
  borderColor: '#e5e7eb',
  margin: '20px 0',
}

const paragraph: React.CSSProperties = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#374151',
}

const buttonContainer: React.CSSProperties = {
  textAlign: 'center' as const,
  margin: '24px 0',
}

const button: React.CSSProperties = {
  backgroundColor: '#0f172a',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: '12px 24px',
}

const footnote: React.CSSProperties = {
  fontSize: '13px',
  color: '#6b7280',
  lineHeight: '20px',
}

const link: React.CSSProperties = {
  fontSize: '13px',
  color: '#2563eb',
  wordBreak: 'break-all',
  lineHeight: '20px',
}

const footer: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  lineHeight: '20px',
  textAlign: 'center' as const,
}
