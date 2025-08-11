'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';

export default function Chrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isBare = pathname?.startsWith('/bet'); // /bet এবং সাব-রুটে হেডার/ফুটার হাইড

  return (
    <>
      {!isBare && <SiteHeader />}
      <main className="flex-1 w-full">{children}</main>
      {!isBare && <SiteFooter />}
    </>
  );
}
