'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <main>
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Order Details</h1>
          <Button onClick={() => router.back()} variant="outline">Back</Button>
        </div>

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
        </div>
      </div>
    </main>
  );
}
