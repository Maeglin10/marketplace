'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    fetchService();
  }, [params.id]);

  const fetchService = async () => {
    try {
      const res = await fetch(`/api/services/${params.id}`);
      const data = await res.json();
      if (data.success) {
        setService(data.data);
        setReviews(data.data.reviews || []);
      }
    } catch (error) {
      console.error('Failed to fetch service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    router.push(`/checkout?serviceId=${service.id}&sellerId=${service.user.id}`);
  };

  const handleContactSeller = async () => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setContactLoading(true);
    try {
      const res = await fetch('/api/conversations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ targetUserId: service.user.id }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/messages');
      }
    } catch (error) {
      console.error('Failed to start conversation:', error);
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Service not found</p>
        </div>
      </main>
    );
  }

  const isOwnService = user?.id === service.user.id;

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Images */}
            {service.images?.length > 0 && (
              <div className="space-y-4">
                <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={service.images[0]}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {service.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {service.images.slice(1).map((img: string, idx: number) => (
                      <div key={idx} className="w-full h-24 bg-gray-200 rounded">
                        <img
                          src={img}
                          alt={`view-${idx}`}
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div>
              <h1 className="text-3xl font-bold mb-2">{service.title}</h1>
              <p className="text-sm text-gray-500">
                Category: <span className="font-medium">{service.category?.name}</span>
              </p>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{service.description}</p>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>Reviews ({reviews.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 text-sm">No reviews yet</p>
                ) : (
                  reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{review.reviewer.name}</p>
                        <span className="text-yellow-500 text-sm">
                          {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-gray-700 text-sm">{review.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="pt-6 space-y-6">
                {/* Price */}
                <div>
                  <p className="text-gray-500 text-sm">Starting price</p>
                  <p className="text-4xl font-bold">${service.price}</p>
                </div>

                {/* Seller Info */}
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Sold by</p>
                  <div className="flex items-center gap-3">
                    {service.user.avatar ? (
                      <img
                        src={service.user.avatar}
                        alt={service.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                        {service.user.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold">{service.user.name}</p>
                      {service.user.sellerProfile && (
                        <p className="text-xs text-gray-500">
                          {service.user.sellerProfile.totalOrders || 0} completed orders
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 border-t pt-4">
                  {isOwnService ? (
                    <p className="text-sm text-gray-500 text-center">This is your service</p>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" onClick={handleBuyNow}>
                        Buy Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleContactSeller}
                        disabled={contactLoading}
                      >
                        {contactLoading ? 'Opening chat...' : 'Contact Seller'}
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
