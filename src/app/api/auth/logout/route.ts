import { successResponse } from '@/lib/response';

export async function POST() {
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = `auth-token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${
    isProd ? '; Secure' : ''
  }`;

  const response = successResponse({ loggedOut: true });
  response.headers.set('Set-Cookie', cookie);
  return response;
}
