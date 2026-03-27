'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, TextArea, Label } from '@/components/ui/Form';
import { UploadButton } from '@uploadthing/react';
import type { OurFileRouter } from '@/app/api/uploadthing/core';

export default function CreateServicePage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState<string[]>(['']);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateService = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('auth-token');
      const filteredImages = images.filter((img) => img.trim());

      const res = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          categoryId,
          images: filteredImages,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to create service');
        return;
      }

      router.push(`/services/${data.data.id}`);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...images];
    newImages[index] = value;
    setImages(newImages);
  };

  const addImageField = () => {
    if (images.length < 5) {
      setImages([...images, '']);
    }
  };

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleUploadComplete = (res: { url: string }[]) => {
    const urls = res.map((file) => file.url);
    setImages((prev) => {
      // Remplacer les entrées vides d'abord, puis ajouter le reste
      const existing = prev.filter((img) => img.trim() !== '');
      const combined = [...existing, ...urls].slice(0, 5);
      return combined;
    });
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) return;
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    loadCategories();
  }, []);

  return (
    <main>
      <Navbar />
      
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Create Service</h1>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreateService} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="title">Service Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Full Stack Web Development"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <TextArea
                  id="description"
                  placeholder="Describe your service in detail..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="99.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Images</Label>
                  {images.length < 5 && (
                    <Button type="button" variant="outline" size="sm" onClick={addImageField}>
                      + Add URL
                    </Button>
                  )}
                </div>

                {/* Upload via uploadthing */}
                {images.length < 5 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center">
                    <UploadButton<OurFileRouter, 'serviceImage'>
                      endpoint="serviceImage"
                      onClientUploadComplete={handleUploadComplete}
                      onUploadError={(error) => setError(`Erreur upload : ${error.message}`)}
                      appearance={{
                        button: 'bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-700',
                        allowedContent: 'text-xs text-gray-400 mt-1',
                      }}
                    />
                    <p className="text-xs text-gray-400 mt-2">JPG, PNG, WebP — max 4 Mo — jusqu&apos;a 5 images</p>
                  </div>
                )}

                {/* Apercu des images uploadées / URLs saisies */}
                {images.filter((img) => img.trim()).length > 0 && (
                  <div className="space-y-2">
                    {images.map((image, index) => (
                      image.trim() && (
                        <div key={index} className="flex gap-2 items-center">
                          <img
                            src={image}
                            alt={`Image ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <Input
                            placeholder="URL de l'image"
                            value={image}
                            onChange={(e) => handleImageChange(index, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeImageField(index)}
                          >
                            Supprimer
                          </Button>
                        </div>
                      )
                    ))}
                  </div>
                )}

                {/* Champs URL vides (saisis manuellement) */}
                {images.filter((img) => !img.trim()).map((_, idx) => {
                  const realIndex = images.findIndex((img, i) => !img.trim() && images.indexOf(img) === i);
                  return (
                    <div key={`empty-${idx}`} className="flex gap-2">
                      <Input
                        placeholder="URL de l'image (optionnel)"
                        value=""
                        onChange={(e) => handleImageChange(realIndex, e.target.value)}
                      />
                      {images.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImageField(realIndex)}
                        >
                          Supprimer
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <Button type="submit" size="lg" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Service'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
