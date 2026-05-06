'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Settings,
  LogOut,
  Activity,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { logout, getMe } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/patients', label: 'Hastalar', icon: Users },
  { href: '/appointments', label: 'Randevular', icon: CalendarDays },
  { href: '/treatments', label: 'Tedaviler', icon: Stethoscope },
];

const bottomNavItems = [
  { href: '/settings', label: 'Ayarlar', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    getMe().then((user) => {
      if (user?.role === 'admin') setIsAdmin(true);
    });
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Başarıyla çıkış yapıldı');
      router.push('/login');
      router.refresh();
    } catch {
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[var(--sidebar)] text-[var(--sidebar-foreground)] shrink-0 border-r border-[var(--sidebar-border)]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--sidebar-border)]">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 animate-glow-pulse">
          <Activity size={18} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm leading-tight text-white">Dental Clinic</p>
          <p className="text-[11px] text-[var(--sidebar-foreground)]/50">Yönetim Sistemi</p>
        </div>
      </div>

      {/* Nav grubu başlığı */}
      <div className="px-4 pt-5 pb-1">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--sidebar-foreground)]/30">
          Menü
        </p>
      </div>

      {/* Ana Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-[var(--sidebar-foreground)]/60 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]',
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'transition-transform duration-200',
                  active
                    ? 'text-white'
                    : 'text-[var(--sidebar-foreground)]/40 group-hover:text-[var(--sidebar-foreground)] group-hover:scale-110',
                )}
              />
              {label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </Link>
          );
        })}

        {/* Admin — Son Aktiviteler butonu */}
        {isAdmin && (() => {
          const active = pathname === '/activities';
          return (
            <Link
              href="/activities"
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-[var(--sidebar-foreground)]/60 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]',
              )}
            >
              <ClipboardList
                size={17}
                className={cn(
                  'transition-transform duration-200',
                  active
                    ? 'text-white'
                    : 'text-[var(--sidebar-foreground)]/40 group-hover:text-[var(--sidebar-foreground)] group-hover:scale-110',
                )}
              />
              Son Aktiviteler
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
              )}
            </Link>
          );
        })()}
      </nav>

      {/* Bottom Nav */}
      <div className="px-3 pb-2 pt-3 border-t border-[var(--sidebar-border)] space-y-0.5">
        {bottomNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-[var(--sidebar-foreground)]/60 hover:text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]',
              )}
            >
              <Icon
                size={17}
                className={cn(
                  'transition-transform duration-200',
                  active
                    ? 'text-white'
                    : 'text-[var(--sidebar-foreground)]/40 group-hover:text-[var(--sidebar-foreground)] group-hover:scale-110',
                )}
              />
              {label}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[var(--sidebar-foreground)]/60 hover:text-red-400 hover:bg-red-500/10 w-full transition-all duration-200"
        >
          <LogOut
            size={17}
            className="text-[var(--sidebar-foreground)]/40 group-hover:text-red-400 group-hover:scale-110 transition-all duration-200"
          />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
