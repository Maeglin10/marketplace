# Marketplace Completion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Compléter le marketplace à 100% — paiements multi-méthodes, messagerie temps-réel, admin, profil, onboarding vendeur, branding configurable.

**Architecture:** AuthContext React pour exposer l'utilisateur courant à tous les composants. Stripe Payment Element pour tous les moyens de paiement (cartes, Apple Pay, Google Pay, Link, SEPA, iDEAL, Klarna, Afterpay). SSE (Server-Sent Events) via route Next.js pour la messagerie temps-réel sans serveur WS séparé.

**Tech Stack:** Next.js App Router, Stripe Payment Element (@stripe/react-stripe-js déjà installé), SSE via Response stream, AuthContext, Tailwind.

---

## Task 1: AuthContext — partage du currentUser

**Files:**
- Create: `src/contexts/AuthContext.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Créer l'AuthContext**

```tsx
// src/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'SELLER' | 'ADMIN';
  avatar?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  setUser: () => {},
  logout: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth-token');
    if (storedToken) {
      setToken(storedToken);
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${storedToken}` },
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.success) setUser(data.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('auth-token');
    setUser(null);
    setToken(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

**Step 2: Wrapper le layout avec AuthProvider**

```tsx
// src/app/layout.tsx — ajouter AuthProvider autour de children
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
```

**Step 3: Mettre à jour Navbar pour utiliser useAuth au lieu de localStorage direct**

```tsx
// src/components/Navbar.tsx — remplacer le token localStorage par useAuth()
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  // utiliser user pour conditionner les liens, logout() au lieu du handler inline
  // Ajouter un lien /admin si user.role === 'ADMIN'
}
```

---

## Task 2: API — routes manquantes

**Files:**
- Create: `src/app/api/seller/services/route.ts`
- Create: `src/app/api/conversations/start/route.ts`
- Create: `src/app/api/messages/sse/route.ts` (Server-Sent Events)
- Modify: `src/app/api/auth/me/route.ts` (vérifier qu'il retourne id, email, name, role, avatar)

**Step 1: Route seller/services**

```ts
// src/app/api/seller/services/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { serviceService } from '@/services/service.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const result = await serviceService.getServicesByUserId(auth.id, page, limit);
    return successResponse(result);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to fetch services', 400);
  }
}
```

**Step 2: Route conversations/start (créer conversation depuis la page service)**

```ts
// src/app/api/conversations/start/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { messagingService } from '@/services/messaging.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { z } from 'zod';

