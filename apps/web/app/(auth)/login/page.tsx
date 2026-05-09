'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success('Giriş başarılı, yönlendiriliyorsunuz...');
      router.push('/dashboard');
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || 'Giriş başarısız. Bilgilerinizi kontrol edin.',
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sol dekoratif panel — büyük ekranlarda */}
      <div className="hidden lg:flex flex-col flex-1 items-center justify-center bg-[var(--sidebar)] border-r border-border relative overflow-hidden px-12">
        {/* Arka plan dekor */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_oklch(0.62_0.218_264_/_0.15)_0%,_transparent_60%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-[radial-gradient(ellipse_at_bottom_left,_oklch(0.62_0.218_264_/_0.08)_0%,_transparent_70%)]" />

        <div className="relative z-10 text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center mx-auto mb-6 animate-glow-pulse">
            <Activity size={28} className="text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Dental Clinic
          </h2>
          <p className="text-[var(--sidebar-foreground)]/50 text-base max-w-xs mx-auto leading-relaxed">
            Profesyonel klinik yönetimi için tek platform
          </p>

          <div className="mt-10 grid grid-cols-2 gap-4 max-w-xs mx-auto">
            {[
              { label: 'Hasta Yönetimi', desc: 'Merkezi kayıt' },
              { label: 'Randevu Takibi', desc: 'Haftalık takvim' },
              { label: 'Tedavi Planları', desc: 'Adım adım ilerleme' },
              { label: 'Ödeme Sistemi', desc: 'Tahsilat takibi' },
            ].map((item, i) => (
              <div
                key={item.label}
                className="animate-slide-up stagger-item rounded-xl border border-white/5 bg-white/3 p-3 text-left"
                style={{ animationDelay: `${0.1 + i * 0.06}s` }}
              >
                <p className="text-xs font-semibold text-white/80">{item.label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sağ — giriş formu */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobil logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
            <Activity size={20} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">Dental Clinic</p>
            <p className="text-[10px] text-muted-foreground">Yönetim Sistemi</p>
          </div>
        </div>

        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Hoş Geldiniz</h1>
            <p className="text-muted-foreground text-sm mt-1.5">
              Devam etmek için hesabınıza giriş yapın
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-posta
              </Label>
              <Input
                type="email"
                placeholder="ornek@klinik.com"
                autoComplete="email"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive animate-slide-up">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Şifre
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...register('password')}
                  className={cn('pr-10', errors.password ? 'border-destructive' : '')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive animate-slide-up">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-10 font-semibold tracking-wide shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}
