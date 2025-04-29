import Link from 'next/link';

export default function Home() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Welcome to Vellex Gaming
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          Play your favorite board games online
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/chess" className="group">
          <div className="p-6 bg-gray-800 rounded-lg shadow-xl hover:bg-gray-700 transition-all">
            <h2 className="text-2xl font-semibold mb-4 text-blue-400 group-hover:text-blue-300">Chess</h2>
            <p className="text-gray-400">Play chess against a friend or practice your skills</p>
            <div className="mt-4 text-sm text-blue-400 group-hover:text-blue-300">Play Now →</div>
          </div>
        </Link>
        
        <Link href="/games" className="group">
          <div className="p-6 bg-gray-800 rounded-lg shadow-xl hover:bg-gray-700 transition-all">
            <h2 className="text-2xl font-semibold mb-4 text-purple-400 group-hover:text-purple-300">More Games</h2>
            <p className="text-gray-400">Explore other games like Ludo (Coming Soon)</p>
            <div className="mt-4 text-sm text-purple-400 group-hover:text-purple-300">Explore →</div>
          </div>
        </Link>
      </div>
      
      <div className="text-center mt-12">
        <h2 className="text-2xl font-semibold mb-6 text-gray-200">Why Choose Vellex Gaming?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-blue-400">Free to Play</h3>
            <p className="text-gray-400">All games are completely free</p>
          </div>
          
          <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-purple-400">No Downloads</h3>
            <p className="text-gray-400">Play directly in your browser</p>
          </div>
          
          <div className="p-6 bg-gray-800 rounded-lg shadow-xl">
            <h3 className="text-xl font-semibold mb-2 text-pink-400">Multiplayer</h3>
            <p className="text-gray-400">Play with friends online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