const schema = z.object({
  targetUserId: z.string(),
  orderId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) return errorResponse('Invalid data', 400);

    const conversation = await messagingService.getOrCreateConversation(
      auth.id,
      validation.data.targetUserId,
      validation.data.orderId
    );

    return successResponse(conversation);
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to start conversation', 400);
  }
}
```

**Step 3: Route SSE pour messagerie temps-réel**

```ts
// src/app/api/messages/sse/route.ts
import { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/db';

// Map conversationId -> Set<controller>
const subscribers = new Map<string, Set<ReadableStreamDefaultController>>();

export function addSubscriber(conversationId: string, controller: ReadableStreamDefaultController) {
  if (!subscribers.has(conversationId)) subscribers.set(conversationId, new Set());
  subscribers.get(conversationId)!.add(controller);
}

export function removeSubscriber(conversationId: string, controller: ReadableStreamDefaultController) {
  subscribers.get(conversationId)?.delete(controller);
}

export function broadcastMessage(conversationId: string, data: object) {
  const subs = subscribers.get(conversationId);
  if (!subs) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const ctrl of subs) {
    try { ctrl.enqueue(new TextEncoder().encode(payload)); } catch {}
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const conversationId = searchParams.get('conversationId');

  if (!token || !conversationId) {
    return new Response('Missing params', { status: 400 });
  }

  const auth = verifyToken(token);
  if (!auth) return new Response('Unauthorized', { status: 401 });

  // Verify user has access to this conversation
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ initiatorId: auth.id }, { targetId: auth.id }],
    },
  });
  if (!conversation) return new Response('Forbidden', { status: 403 });

  let controller: ReadableStreamDefaultController;
  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      addSubscriber(conversationId, controller);
      ctrl.enqueue(new TextEncoder().encode(': connected\n\n'));
    },
    cancel() {
      removeSubscriber(conversationId, controller);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
```

**Step 4: Modifier conversations/[id]/route.ts pour broadcaster via SSE après envoi**

Dans le POST de `src/app/api/conversations/[id]/route.ts`, après avoir créé le message en DB, appeler `broadcastMessage(conversationId, message)`.

---

## Task 3: Checkout complet avec Stripe Payment Element

**Files:**
- Create: `src/app/api/payment/create-intent/route.ts`
- Create: `src/app/checkout/page.tsx`
- Modify: `src/app/services/[id]/page.tsx` (wirer le bouton "Buy Now")

**Step 1: API create-intent**

```ts
// src/app/api/payment/create-intent/route.ts
import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { orderService } from '@/services/order.service';
import { stripeService } from '@/services/stripe.service';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';
import { z } from 'zod';

const schema = z.object({
  serviceId: z.string(),
  sellerId: z.string(),
  quantity: z.number().int().positive().default(1),
});

export async function POST(request: NextRequest) {
  try {
    const auth = requireAuth(request);
    if (!auth) return unauthorizedResponse();

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) return errorResponse('Invalid data', 400);

    // Create order first (PENDING)
    const order = await orderService.createOrder(auth.id, validation.data.sellerId, [
      { serviceId: validation.data.serviceId, quantity: validation.data.quantity },
    ]);

    // Create Stripe PaymentIntent with automatic payment methods
    const paymentIntent = await stripeService.createPaymentIntentForOrder(order);

    // Store paymentIntentId on order
    await orderService.markOrderWithIntent(order.id, paymentIntent.id);

    return successResponse({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
      amount: order.totalAmount,
    });
  } catch (error: any) {
    return errorResponse(error.message || 'Failed to create payment intent', 400);
  }
}
```

**Step 2: Mettre à jour stripeService pour Payment Element**

Dans `src/services/stripe.service.ts`, ajouter:

```ts
async createPaymentIntentForOrder(order: { id: string; totalAmount: number; buyerId: string; sellerId: string }) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalAmount * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true }, // Active TOUS les moyens de paiement configurés dans le dashboard Stripe
    metadata: {
      orderId: order.id,
      buyerId: order.buyerId,
      sellerId: order.sellerId,
    },
  });
  return paymentIntent;
},
```

Et dans `orderService`, ajouter `markOrderWithIntent`:

```ts
async markOrderWithIntent(orderId: string, paymentIntentId: string) {
  return prisma.order.update({
    where: { id: orderId },
    data: { paymentIntentId },
  });
},
```

**Step 3: Page checkout avec Stripe Payment Element**

```tsx
// src/app/checkout/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ orderId, amount }: { orderId: string; amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}?payment=success`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}
      <PaymentElement />
      <Button type="submit" className="w-full" size="lg" disabled={!stripe || loading}>
        {loading ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuth();
  const serviceId = searchParams.get('serviceId');
  const sellerId = searchParams.get('sellerId');
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!serviceId || !sellerId || !token) {
      router.push('/services');
      return;
    }

    fetch('/api/payment/create-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ serviceId, sellerId, quantity: 1 }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setClientSecret(data.data.clientSecret);
          setOrderId(data.data.orderId);
          setAmount(data.data.amount);
        } else {
          setError(data.error || 'Could not initialize payment');
        }
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false));
  }, [serviceId, sellerId, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Preparing checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <Card>
        <CardHeader>
          <CardTitle>Payment</CardTitle>
          <p className="text-sm text-gray-600">
            Secured by Stripe — supports cards, Apple Pay, Google Pay, SEPA, iDEAL, Klarna & more.
          </p>
        </CardHeader>
        <CardContent>
          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: { theme: 'stripe', variables: { colorPrimary: '#000000' } },
              }}
            >
              <CheckoutForm orderId={orderId} amount={amount} />
            </Elements>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <main>
      <Navbar />
      <Suspense fallback={<div className="flex items-center justify-center h-64"><p>Loading...</p></div>}>
        <CheckoutPageInner />
      </Suspense>
    </main>
  );
}
```

**Step 4: Wirer le bouton "Buy Now" dans services/[id]/page.tsx**

```tsx
// Ajouter router et useAuth, remplacer le <Button className="w-full" size="lg"> par:
const router = useRouter();
const { user } = useAuth();

