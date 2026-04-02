'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/contexts/AuthContext';

export default function FavoritesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites', {
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setFavorites(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (serviceId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ serviceId }),
      });
      const data = await res.json();
      if (data.success && !data.data.favorited) {
        setFavorites((prev) => prev.filter((f) => f.serviceId !== serviceId));
      }
    } catch (error) {
      console.error('Failed to remove favorite:', error);
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

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Mes favoris</h1>
          <p className="text-gray-500 mt-1">
            {favorites.length} service{favorites.length !== 1 ? 's' : ''} sauvegarde{favorites.length !== 1 ? 's' : ''}
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-400 text-lg mb-4">Vous n'avez pas encore de favoris</p>
            <Link href="/services">
              <Button>Parcourir les services</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => {
              const service = favorite.service;
              const avgRating =
                service.reviews?.length > 0
                  ? service.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
                    service.reviews.length
                  : null;

              return (
                <Card key={favorite.id} className="overflow-hidden group relative">
                  {/* Image */}
                  <div className="w-full h-48 bg-gray-100 overflow-hidden">
                    {service.images?.[0] ? (
                      <img
                        src={service.images[0]}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Bouton retirer */}
                  <button
                    onClick={() => handleRemove(service.id)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-red-500 hover:bg-red-50 transition-colors"
                    title="Retirer des favoris"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>

                  <CardContent className="p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      {service.category?.name}
                    </p>
                    <Link href={`/services/${service.id}`}>
                      <h2 className="font-semibold text-gray-900 hover:underline line-clamp-2 mb-2">
                        {service.title}
                      </h2>
                    </Link>

                    <div className="flex items-center gap-2 mb-3">
                      {service.user?.avatar ? (
                        <img
                          src={service.user.avatar}
                          alt={service.user.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
                          {service.user?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm text-gray-500">{service.user?.name}</span>
                      {avgRating && (
                        <span className="text-sm text-yellow-500 ml-auto">
                          ★ {avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="font-bold text-lg">${service.price}</p>
                      <Link href={`/services/${service.id}`}>
                        <Button size="sm" variant="outline">Voir le service</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
