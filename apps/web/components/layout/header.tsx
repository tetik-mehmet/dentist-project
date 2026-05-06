'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getMe } from '@/lib/auth';
import { AuthUser } from '@/types/auth';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
}

const roleLabel: Record<string, string> = {
  admin: 'Yönetici',
  doctor: 'Doktor',
  assistant: 'Asistan',
};

export function Header({ title }: HeaderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const fullName = user
    ? user.role === 'doctor'
      ? `Dr. ${user.firstName} ${user.lastName}`
      : `${user.firstName} ${user.lastName}`
    : null;

  return (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between shrink-0 sticky top-0 z-10">
      <h1 className="text-base font-semibold text-foreground tracking-tight">{title}</h1>

      <div className="flex items-center gap-2">
        {/* Tema toggle */}
        <button
          onClick={toggle}
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
            'text-muted-foreground hover:text-foreground hover:bg-muted',
          )}
          title={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Kullanıcı bilgisi */}
        {fullName && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-border">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-xs font-semibold text-foreground">{fullName}</span>
              <span className="text-[10px] text-muted-foreground">
                {roleLabel[user?.role ?? ''] ?? ''}
              </span>
            </div>
            <Avatar className="h-8 w-8 cursor-pointer shrink-0">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold border border-primary/20">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {!fullName && (
          <Avatar className="h-8 w-8 cursor-pointer shrink-0 ml-2">
            <AvatarFallback className="bg-primary/15 text-primary text-xs font-bold">
              U
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </header>
  );
}