const handleBuyNow = () => {
  if (!user) {
    router.push('/auth/login');
    return;
  }
  router.push(`/checkout?serviceId=${service.id}&sellerId=${service.user.id}`);
};

// Le bouton Contact Seller:
const handleContactSeller = async () => {
  if (!user) { router.push('/auth/login'); return; }
  const token = localStorage.getItem('auth-token');
  const res = await fetch('/api/conversations/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ targetUserId: service.user.id }),
  });
  const data = await res.json();
  if (data.success) router.push('/messages');
};
```

---

## Task 4: Fix messagerie — currentUser réel + SSE

**Files:**
- Modify: `src/app/messages/page.tsx`

**Step 1: Réécrire messages/page.tsx**

```tsx
'use client';

import { useEffect, useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { TextArea } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function MessagesPage() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading]);

  useEffect(() => {
    if (user) fetchConversations();
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      subscribeSSE(selectedConversation.id);
    }
    return () => eventSourceRef.current?.close();
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data.conversations);
        if (data.data.conversations.length > 0) {
          setSelectedConversation(data.data.conversations[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    const res = await fetch(`/api/conversations/${conversationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setMessages(data.data.messages);
  };

  const subscribeSSE = (conversationId: string) => {
    eventSourceRef.current?.close();
    const es = new EventSource(
      `/api/messages/sse?token=${token}&conversationId=${conversationId}`
    );
    es.onmessage = (e) => {
      if (e.data.startsWith(':')) return; // heartbeat
      try {
        const msg = JSON.parse(e.data);
        setMessages((prev) => [...prev, msg]);
      } catch {}
    };
    eventSourceRef.current = es;
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const res = await fetch(`/api/conversations/${selectedConversation.id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: newMessage }),
    });

    if (res.ok) setNewMessage('');
  };

  const getOtherUser = (conv: any) => {
    return conv.initiator.id === user?.id ? conv.target : conv.initiator;
  };

  if (authLoading || loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Messages</h1>
        <div className="grid md:grid-cols-4 gap-6 h-[600px]">
          {/* Conversations */}
          <div className="md:col-span-1 border border-gray-200 rounded-lg overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-gray-600 text-sm">No conversations yet</div>
            ) : (
              conversations.map((conv: any) => {
                const other = getOtherUser(conv);
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                      selectedConversation?.id === conv.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <p className="font-semibold text-sm">{other.name}</p>
                    {conv.messages[0] && (
                      <p className="text-xs text-gray-500 truncate">{conv.messages[0].content}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Messages */}
          <div className="md:col-span-3 border border-gray-200 rounded-lg flex flex-col">
            {selectedConversation ? (
              <>
                <div className="border-b p-4">
                  <p className="font-semibold">{getOtherUser(selectedConversation).name}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg: any) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.fromUser.id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                          msg.fromUser.id === user?.id
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-black'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-60">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="border-t p-4">
                  <div className="flex gap-2">
                    <TextArea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1"
                      rows={1}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e as any);
                        }
                      }}
                    />
                    <Button type="submit" size="sm">Send</Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
```

---

## Task 5: Dashboard — fix onglet Services + Overview buyer

**Files:**
- Modify: `src/app/dashboard/page.tsx`

**Step 1: Remplacer le dashboard complet**

- Utiliser `useAuth()` pour le user au lieu de fetch `/api/auth/me`
- Onglet Services: fetch `/api/seller/services` et afficher la liste
- Overview: si user non SELLER, afficher ses stats d'acheteur (nombre commandes, total dépensé)
- Ajouter lien vers `/profile` et `/seller/onboard` si USER veut devenir vendeur

```tsx
// Changements clés dans dashboard/page.tsx:
const { user, token } = useAuth();

// Dans fetchDashboardData, supprimer le fetch /api/auth/me
// Pour l'onglet Services, ajouter:
const servicesRes = await fetch('/api/seller/services', {
  headers: { Authorization: `Bearer ${token}` },
});
const servicesData = await servicesRes.json();
if (servicesData.success) setServices(servicesData.data.services);

// Dans l'onglet overview pour les buyers:
{!earnings && (
  <div className="space-y-4">
    <Card>
      <CardHeader><CardTitle className="text-lg">Total Orders</CardTitle></CardHeader>
      <CardContent><p className="text-3xl font-bold">{orders.length}</p></CardContent>
    </Card>
    {user?.role === 'USER' && (
      <div className="p-4 bg-gray-50 rounded-lg border">
        <p className="font-semibold mb-2">Want to sell your services?</p>
        <Link href="/seller/onboard">
          <Button variant="outline" size="sm">Become a Seller</Button>
        </Link>
      </div>
    )}
  </div>
)}

// Dans l'onglet Services, afficher les services ou message vide avec bouton:
{services.length === 0 ? (
  <Card>
    <CardContent className="pt-6">
      <p className="text-gray-600 mb-4">No services yet.</p>
      <Link href="/services/create">
        <Button size="sm">Create your first service</Button>
      </Link>
    </CardContent>
  </Card>
) : (
  <div className="grid md:grid-cols-2 gap-4">
    {services.map((service: any) => (
      <Card key={service.id}>
        <CardContent className="pt-4">
          <h3 className="font-semibold">{service.title}</h3>
          <p className="text-gray-600">${service.price}</p>
          <div className="flex gap-2 mt-3">
            <Link href={`/services/${service.id}`}>
              <Button variant="outline" size="sm">View</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}
```

---

## Task 6: Pages Admin

**Files:**
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/users/page.tsx`

**Step 1: Page admin/page.tsx (stats overview)**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function AdminPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/dashboard');
        return;
      }
      fetchData();
    }
  }, [user, authLoading]);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      if (statsData.success) setStats(statsData.data);
      if (usersData.success) setUsers(usersData.data.users);
    } finally {
      setLoading(false);
    }
  };

  // Render: stats cards + users table
  // Colonnes: Name, Email, Role, Date, Actions (toggle ban, change role)
}
```

**Step 2: Route /api/admin/users**

```ts
// src/app/api/admin/users/route.ts
import { NextRequest } from 'next/server';
import { requireRole } from '@/lib/auth';
import prisma from '@/lib/db';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/response';

