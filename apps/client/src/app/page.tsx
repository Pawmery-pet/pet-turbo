import { auth, signOut } from "@/auth";
import Link from "next/link";

function SignIn() {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Pawmery</h2>
      <p className="text-gray-600 mb-8">
        Continue the beautiful story with your beloved pet. Keep their memory alive, 
        share moments together, and find comfort in your ongoing bond.
      </p>
      <Link
        href="/login"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Begin Your Journey
      </Link>
    </div>
  );
}

function SignOut({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome Back!</h2>
      <p className="text-lg text-gray-700 mb-8">{children}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href="/dashboard"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border"
        >
          <div className="text-blue-600 text-3xl mb-2">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Dashboard</h3>
          <p className="text-gray-600 text-sm">View your forever friends and recent moments</p>
        </Link>
        
        <Link
          href="/pets"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border"
        >
          <div className="text-green-600 text-3xl mb-2">🐾</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">My Pets</h3>
          <p className="text-gray-600 text-sm">Continue your pet's story and keep their memory alive</p>
        </Link>
        
        <Link
          href="/profile"
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border"
        >
          <div className="text-purple-600 text-3xl mb-2">⚙️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile</h3>
          <p className="text-gray-600 text-sm">Update your account settings</p>
        </Link>
      </div>
      
      <form
        action={async () => {
          "use server";
          await signOut();
        }}
      >
        <button 
          type="submit"
          className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm hover:bg-gray-700 transition-colors"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}

export default async function Page() {
  let session = await auth();
  let user = session?.user?.email;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🐾 Pawmery</h1>
          <p className="text-xl text-gray-600">
            Keep your beloved pets close to your heart forever
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-8">
          {user ? (
            <SignOut>{`Welcome back, ${user}!`}</SignOut>
          ) : (
            <SignIn />
          )}
        </div>
        
        {!user && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
              How Pawmery Helps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">💝</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Preserve Their Story</h4>
                <p className="text-gray-600">Keep your pet's unique personality and precious memories alive through their ongoing story</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">💬</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Continue the Bond</h4>
                <p className="text-gray-600">Share moments and continue your beautiful relationship whenever your heart needs comfort</p>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-4">🌟</div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Find Peace</h4>
                <p className="text-gray-600">A gentle space to honor your pet's memory and find solace in your everlasting connection</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
