'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  CalendarDays,
  Stethoscope,
  CreditCard,
  ChevronRight,
  Clock,
  TrendingUp,
} from 'lucide-react';

import { Header } from '@/components/layout/header';
import { getDashboardData, DashboardData } from '@/lib/dashboard';
import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  glowColor: string;
  loading: boolean;
  delay?: string;
}

function StatCard({ label, value, icon, gradient, glowColor, loading, delay = '0s' }: StatCardProps) {
  return (
    <div
      className="animate-slide-up relative bg-card rounded-2xl border border-border p-5 overflow-hidden group hover:border-primary/30 transition-all duration-300 hover:-translate-y-0.5"
      style={{ animationDelay: delay }}
    >
      {/* Arka plan glow efekti */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${glowColor}`}
      />

      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${gradient}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
          {loading ? (
            <div className="h-7 w-20 skeleton rounded-lg mt-1" />
          ) : (
            <p className="text-2xl font-bold text-foreground mt-0.5 tabular-nums">{value}</p>
          )}
        </div>
        <TrendingUp size={14} className="ml-auto text-muted-foreground/30 group-hover:text-primary/40 transition-colors" />
      </div>
    </div>
  );
}


export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardData()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  return (
    <>
      <Header title="Dashboard" />
      <main className="flex-1 p-4 sm:p-6 space-y-6 overflow-auto">
        {/* İstatistik kartları */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            label="Toplam Hasta"
            value={s?.totalPatients ?? 0}
            icon={<Users size={20} className="text-blue-400" />}
            gradient="bg-blue-500/10 border border-blue-500/20"
            glowColor="bg-[radial-gradient(ellipse_at_top_left,_oklch(0.62_0.218_264_/_0.06)_0%,_transparent_70%)]"
            loading={loading}
            delay="0.05s"
          />
          <StatCard
            label="Bugünkü Randevular"
            value={s?.todayAppointments ?? 0}
            icon={<CalendarDays size={20} className="text-emerald-400" />}
            gradient="bg-emerald-500/10 border border-emerald-500/20"
            glowColor="bg-[radial-gradient(ellipse_at_top_left,_oklch(0.65_0.22_145_/_0.06)_0%,_transparent_70%)]"
            loading={loading}
            delay="0.1s"
          />
          <StatCard
            label="Aktif Tedaviler"
            value={s?.activeTreatments ?? 0}
            icon={<Stethoscope size={20} className="text-violet-400" />}
            gradient="bg-violet-500/10 border border-violet-500/20"
            glowColor="bg-[radial-gradient(ellipse_at_top_left,_oklch(0.62_0.19_300_/_0.06)_0%,_transparent_70%)]"
            loading={loading}
            delay="0.15s"
          />
          <StatCard
            label="Bekleyen Tahsilat"
            value={s ? `${Number(s.pendingPayments).toLocaleString('tr-TR')} ₺` : '0 ₺'}
            icon={<CreditCard size={20} className="text-amber-400" />}
            gradient="bg-amber-500/10 border border-amber-500/20"
            glowColor="bg-[radial-gradient(ellipse_at_top_left,_oklch(0.76_0.18_55_/_0.06)_0%,_transparent_70%)]"
            loading={loading}
            delay="0.2s"
          />
        </div>

        {/* Alt panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Yaklaşan randevular */}
          <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden" style={{ animationDelay: '0.25s' }}>
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm text-foreground">Yaklaşan Randevular</h2>
              <button
                onClick={() => router.push('/appointments')}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                Tümü <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-border/50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="px-5 py-4 flex gap-3">
                    <div className="h-9 w-9 skeleton rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 skeleton rounded w-2/3" />
                      <div className="h-2.5 skeleton rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : !data?.upcomingAppointments.length ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Yaklaşan randevu yok
                </p>
              ) : (
                data.upcomingAppointments.map((a, i) => (
                  <div
                    key={a.id}
                    className="stagger-item animate-slide-up px-5 py-3.5 flex items-center gap-3 hover:bg-muted/40 cursor-pointer transition-all duration-150 group"
                    style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                    onClick={() => router.push(`/patients/${a.patient.id}`)}
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                      {a.patient.firstName[0]}{a.patient.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {a.patient.firstName} {a.patient.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {new Date(a.startTime).toLocaleString('tr-TR', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {' · Dr. '}
                        {a.doctor.firstName} {a.doctor.lastName}
                      </p>
                    </div>
                    <AppointmentStatusBadge status={a.status as any} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Son hastalar */}
          <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden" style={{ animationDelay: '0.3s' }}>
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-semibold text-sm text-foreground">Son Eklenen Hastalar</h2>
              <button
                onClick={() => router.push('/patients')}
                className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
              >
                Tümü <ChevronRight size={12} />
              </button>
            </div>
            <div className="divide-y divide-border/50">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="px-5 py-4 flex gap-3">
                    <div className="h-9 w-9 skeleton rounded-full shrink-0" />
                    <div className="flex-1 space-y-2 pt-1">
                      <div className="h-3 skeleton rounded w-2/3" />
                      <div className="h-2.5 skeleton rounded w-1/3" />
                    </div>
                  </div>
                ))
              ) : !data?.recentPatients.length ? (
                <p className="text-sm text-muted-foreground text-center py-10">
                  Henüz hasta yok
                </p>
              ) : (
                data.recentPatients.map((p, i) => (
                  <div
                    key={p.id}
                    className="stagger-item animate-slide-up px-5 py-3.5 flex items-center gap-3 hover:bg-muted/40 cursor-pointer transition-all duration-150 group"
                    style={{ animationDelay: `${0.35 + i * 0.05}s` }}
                    onClick={() => router.push(`/patients/${p.id}`)}
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold shrink-0 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                      {p.firstName[0]}{p.lastName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {p.firstName} {p.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{p.phone}</p>
                    </div>
                    <p className="text-xs text-muted-foreground shrink-0">
                      {new Date(p.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </>
  );
}
