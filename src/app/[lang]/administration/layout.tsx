import type { ReactNode } from 'react';
import AdminSupportChatWidget from '@/components/AdminSupportChatWidget';

export default function AdministrationLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <AdminSupportChatWidget />
    </>
  );
}
