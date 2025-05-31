import React, { ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
  ArrowRightOnRectangleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Artikel', href: '/articles', icon: DocumentTextIcon },
    { name: 'Post', href: '/posts', icon: ClipboardDocumentListIcon },
    { name: 'Request', href: '/requests', icon: ClipboardDocumentCheckIcon },
    { name: 'History', href: '/history', icon: ClockIcon },
  ];

  // Add Users menu for admin and superadmin only
 if (session?.user?.role === 'superadmin') {
    navigation.splice(1, 0, { name: 'Kelola User', href: '/users', icon: UsersIcon });
  }

  const handleSignOut = () => {
    signOut({
      callbackUrl: '/login',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HANYA SATU HEADER */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">EcoCropShare</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Selamat Datang, {session?.user?.name || 'Administrator'}
                </p>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs">A</span>
              </div>
              <span className="text-sm text-gray-700">Administrator</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* HANYA SATU SIDEBAR */}
        <aside className="w-64 bg-white shadow-sm h-screen sticky top-0">
          <nav className="mt-6 px-4">
            <div className="space-y-2">
              {navigation.map((item) => {
                const isActive = router.pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                      isActive
                        ? 'bg-green-100 text-green-700 border-r-2 border-green-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 h-5 w-5 ${
                        isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSignOut}
                className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
              >
                <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                Logout
              </button>
            </div>

            {/* User Info at Bottom */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center px-3 py-2">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Administrator
                  </p>
                  <p className="text-xs text-gray-500 truncate">Admin</p>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="max-w-full mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;