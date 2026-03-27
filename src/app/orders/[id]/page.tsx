'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface DisputeForm {
  reason: string;
  description: string;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeForm, setDisputeForm] = useState<DisputeForm>({ reason: '', description: '' });

  useEffect(() => {
    // Read current user id from stored JWT payload (simple decode, no verification)
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id ?? null);
      } catch {
        // ignore
      }
    }
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch(`/api/orders/${params.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setOrder(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch(`/api/orders/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'CANCELLED' }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchOrder();
      } else {
        setActionError(data.error || 'Failed to cancel order');
      }
    } catch {
      setActionError('Failed to cancel order');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionError(null);
    try {
      const token = localStorage.getItem('auth-token');
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: order.id,
          reason: disputeForm.reason,
          description: disputeForm.description,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowDisputeForm(false);
        setDisputeForm({ reason: '', description: '' });
        await fetchOrder();
      } else {
        setActionError(data.error || 'Failed to open dispute');
      }
    } catch {
      setActionError('Failed to open dispute');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Order not found</p>
        </div>
      </main>
    );
  }

  const isBuyer = currentUserId === order.buyerId;
  const isSeller = currentUserId === order.sellerId;

  const canCancel =
    (isBuyer && order.status === 'PENDING') ||
    (isSeller && ['PAID', 'IN_PROGRESS'].includes(order.status));

  const canOpenDispute =
    isBuyer &&
    ['IN_PROGRESS', 'COMPLETED'].includes(order.status) &&
    !order.dispute;

  return (
    <main>
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Button onClick={() => router.back()} variant="outline">Back</Button>
        </div>

        {/* Action error */}
        {actionError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {actionError}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-gray-600">Order ID</p>
                <p className="font-mono">{order.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <span className={`px-3 py-1 rounded text-sm ${
                  order.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                  order.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'PAID' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div>
                <p className="text-gray-600">Date Created</p>
                <p>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <p className="text-gray-600">Subtotal</p>
                <p>${order.totalAmount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-600">Platform Fee (10%)</p>
                <p>${order.commissionAmount.toFixed(2)}</p>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-3">
                <p>Total</p>
                <p>${order.totalAmount.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Parties */}
          <Card>
            <CardHeader>
              <CardTitle>Buyer</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold">{order.buyer.name}</p>
                <p className="text-gray-600 text-sm">{order.buyer.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <p className="font-semibold">{order.seller.name}</p>
                <p className="text-gray-600 text-sm">{order.seller.email}</p>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left py-3">Service</th>
                    <th className="text-right py-3">Qty</th>
                    <th className="text-right py-3">Price</th>
                    <th className="text-right py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item: any) => (
                    <tr key={item.id} className="border-b">
                      <td className="py-3">{item.service.title}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">${item.price.toFixed(2)}</td>
                      <td className="text-right">${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          {/* Actions */}
          {(canCancel || canOpenDispute) && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {canCancel && (
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    {actionLoading ? 'Processing...' : 'Cancel Order'}
                  </Button>
                )}
                {canOpenDispute && (
                  <Button
                    variant="outline"
                    onClick={() => setShowDisputeForm(true)}
                    disabled={actionLoading}
                    className="border-orange-300 text-orange-700 hover:bg-orange-50"
                  >
                    Open Dispute
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Open dispute form */}
          {showDisputeForm && (
            <Card className="md:col-span-2 border-orange-200">
              <CardHeader>
                <CardTitle>Open a Dispute</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleOpenDispute} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      value={disputeForm.reason}
                      onChange={(e) => setDisputeForm((f) => ({ ...f, reason: e.target.value }))}
                      placeholder="e.g. Service not delivered, Quality issue..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      required
                      minLength={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={disputeForm.description}
                      onChange={(e) => setDisputeForm((f) => ({ ...f, description: e.target.value }))}
                      placeholder="Please describe the issue in detail..."
                      rows={4}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                      required
                      minLength={10}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" disabled={actionLoading}>
                      {actionLoading ? 'Submitting...' : 'Submit Dispute'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowDisputeForm(false);
                        setActionError(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Existing dispute */}
          {order.dispute && (
            <Card className="md:col-span-2 border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="text-yellow-800">Dispute</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <p className="text-gray-600 w-28">Status</p>
                  <span className={`px-2 py-0.5 rounded text-sm font-medium ${
                    order.dispute.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                    order.dispute.status === 'UNDER_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                    order.dispute.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {order.dispute.status}
                  </span>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Reason</p>
                  <p className="font-medium">{order.dispute.reason}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Description</p>
                  <p className="text-sm">{order.dispute.description}</p>
                </div>
                {order.dispute.resolution && (
                  <div className="pt-2 border-t border-yellow-200">
                    <p className="text-gray-600 text-sm">Resolution</p>
                    <p className="text-sm">{order.dispute.resolution}</p>
                  </div>
                )}
                <Button
                  variant="outline"
                  onClick={() => router.push(`/disputes/${order.dispute.id}`)}
                  className="mt-2"
                >
                  View Full Dispute
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
