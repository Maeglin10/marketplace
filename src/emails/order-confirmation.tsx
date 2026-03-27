import * as React from 'react';

interface OrderItem {
  title: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  buyerName: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  orderUrl: string;
}

export function OrderConfirmationEmail({
  buyerName,
  orderId,
  items,
  totalAmount,
  orderUrl,
}: OrderConfirmationEmailProps) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Confirmation de commande</title>
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
                      Commande confirmee !
                    </h2>
                    <p style={{ color: '#555555', lineHeight: '1.6' }}>
                      Bonjour <strong>{buyerName}</strong>,
                    </p>
                    <p style={{ color: '#555555', lineHeight: '1.6' }}>
                      Votre commande <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> a bien ete recue.
                      Le vendeur va prendre en charge votre demande tres prochainement.
                    </p>

                    {/* Order items */}
                    <table width="100%" cellPadding="8" cellSpacing="0" style={{ borderCollapse: 'collapse', marginTop: '24px' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f8f8' }}>
                          <th style={{ textAlign: 'left', color: '#333333', fontSize: '14px', borderBottom: '1px solid #e0e0e0' }}>Service</th>
                          <th style={{ textAlign: 'center', color: '#333333', fontSize: '14px', borderBottom: '1px solid #e0e0e0' }}>Qte</th>
                          <th style={{ textAlign: 'right', color: '#333333', fontSize: '14px', borderBottom: '1px solid #e0e0e0' }}>Prix</th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((item, index) => (
                          <tr key={index}>
                            <td style={{ color: '#555555', fontSize: '14px', borderBottom: '1px solid #f0f0f0' }}>{item.title}</td>
                            <td style={{ color: '#555555', fontSize: '14px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>{item.quantity}</td>
                            <td style={{ color: '#555555', fontSize: '14px', textAlign: 'right', borderBottom: '1px solid #f0f0f0' }}>{(item.price * item.quantity).toFixed(2)} &euro;</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={2} style={{ color: '#1a1a2e', fontWeight: 'bold', fontSize: '15px', paddingTop: '12px' }}>Total</td>
                          <td style={{ color: '#1a1a2e', fontWeight: 'bold', fontSize: '15px', textAlign: 'right', paddingTop: '12px' }}>{totalAmount.toFixed(2)} &euro;</td>
                        </tr>
                      </tbody>
                    </table>

                    {/* CTA */}
                    <div style={{ textAlign: 'center', marginTop: '32px' }}>
                      <a
                        href={orderUrl}
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
                        Voir ma commande
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
