import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ChartBarIcon,
  ChatAltIcon,
  CogIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ExclamationCircleIcon
} from '@heroicons/react/outline';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: ChartBarIcon,
      exact: true
    },
    {
      name: 'Feedback',
      href: '/admin/feedback',
      icon: ChatAltIcon
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: UserGroupIcon
    },
    {
      name: 'FAQs',
      href: '/admin/faqs',
      icon: DocumentTextIcon
    },
    {
      name: 'System Health',
      href: '/admin/system',
      icon: ExclamationCircleIcon
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: CogIcon
    }
  ];

  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1">
            <div className="flex items-center h-16 flex-shrink-0 px-4 bg-primary-700">
              <h1 className="text-xl font-bold text-white">QuickFAQs Admin</h1>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto">
              <nav className="flex-1 px-2 py-4 bg-primary-800 space-y-1">
                {navigation.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        group flex items-center px-2 py-2 text-sm font-medium rounded-md
                        ${active
                          ? 'bg-primary-900 text-white'
                          : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                        }
                      `}
                    >
                      <item.icon
                        className={`
                          mr-3 flex-shrink-0 h-6 w-6
                          ${active
                            ? 'text-white'
                            : 'text-primary-300 group-hover:text-white'
                          }
                        `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
