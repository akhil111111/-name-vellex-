import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const categories = [
  {
    id: 1,
    name: 'Men',
    image: '/images/category-men.jpg',
    link: '/categories/men'
  },
  {
    id: 2,
    name: 'Women',
    image: '/images/category-women.jpg',
    link: '/categories/women'
  },
  {
    id: 3,
    name: 'Kids',
    image: '/images/category-kids.jpg',
    link: '/categories/kids'
  },
  {
    id: 4,
    name: 'Accessories',
    image: '/images/category-accessories.jpg',
    link: '/categories/accessories'
  }
];

const CategoryGrid = () => {
  return (
    <div className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Shop By Category</h2>
        <p className="text-gray-600 text-center mb-10">Discover our curated collections for every occasion</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link 
              href={category.link} 
              key={category.id}
              className="group overflow-hidden rounded-lg relative h-80 block"
            >
              <div className="absolute inset-0 bg-gray-900 opacity-20 group-hover:opacity-30 transition-opacity z-10"></div>
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110" 
                   style={{ backgroundImage: `url(${category.image})` }}></div>
              <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                <h3 className="text-white text-2xl font-bold">{category.name}</h3>
                <p className="text-white mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  Shop Now <span className="ml-1">→</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryGrid; 