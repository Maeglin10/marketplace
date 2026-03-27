'use client';

import { useEffect, useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Form';
import { ServiceCardSkeleton } from '@/components/ServiceCardSkeleton';
import Link from 'next/link';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'rating';

const SORT_OPTIONS: { value: SortOption | ''; label: string }[] = [
  { value: '', label: 'Pertinence' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'rating', label: 'Les mieux notés' },
  { value: 'newest', label: 'Plus récents' },
];

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [sort, setSort] = useState<SortOption | ''>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [search, selectedCategory, priceRange, sort]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(priceRange && { priceMin: priceRange[0].toString(), priceMax: priceRange[1].toString() }),
        ...(sort && { sort }),
        page: '1',
        limit: '20',
      });

      const res = await fetch(`/api/services/search?${params}`);
      const data = await res.json();
      if (data.success) {
        setServices(data.data.services);
      }
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Browse Services</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar Filters */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Search</h3>
                <Input
                  placeholder="Search services..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Category</h3>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Price Range</h3>
                <div className="space-y-2">
                  <div>
                    <label className="text-sm text-gray-600">Min: ${priceRange[0]}</label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Max: ${priceRange[1]}</label>
                    <input
                      type="range"
                      min="0"
                      max="5000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Grid */}
          <div className="md:col-span-3">
            {/* Sort bar */}
            <div className="flex items-center justify-end mb-4">
              <label htmlFor="sort-select" className="text-sm text-gray-600 mr-2">
                Trier par :
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption | '')}
                className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ServiceCardSkeleton key={i} />
                ))}
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No services found</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service: any) => (
                  <Link key={service.id} href={`/services/${service.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                      {service.images?.length > 0 && (
                        <div className="w-full h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                          <img
                            src={service.images[0]}
                            alt={service.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="pt-4">
                        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{service.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>

                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold">${service.price}</span>
                          <div className="text-sm text-gray-600">
                            by {service.user.name}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
