import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
            Welcome to Vellex
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Your Next.js Application
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl hover:transform hover:scale-105 transition-all">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Fast</h2>
              <p className="text-gray-400">Built with Next.js for optimal performance and user experience</p>
            </div>
            
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl hover:transform hover:scale-105 transition-all">
              <h2 className="text-2xl font-semibold mb-4 text-purple-400">Modern</h2>
              <p className="text-gray-400">Using the latest web technologies and best practices</p>
            </div>
            
            <div className="p-6 bg-gray-800 rounded-lg shadow-xl hover:transform hover:scale-105 transition-all">
              <h2 className="text-2xl font-semibold mb-4 text-pink-400">Scalable</h2>
              <p className="text-gray-400">Designed to grow with your needs</p>
            </div>
          </div>
          
          <div className="mt-16">
            <a 
              href="https://github.com/akhil111111/-name-vellex-" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-full font-semibold transition-colors"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
