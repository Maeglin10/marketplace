'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

interface AnalyticsData {
  ordersByStatus: { status: string; count: number }[];
  revenueByMonth: { month: string; revenue: number }[];
  totalRevenue: number;
  services: { active: number; inactive: number };
  reviews: { averageRating: number; count: number };
  topServices: { service: { id: string; title: string; price: number; images: string[] } | undefined; orderCount: number }[];
  completionRate: number;
}

function RevenueChart({ data }: { data: { month: string; revenue: number }[] }) {
  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

  const formatMonth = (key: string) => {
    const [year, month] = key.split('-');
    const date = new Date(Number(year), Number(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-2">
      {data.map((item) => (
        <div key={item.month} className="flex items-center gap-3 text-sm">
          <span className="w-16 text-gray-500 text-xs shrink-0">{formatMonth(item.month)}</span>
          <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-500"
              style={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
            />
          </div>
          <span className="w-20 text-right font-medium text-xs">
            ${item.revenue.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const requests: Promise<any>[] = [
        fetch('/api/orders', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/seller/services', {
          credentials: 'include',
        }).then((r) => r.json()),
      ];

      if (user?.role === 'SELLER' || user?.role === 'ADMIN') {
        requests.push(
          fetch('/api/seller/earnings', {
            credentials: 'include',
          }).then((r) => r.json())
        );
        requests.push(
          fetch('/api/seller/analytics', {
            credentials: 'include',
          }).then((r) => r.json())
        );
      }

      const [ordersData, servicesData, earningsData, analyticsData] = await Promise.all(requests);

      if (ordersData?.success) setOrders(ordersData.data.orders);
      if (servicesData?.success) setServices(servicesData.data.services);
      if (earningsData?.success) setEarnings(earningsData.data);
      if (analyticsData?.success) setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main>
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'orders', label: 'Orders' },
    ...(user?.role === 'SELLER' || user?.role === 'ADMIN'
      ? [
          { id: 'services', label: 'My Services' },
          { id: 'analytics', label: 'Analytics' },
        ]
      : []),
  ];

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              Welcome back, <strong>{user?.name}</strong>
            </p>
          </div>
          <Link href="/profile">
            <Button variant="outline" size="sm">Edit Profile</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 border-b">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-black'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {earnings ? (
              <div className="grid md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-gray-600">Total Earnings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">${earnings.totalEarnings.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-gray-600">Completed Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{earnings.completedOrders}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-gray-600">In Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{earnings.pendingOrders}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-gray-600">Total Orders Placed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{orders.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base text-gray-600">Total Spent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      ${orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0).toFixed(2)}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Become a seller CTA */}
            {user?.role === 'USER' && (
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-lg mb-1">Want to sell your services?</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Become a seller and start earning by offering your expertise.
                </p>
                <Link href="/seller/onboard">
                  <Button size="sm">Become a Seller</Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card>
            <CardHeader>
              <CardTitle>Your Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No orders yet</p>
                  <Link href="/services">
                    <Button variant="outline" size="sm">Browse Services</Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left py-3 font-medium text-gray-600">Order ID</th>
                        <th className="text-left py-3 font-medium text-gray-600">Amount</th>
                        <th className="text-left py-3 font-medium text-gray-600">Status</th>
                        <th className="text-left py-3 font-medium text-gray-600">Date</th>
                        <th className="text-left py-3 font-medium text-gray-600" />
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order: any) => (
                        <tr key={order.id} className="border-b last:border-b-0">
                          <td className="py-3 font-mono text-xs text-gray-500">
                            #{order.id.slice(0, 8).toUpperCase()}
                          </td>
                          <td className="py-3 font-semibold">${order.totalAmount.toFixed(2)}</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                order.status === 'COMPLETED'
                                  ? 'bg-green-100 text-green-700'
                                  : order.status === 'IN_PROGRESS'
                                  ? 'bg-blue-100 text-blue-700'
                                  : order.status === 'PAID'
                                  ? 'bg-purple-100 text-purple-700'
                                  : order.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3">
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="ghost" size="sm">View →</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Services Tab (sellers only) */}
        {activeTab === 'services' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Services</h2>
              <Link href="/services/create">
                <Button size="sm">+ New Service</Button>
              </Link>
            </div>

            {services.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-gray-500 mb-4">No services yet.</p>
                  <Link href="/services/create">
                    <Button>Create your first service</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service: any) => (
                  <Card key={service.id} className="hover:shadow-md transition-shadow">
                    {service.images?.[0] && (
                      <div className="w-full h-40 overflow-hidden rounded-t-lg">
                        <img
                          src={service.images[0]}
                          alt={service.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="pt-4">
                      <h3 className="font-semibold line-clamp-2 mb-1">{service.title}</h3>
                      <p className="text-gray-500 text-sm mb-3">${service.price}</p>
                      <div className="flex gap-2">
                        <Link href={`/services/${service.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">View</Button>
                        </Link>
                        <span
                          className={`px-2 py-1 rounded text-xs flex items-center ${
                            service.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab (sellers only) */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {!analytics ? (
              <p className="text-gray-500 text-sm">Loading analytics...</p>
            ) : (
              <>
                {/* KPI Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500 font-medium">Total Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">${analytics.totalRevenue.toFixed(2)}</p>
                      <p className="text-xs text-gray-400 mt-1">last 6 months</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500 font-medium">Completion Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{analytics.completionRate}%</p>
                      <p className="text-xs text-gray-400 mt-1">excl. cancelled</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500 font-medium">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {analytics.reviews.averageRating > 0
                          ? analytics.reviews.averageRating.toFixed(1)
                          : '--'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {analytics.reviews.count} review{analytics.reviews.count !== 1 ? 's' : ''}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm text-gray-500 font-medium">Active Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{analytics.services.active}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {analytics.services.inactive} inactive
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Revenue Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue — Last 6 Months</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.revenueByMonth.every((m) => m.revenue === 0) ? (
                      <p className="text-gray-400 text-sm text-center py-6">
                        No completed orders in this period
                      </p>
                    ) : (
                      <RevenueChart data={analytics.revenueByMonth} />
                    )}
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Top 3 Services */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Services</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.topServices.length === 0 ? (
                        <p className="text-gray-400 text-sm">No orders yet</p>
                      ) : (
                        <ol className="space-y-3">
                          {analytics.topServices.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded-full bg-black text-white text-xs flex items-center justify-center font-bold shrink-0">
                                {idx + 1}
                              </span>
                              {item.service ? (
                                <div className="flex-1 min-w-0">
                                  <Link href={`/services/${item.service.id}`} className="hover:underline">
                                    <p className="font-medium text-sm truncate">{item.service.title}</p>
                                  </Link>
                                  <p className="text-xs text-gray-400">
                                    {item.orderCount} order{item.orderCount !== 1 ? 's' : ''} · ${item.service.price}
                                  </p>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-400">Service deleted</p>
                              )}
                            </li>
                          ))}
                        </ol>
                      )}
                    </CardContent>
                  </Card>

                  {/* Orders by Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Orders by Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.ordersByStatus.length === 0 ? (
                        <p className="text-gray-400 text-sm">No orders yet</p>
                      ) : (
                        <div className="space-y-2">
                          {analytics.ordersByStatus.map((item) => (
                            <div key={item.status} className="flex items-center justify-between text-sm">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  item.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-700'
                                    : item.status === 'IN_PROGRESS'
                                    ? 'bg-blue-100 text-blue-700'
                                    : item.status === 'PAID'
                                    ? 'bg-purple-100 text-purple-700'
                                    : item.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {item.status}
                              </span>
                              <span className="font-semibold">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
