'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { NotificationCenter } from '@/components/ui/NotificationCenter';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAuth } from '@/contexts/AuthContext';
import { APP_CONFIG } from '@/config/app';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <>
      <nav className="border-b border-gray-200 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-950 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold dark:text-white">
              {APP_CONFIG.name}
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                Browse Services
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                    Dashboard
                  </Link>
                  <Link href="/favorites" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                    Favorites
                  </Link>
                  <Link href="/messages" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                    Messages
                  </Link>
                  <Link href="/profile" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                    Profile
                  </Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium">
                      Admin
                    </Link>
                  )}
                  {user.role === 'SELLER' && (
                    <Link href="/seller/onboard" className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white">
                      Seller Settings
                    </Link>
                  )}
                  <NotificationCenter />
                  <ThemeToggle />
                  <Button onClick={logout} variant="outline" size="sm">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <ThemeToggle />
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">Login</Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">Register</Button>
                  </Link>
                </>
              )}
            </div>

            <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {isOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Link href="/services" className="block text-gray-600 hover:text-black py-2">
                Browse Services
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="block text-gray-600 hover:text-black py-2">Dashboard</Link>
                  <Link href="/favorites" className="block text-gray-600 hover:text-black py-2">Favorites</Link>
                  <Link href="/messages" className="block text-gray-600 hover:text-black py-2">Messages</Link>
                  <Link href="/profile" className="block text-gray-600 hover:text-black py-2">Profile</Link>
                  {user.role === 'ADMIN' && (
                    <Link href="/admin" className="block text-gray-600 hover:text-black py-2">Admin</Link>
                  )}
                  {user.role === 'SELLER' && (
                    <Link href="/seller/onboard" className="block text-gray-600 hover:text-black py-2">Seller Settings</Link>
                  )}
                  <Button onClick={logout} variant="outline" size="sm" className="w-full">Logout</Button>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="block py-2">
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link href="/auth/register" className="block py-2">
                    <Button size="sm" className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </nav>

    </>
  );
}
