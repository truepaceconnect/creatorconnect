'use client'
import NavigationBar from '@/component/NavigationBar/NavigationBar';

export default function AuthenticatedLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar />
      {children}
    </div>
  );
}