export async function GET(request: NextRequest) {
  const auth = requireRole(request, ['ADMIN']);
  if (!auth) return unauthorizedResponse();

  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true, createdAt: true,
      _count: { select: { ordersAsBuyer: true, servicesCreated: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return successResponse({ users });
}
```

---

## Task 7: Page Profil + Onboarding Vendeur

**Files:**
- Create: `src/app/profile/page.tsx`
- Create: `src/app/seller/onboard/page.tsx`

**Step 1: page profil**

```tsx
// src/app/profile/page.tsx
// Affiche: nom, email, avatar, bio, phone
// Formulaire d'édition qui POST /api/users/[id] ou un nouveau PUT /api/profile
// Utilise useAuth() pour pré-remplir les champs
```

**Step 2: Créer route /api/profile**

```ts
// src/app/api/profile/route.ts
// GET: retourne le profil complet du user connecté
// PUT: met à jour name, bio, avatar, phone
import prisma from '@/lib/db';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return unauthorizedResponse();
  const user = await prisma.user.findUnique({
    where: { id: auth.id },
    include: { profile: true, sellerProfile: true },
    omit: { password: true },
  });
  return successResponse(user);
}

export async function PUT(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) return unauthorizedResponse();
  const body = await request.json();
  const updated = await prisma.user.update({
    where: { id: auth.id },
    data: { name: body.name, bio: body.bio, avatar: body.avatar },
  });
  if (body.phone || body.address || body.city) {
    await prisma.profile.upsert({
      where: { userId: auth.id },
      create: { userId: auth.id, phone: body.phone, address: body.address, city: body.city },
      update: { phone: body.phone, address: body.address, city: body.city },
    });
  }
  return successResponse({ success: true });
}
```

**Step 3: Page seller/onboard**

```tsx
// src/app/seller/onboard/page.tsx
// Bouton "Become a Seller" -> POST /api/seller/onboard -> redirige vers Stripe Connect
// Affiche le statut si déjà onboardé (stripeAccountId exists)
'use client';
import { useAuth } from '@/contexts/AuthContext';
// Fetch le statut du compte Stripe si stripeAccountId
// Bouton "Complete Stripe Setup" -> appelle /api/seller/onboard et redirige
```

---

## Task 8: Branding configurable + Polish

**Files:**
- Modify: `src/config/constants.ts`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/app/page.tsx`
- Create: `src/app/not-found.tsx`
- Modify: `.env.example`

