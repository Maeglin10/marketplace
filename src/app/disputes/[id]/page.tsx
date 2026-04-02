'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  UNDER_REVIEW: 'Under Review',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-red-100 text-red-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-700',
};

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDispute();
  }, [params.id]);

  const fetchDispute = async () => {
    try {
      const res = await fetch(`/api/disputes/${params.id}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setDispute(data.data);
      } else {
        setError(data.error || 'Failed to load dispute');
      }
    } catch {
      setError('Failed to load dispute');
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

  if (error || !dispute) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-red-600">{error || 'Dispute not found'}</p>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Dispute Details</h1>
          <Button onClick={() => router.back()} variant="outline">
            Back
          </Button>
        </div>

        <div className="space-y-6">
          {/* Status & meta */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <p className="text-gray-600 w-32">Status</p>
                <span
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    STATUS_COLORS[dispute.status] ?? 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {STATUS_LABELS[dispute.status] ?? dispute.status}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-gray-600 w-32">Reason</p>
                <p className="font-medium">{dispute.reason}</p>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-gray-600 w-32">Opened by</p>
                <p>
                  {dispute.openedBy.name}{' '}
                  <span className="text-gray-500 text-sm">({dispute.openedBy.email})</span>
                </p>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-gray-600 w-32">Date opened</p>
                <p>{new Date(dispute.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-start gap-3">
                <p className="text-gray-600 w-32">Last updated</p>
                <p>{new Date(dispute.updatedAt).toLocaleDateString()}</p>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 whitespace-pre-wrap">{dispute.description}</p>
            </CardContent>
          </Card>

          {/* Related order */}
          <Card>
            <CardHeader>
              <CardTitle>Related Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <p className="text-gray-600 w-32">Order ID</p>
                <p className="font-mono text-sm">{dispute.order.id}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-gray-600 w-32">Order status</p>
                <p>{dispute.order.status}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-gray-600 w-32">Total amount</p>
                <p>${dispute.order.totalAmount.toFixed(2)}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => router.push(`/orders/${dispute.order.id}`)}
                className="mt-2"
              >
                View Order
              </Button>
            </CardContent>
          </Card>

          {/* Resolution (shown when available) */}
          {dispute.resolution && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">Resolution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-900 whitespace-pre-wrap">{dispute.resolution}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
