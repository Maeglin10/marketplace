import * as React from 'react';

type OrderStatus = 'PAID' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface OrderStatusUpdateEmailProps {
  recipientName: string;
  orderId: string;
  status: OrderStatus;
  orderUrl: string;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  PAID: 'Paiement confirme',
  IN_PROGRESS: 'En cours de traitement',
  COMPLETED: 'Commande terminee',
  CANCELLED: 'Commande annulee',
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PAID: '#2196F3',
  IN_PROGRESS: '#FF9800',
  COMPLETED: '#4CAF50',
  CANCELLED: '#F44336',
};

const STATUS_MESSAGES: Record<OrderStatus, string> = {
  PAID: 'Votre paiement a bien ete confirme. Le vendeur va commencer a traiter votre commande tres prochainement.',
  IN_PROGRESS: 'Bonne nouvelle ! Le vendeur a pris en charge votre commande et travaille activement dessus.',
  COMPLETED: 'Votre commande est terminee. Nous esperons que vous etes satisfait(e) du service rendu. N\'hesitez pas a laisser un avis !',
  CANCELLED: 'Votre commande a ete annulee. Si vous avez des questions, contactez notre support.',
};

export function OrderStatusUpdateEmail({
  recipientName,
  orderId,
  status,
  orderUrl,
}: OrderStatusUpdateEmailProps) {
  const statusLabel = STATUS_LABELS[status];
  const statusColor = STATUS_COLORS[status];
  const statusMessage = STATUS_MESSAGES[status];

  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Mise a jour de votre commande</title>
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
                      Mise a jour de votre commande
                    </h2>
                    <p style={{ color: '#555555', lineHeight: '1.6' }}>
                      Bonjour <strong>{recipientName}</strong>,
                    </p>
                    <p style={{ color: '#555555', lineHeight: '1.6' }}>
                      Le statut de votre commande <strong>#{orderId.slice(0, 8).toUpperCase()}</strong> a change :
                    </p>

                    {/* Status badge */}
                    <div style={{ textAlign: 'center', margin: '28px 0' }}>
                      <span style={{
                        backgroundColor: statusColor,
                        color: '#ffffff',
                        padding: '10px 24px',
                        borderRadius: '20px',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        display: 'inline-block',
                      }}>
                        {statusLabel}
                      </span>
                    </div>

                    <p style={{ color: '#555555', lineHeight: '1.6' }}>
                      {statusMessage}
                    </p>

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