**Step 1: Variables de branding dans .env**

Ajouter dans `.env.example`:
```
NEXT_PUBLIC_APP_NAME=ServiceHub
NEXT_PUBLIC_APP_TAGLINE=Hire Services, Grow Your Business
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_COMMISSION_PERCENT=10
```

**Step 2: Créer src/config/app.ts**

```ts
// src/config/app.ts
export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'ServiceHub',
  tagline: process.env.NEXT_PUBLIC_APP_TAGLINE || 'Hire Services, Grow Your Business',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  commissionPercent: Number(process.env.NEXT_PUBLIC_COMMISSION_PERCENT) || 10,
};
```

**Step 3: Remplacer les hardcodes**

- `Navbar.tsx`: `ServiceHub` → `APP_CONFIG.name`
- `page.tsx`: titre, footer copyright → `APP_CONFIG.name`, `APP_CONFIG.tagline`
- `stripe.service.ts`: `apiVersion: '2023-10-16' as any` → `apiVersion: '2024-12-18.acacia'`

**Step 4: 404 page**

```tsx
// src/app/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Navbar } from '@/components/Navbar';

export default function NotFound() {
  return (
    <main>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <p className="text-xl text-gray-600">Page not found</p>
        <Link href="/">
          <Button>Back to Home</Button>
        </Link>
      </div>
    </main>
  );
}
```

**Step 5: Mettre à jour la Navbar pour ajouter lien Admin si role ADMIN + lien Profile**

```tsx
// Ajouter dans le dropdown connecté:
<Link href="/profile">Profile</Link>
{user.role === 'ADMIN' && <Link href="/admin">Admin Panel</Link>}
{user.role === 'SELLER' && <Link href="/seller/onboard">Seller Settings</Link>}
```

---

## Task 9: Modifier conversations/[id]/route.ts pour SSE broadcast

**Files:**
- Modify: `src/app/api/conversations/[id]/route.ts`

Lire le fichier existant puis ajouter l'import et le broadcastMessage après sendMessage.

```ts
import { broadcastMessage } from '@/app/api/messages/sse/route';

// Après: const message = await messagingService.sendMessage(...)
broadcastMessage(conversationId, message);
```

---

## Ordre d'exécution recommandé

1. Task 1 (AuthContext) — requis par tout le reste
2. Task 2 (API routes) — requis par Tasks 3/4/5/6/7
3. Task 8 (app.ts config) — rapide, requis pour Navbar/pages
4. Tasks 3/4/5/6/7 en parallèle — indépendantes une fois Tasks 1/2/8 faites
5. Task 9 (SSE broadcast) — après Task 2
