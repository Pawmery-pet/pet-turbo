import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface HeaderProps {
  isLoggedIn?: boolean;
  userEmail?: string;
}

export function Header({ isLoggedIn = false, userEmail }: HeaderProps) {
  return (
    <header className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-bold">Pawmery</span>
          </Link>
          
          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                <span className="text-sm text-gray-300">
                  Welcome, {userEmail}
                </span>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black">
                    Dashboard
                  </Button>
                </Link>
                <form action="/api/auth/signout" method="post" className="inline">
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black">
                    Sign Out
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="text-white border-white hover:bg-white hover:text-black">
                    Login
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}