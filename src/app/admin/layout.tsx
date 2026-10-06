'use client';

import React, { useEffect } from 'react';

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Enable native cursor on HTML and Body when in admin section
    document.documentElement.classList.add('admin-active');
    document.body.classList.add('admin-active');

    return () => {
      document.documentElement.classList.remove('admin-active');
      document.body.classList.remove('admin-active');
    };
  }, []);

  return (
    <div data-admin-portal="true" className="admin-portal min-h-screen">
      {children}
    </div>
  );
}
