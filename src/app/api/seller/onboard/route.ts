import { NextRequest } from 'next/server';
import { userService } from '@/services/user.service';
import { stripeService } from '@/services/stripe.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const user = await userService.getUserByEmail(auth.email);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    // Create Stripe Connect account
    const account = await stripeService.createConnectedAccount(
      user.email,
      'US'
    );

    // Update user with Stripe account ID
    await userService.updateStripeAccountId(user.id, account.id);

    // Make user a seller
    await userService.becomeSeller(user.id);

    // Create account link for onboarding
    const accountLink = await stripeService.createAccountLink(
      account.id,
      `${process.env.NEXTAUTH_URL}/dashboard?stripe_account=${account.id}`
    );

    return successResponse({
      stripeAccountId: account.id,
      onboardingUrl: accountLink.url,
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to setup seller account', 400);
  }
}
