'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm border-b border-[#E3DDC9]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <div className="relative h-8 w-auto">
              <Image
                src="/Brilliant_Full-Color_Dark.png"
                alt="Brilliant Perspectives"
                height={32}
                width={200}
                className="h-8 w-auto object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-[#3E5E17] hover:text-[#222222] transition-colors"
            >
              Media Kit
            </Link>
            <Link 
              href="/press-releases" 
              className="text-[#3E5E17] hover:text-[#222222] transition-colors"
            >
              Press Releases
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md text-[#3E5E17] hover:text-[#222222] hover:bg-[#F8F4F1]"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E3DDC9]">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-[#3E5E17] hover:text-[#222222] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Media Kit
              </Link>
              <Link 
                href="/press-releases" 
                className="text-[#3E5E17] hover:text-[#222222] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Press Releases
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
} 