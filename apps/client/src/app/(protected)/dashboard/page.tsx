import { auth } from "@/auth";
import Link from "next/link";
import PendingPetJobs from './PendingPetJobs';

export default async function DashboardPage() {
  const session = await auth();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Forever Friends</h2>
        <p className="text-gray-600">
          Welcome to your Pawmery space. Continue the beautiful stories with your beloved pets and cherish your ongoing bond.
        </p>
      </div>

      {/* Pending Pet Jobs Section */}
      <PendingPetJobs />
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ways to Connect</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/pets/create-story"
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">✨</div>
            <h4 className="font-semibold mb-1">Start Their Story</h4>
            <p className="text-sm opacity-90">Begin preserving your pet's precious memories</p>
          </Link>
          
          <Link
            href="/pets"
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">💝</div>
            <h4 className="font-semibold mb-1">Share a Moment</h4>
            <p className="text-sm opacity-90">Continue your journey together</p>
          </Link>
          
          <Link
            href="/pets"
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors text-center"
          >
            <div className="text-2xl mb-2">🐾</div>
            <h4 className="font-semibold mb-1">Visit Your Pets</h4>
            <p className="text-sm opacity-90">See all your forever friends</p>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Forever Friends</h3>
          <p className="text-3xl font-bold text-blue-600">0</p>
          <p className="text-sm text-gray-500">Stories started</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Shared Moments</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500">This week</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Precious Memories</h3>
          <p className="text-3xl font-bold text-purple-600">0</p>
          <p className="text-sm text-gray-500">Treasured forever</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Moments</h3>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8 text-center text-gray-500">
            <div className="text-4xl mb-4">💝</div>
            <p>No moments shared yet</p>
            <p className="text-sm mt-2">Start your first pet's story to begin this beautiful journey!</p>
          </div>
        </div>
      </div>
    </div>
  );
} 