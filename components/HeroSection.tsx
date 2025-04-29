import React from 'react';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <div className="relative bg-gray-900 h-[80vh]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent opacity-70"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url("/images/hero-bg.jpg")' }}
        ></div>
      </div>
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-xl">
            <h1 className="text-5xl font-bold text-white mb-4">Discover Your Style</h1>
            <p className="text-lg text-gray-200 mb-8">
              Explore our new collection of contemporary fashion essentials.
              Designed for comfort and style.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/shop" 
                className="bg-white text-gray-900 hover:bg-gray-100 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Shop Now
              </Link>
              <Link 
                href="/categories" 
                className="border border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3 rounded-md font-medium transition-colors"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection; 