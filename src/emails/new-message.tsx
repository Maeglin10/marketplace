import * as React from 'react';

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
}

export function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
}: NewMessageEmailProps) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Nouveau message</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f4f4', margin: 0, padding: 0 }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f4f4f4', padding: '40px 0' }}>
          <tr>
            <td align="center">
              <table width="600" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Header */}
                <tr>
                  <td style={{ backgroundColor: '#1a1a2e', padding: '24px 32px' }}>
                    <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
                      Marketplace
                    </h1>
                  </td>
                </tr>

                {/* Body */}
                <tr>
                  <td style={{ padding: '32px' }}>
                    <h2 style={{ color: '#1a1a2e', fontSize: '20px', marginTop: 0 }}>
                      Nouveau message recu
                    </h2>
                    <p style={{ color: '#555555', lineHeight: '1.6' }}>
                      Bonjour <strong>{recipientName}</strong>,
                    </p>
                    <p style={{ color: '#555555', lineHeight: '1.6' }}>
                      <strong>{senderName}</strong> vous a envoye un nouveau message :
                    </p>

                    {/* Message preview */}
                    <div style={{
                      backgroundColor: '#f8f8f8',
                      borderLeft: '4px solid #1a1a2e',
                      padding: '16px 20px',
                      borderRadius: '4px',
                      margin: '20px 0',
                    }}>
                      <p style={{ color: '#555555', fontSize: '14px', lineHeight: '1.6', margin: 0, fontStyle: 'italic' }}>
                        &ldquo;{messagePreview}&rdquo;
                      </p>
                    </div>

                    {/* CTA */}
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                      <a
                        href={conversationUrl}
                        style={{
                          backgroundColor: '#1a1a2e',
                          color: '#ffffff',
                          padding: '12px 28px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '15px',
                          fontWeight: 'bold',
                          display: 'inline-block',
                        }}
                      >
                        Repondre au message
                      </a>
                    </div>
                  </td>
                </tr>

                {/* Footer */}
                <tr>
                  <td style={{ backgroundColor: '#f8f8f8', padding: '20px 32px', borderTop: '1px solid #e0e0e0' }}>
                    <p style={{ color: '#aaaaaa', fontSize: '12px', margin: 0, textAlign: 'center' }}>
                      Marketplace &mdash; Cet email a ete envoye automatiquement, merci de ne pas y repondre.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  );
}
