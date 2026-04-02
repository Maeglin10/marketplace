'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Rating } from '@/components/ui/Rating';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { useAuth } from '@/contexts/AuthContext';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

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
        },
        credentials: 'include',
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

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ response: replyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, sellerResponse: replyText, sellerResponseAt: new Date().toISOString() }
              : r
          )
        );
        setReplyingTo(null);
        setReplyText('');
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setReplyLoading(false);
    }
  };

  /** Average rating computed from reviews */
  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  if (loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-100 dark:border-gray-800" />
            <div className="absolute inset-0 w-12 h-12 rounded-full border-4 border-black dark:border-white border-t-transparent animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (!service) {
    return (
      <main>
        <Navbar />
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <p className="text-gray-600 dark:text-gray-400 text-lg">Service not found</p>
          <Button variant="outline" onClick={() => router.push('/services')}>
            Browse Services
          </Button>
        </div>
      </main>
    );
  }

  const isOwnService = user?.id === service.user.id;
  const images: string[] = service.images || [];

  const breadcrumbItems = [
    { label: 'Services', href: '/services' },
    ...(service.category?.name ? [{ label: service.category.name, href: `/services?category=${service.category.id}` }] : []),
    { label: service.title },
  ];

  return (
    <main className="dark:bg-gray-950 min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} className="mb-6" />

        <div className="grid md:grid-cols-3 gap-8">
          {/* ── Main Content ── */}
          <div className="md:col-span-2 space-y-8">

            {/* Image Gallery */}
            {images.length > 0 && (
              <div className="space-y-3">
                {/* Main image */}
                <div className="w-full aspect-video bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
                  <img
                    src={images[activeImageIdx]}
                    alt={`${service.title} - image ${activeImageIdx + 1}`}
                    className="w-full h-full object-cover transition-opacity duration-200"
                  />
                </div>
                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img: string, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIdx(idx)}
                        className={`flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-colors ${
                          idx === activeImageIdx
                            ? 'border-black dark:border-white'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        aria-label={`View image ${idx + 1}`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title + Rating summary */}
            <div>
              <h1 className="text-3xl font-bold mb-3 dark:text-white">{service.title}</h1>
              <div className="flex items-center flex-wrap gap-3">
                {reviews.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Rating value={avgRating} size="sm" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                      {avgRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
                {service.category?.name && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    in{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {service.category.name}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>About this service</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>

            {/* About the Seller */}
            <Card>
              <CardHeader>
                <CardTitle>About the Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <Avatar
                    name={service.user.name || 'Seller'}
                    src={service.user.avatar}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-lg dark:text-white">{service.user.name}</p>
                    {service.user.bio && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-3">
                        {service.user.bio}
                      </p>
                    )}
                    {service.user.sellerProfile && (
                      <div className="flex flex-wrap gap-4 mt-3">
                        <div className="text-center">
                          <p className="text-xl font-bold dark:text-white">
                            {service.user.sellerProfile.totalOrders ?? 0}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Orders</p>
                        </div>
                        {service.user.sellerProfile.averageRating > 0 && (
                          <div className="text-center">
                            <p className="text-xl font-bold dark:text-white">
                              {Number(service.user.sellerProfile.averageRating).toFixed(1)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Rating</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Reviews{' '}
                  <span className="text-gray-400 dark:text-gray-500 font-normal text-base">
                    ({reviews.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {reviews.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No reviews yet.</p>
                ) : (
                  reviews.map((review: any) => (
                    <div
                      key={review.id}
                      className="border-b border-gray-100 dark:border-gray-800 pb-5 last:border-b-0 last:pb-0"
                    >
                      {/* Reviewer info + rating */}
                      <div className="flex items-start gap-3 mb-2">
                        <Avatar
                          name={review.reviewer.name || 'User'}
                          src={review.reviewer.avatar}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-2">
                            <p className="font-semibold text-sm dark:text-white">
                              {review.reviewer.name}
                            </p>
                            <Rating value={review.rating} size="sm" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
                              {new Date(review.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Seller response (if exists) */}
                      {review.sellerResponse && (
                        <div className="mt-3 ml-9 pl-3 border-l-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-r-lg py-2 pr-3">
                          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                            Seller&apos;s response
                            {review.sellerResponseAt && (
                              <span className="font-normal text-gray-400 dark:text-gray-500 ml-2">
                                ·{' '}
                                {new Date(review.sellerResponseAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            {review.sellerResponse}
                          </p>
                        </div>
                      )}

                      {/* Reply button / textarea (seller only, no existing response) */}
                      {isOwnService && !review.sellerResponse && (
                        <div className="mt-3 ml-9">
                          {replyingTo === review.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write your response..."
                                rows={3}
                                className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white bg-white dark:bg-gray-900 dark:text-white"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSubmitReply(review.id)}
                                  disabled={replyLoading || !replyText.trim()}
                                >
                                  {replyLoading ? 'Saving...' : 'Submit response'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyingTo(review.id);
                                setReplyText('');
                              }}
                              className="text-xs text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white underline transition-colors"
                            >
                              Reply to this review
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Sticky Sidebar ── */}
          <div className="md:col-span-1">
            <div className="sticky top-20 space-y-4">
              <Card>
                <CardContent className="pt-6 space-y-5">
                  {/* Price */}
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-0.5">
                      Starting price
                    </p>
                    <p className="text-4xl font-bold dark:text-white">${service.price}</p>
                  </div>

                  {/* Rating snapshot */}
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Rating value={avgRating} size="sm" />
                      <span className="text-sm font-semibold dark:text-white">
                        {avgRating.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        ({reviews.length})
                      </span>
                    </div>
                  )}

                  {/* Seller Info */}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-medium mb-3">
                      Sold by
                    </p>
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={service.user.name || 'Seller'}
                        src={service.user.avatar}
                        size="md"
                      />
                      <div>
                        <p className="font-semibold dark:text-white">{service.user.name}</p>
                        {service.user.sellerProfile && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {service.user.sellerProfile.totalOrders || 0} completed orders
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
                    {isOwnService ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                        This is your service
                      </p>
                    ) : (
                      <>
                        <Button className="w-full" size="lg" onClick={handleBuyNow}>
                          Order Now
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

              {/* Trust badges */}
              <div className="rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 p-4 space-y-2">
                {[
                  { icon: '🔒', label: 'Secure payment' },
                  { icon: '✅', label: 'Satisfaction guaranteed' },
                  { icon: '💬', label: '24h support' },
                ].map((badge) => (
                  <div key={badge.label} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>{badge.icon}</span>
                    <span>{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
