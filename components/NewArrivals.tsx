import React from 'react';
import Link from 'next/link';

const newArrivals = [
  {
    id: 1,
    name: 'Oversized Cotton Sweater',
    price: 79.99,
    image: '/images/new-arrival-1.jpg'
  },
  {
    id: 2,
    name: 'Relaxed Fit Hoodie',
    price: 49.99,
    image: '/images/new-arrival-2.jpg'
  },
  {
    id: 3,
    name: 'Linen Blend Shorts',
    price: 39.99,
    image: '/images/new-arrival-3.jpg'
  }
];

const NewArrivals = () => {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">New Arrivals</h2>
        <p className="text-gray-600 text-center mb-10">Stay ahead of the trend with our latest collections</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {newArrivals.map((product) => (
            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div 
                className="h-80 bg-cover bg-center"
                style={{ backgroundImage: `url(${product.image})` }}
              ></div>
              <div className="p-6">
                <h3 className="font-semibold text-xl mb-2">{product.name}</h3>
                <p className="font-bold text-blue-600 mb-4">${product.price.toFixed(2)}</p>
                <Link 
                  href={`/products/${product.id}`}
                  className="block text-center bg-gray-900 text-white py-3 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link 
            href="/new-arrivals" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            View All New Arrivals
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NewArrivals; 