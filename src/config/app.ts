export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'ServiceHub',
  tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Hire Services, Grow Your Business',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  commissionPercent: Number(process.env.NEXT_PUBLIC_COMMISSION_PERCENT) || 10,
  currency: process.env.NEXT_PUBLIC_CURRENCY || 'usd',
  currencySymbol: process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || '$',
};
