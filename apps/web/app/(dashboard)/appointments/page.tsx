'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  LayoutList,
  CalendarDays,
  CalendarRange,
  CalendarX,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { CreateAppointmentDialog } from '@/components/appointments/create-appointment-dialog';
import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import {
  getAppointments,
  updateAppointmentStatus,
  Appointment,
  AppointmentStatus,
} from '@/lib/appointments';
import { cn } from '@/lib/utils';

/* ─── Date helpers ─────────────────────────────────────────────── */

function startOfWeek(d: Date): Date {
  const day = new Date(d);
  const diff = day.getDay() === 0 ? -6 : 1 - day.getDay();
  day.setDate(day.getDate() + diff);
  day.setHours(0, 0, 0, 0);
  return day;
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function addMonths(d: Date, n: number): Date {
  const r = new Date(d.getFullYear(), d.getMonth() + n, 1);
  return r;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function toDateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

/* ─── Constants ────────────────────────────────────────────────── */

const STATUS_OPTIONS: { value: AppointmentStatus; label: string }[] = [
  { value: 'scheduled', label: 'Planlandı' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
  { value: 'no_show', label: 'Gelmedi' },
];

const WEEK_DAYS_SHORT = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

type View = 'list' | '14days' | 'month';

/* ─── Page ─────────────────────────────────────────────────────── */

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>('list');
  const [periodStart, setPeriodStart] = useState<Date>(() => startOfWeek(new Date()));

  /* Date range + label derived from view & periodStart */
  const { from, to, periodLabel } = useMemo(() => {
    if (view === 'month') {
      const ms = startOfMonth(periodStart);
      const me = new Date(ms.getFullYear(), ms.getMonth() + 1, 0, 23, 59, 59);
      return {
        from: toDateStr(ms) + 'T00:00:00',
        to: toDateStr(me) + 'T23:59:59',
        periodLabel: periodStart.toLocaleDateString('tr-TR', {
          month: 'long',
          year: 'numeric',
        }),
      };
    }
    // list & 14days → 14-day window
    const end = addDays(periodStart, 13);
    return {
      from: toDateStr(periodStart) + 'T00:00:00',
      to: toDateStr(end) + 'T23:59:59',
      periodLabel: `${periodStart.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
      })} – ${end.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}`,
    };
  }, [view, periodStart]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAppointments({ from, to });
      setAppointments(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    load();
  }, [load]);

  /* Navigation */
  const goNext = useCallback(() => {
    if (view === 'month') setPeriodStart((p) => addMonths(p, 1));
    else setPeriodStart((p) => addDays(p, 14));
  }, [view]);

  const goPrev = useCallback(() => {
    if (view === 'month') setPeriodStart((p) => addMonths(p, -1));
    else setPeriodStart((p) => addDays(p, -14));
  }, [view]);

  const goToday = useCallback(() => {
    if (view === 'month') setPeriodStart(startOfMonth(new Date()));
    else setPeriodStart(startOfWeek(new Date()));
  }, [view]);

  /* When view changes, re-anchor period to today */
  const changeView = useCallback((v: View) => {
    setView(v);
    if (v === 'month') setPeriodStart(startOfMonth(new Date()));
    else setPeriodStart(startOfWeek(new Date()));
  }, []);

  const handleCreated = (a: Appointment) =>
    setAppointments((prev) =>
      [...prev, a].sort(
        (x, y) => new Date(x.startTime).getTime() - new Date(y.startTime).getTime(),
      ),
    );

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    try {
      const updated = await updateAppointmentStatus(id, status);
      setAppointments((prev) => prev.map((a) => (a.id === id ? updated : a)));
    } catch {}
  };

  /* 14-day array for grid views */
  const fourteenDays = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(periodStart, i)),
    [periodStart],
  );

  return (
    <>
      <Header title="Randevular" />
      <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-auto">
        {/* Araç çubuğu */}
        <div className="animate-slide-up flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={goPrev}>
              <ChevronLeft size={15} />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[200px] text-center">
              {periodLabel}
            </span>
            <Button variant="outline" size="sm" onClick={goNext}>
              <ChevronRight size={15} />
            </Button>
            <Button variant="outline" size="sm" onClick={goToday}>
              Bugün
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Görünüm seçici */}
            <div className="flex rounded-lg border border-border overflow-hidden bg-muted/30">
              <ViewButton
                active={view === 'list'}
                onClick={() => changeView('list')}
                title="Liste"
                icon={<LayoutList size={15} />}
              />
              <ViewButton
                active={view === '14days'}
                onClick={() => changeView('14days')}
                title="14 Gün"
                icon={<CalendarDays size={15} />}
              />
              <ViewButton
                active={view === 'month'}
                onClick={() => changeView('month')}
                title="Ay"
                icon={<CalendarRange size={15} />}
              />
            </div>
            <CreateAppointmentDialog
              onCreated={handleCreated}
              defaultDate={toDateStr(new Date())}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : view === 'list' ? (
          <ListView appointments={appointments} onStatusChange={handleStatusChange} />
        ) : view === '14days' ? (
          <FourteenDayView
            days={fourteenDays}
            appointments={appointments}
            onStatusChange={handleStatusChange}
          />
        ) : (
          <MonthView
            periodStart={periodStart}
            appointments={appointments}
            onStatusChange={handleStatusChange}
          />
        )}
      </main>
    </>
  );
}

/* ─── ViewButton ────────────────────────────────────────────────── */

function ViewButton({
  active,
  onClick,
  title,
  icon,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-all duration-150',
        active
          ? 'bg-primary text-white'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
      )}
      title={title}
    >
      {icon}
      <span className="hidden sm:inline">{title}</span>
    </button>
  );
}

/* ─── ListView ──────────────────────────────────────────────────── */

function ListView({
  appointments,
  onStatusChange,
}: {
  appointments: Appointment[];
  onStatusChange: (id: string, s: AppointmentStatus) => void;
}) {
  if (appointments.length === 0) {
    return (
      <div className="animate-fade-in text-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <CalendarX size={24} className="text-muted-foreground" />
        </div>
        <p className="text-base font-medium text-foreground">Bu dönemde randevu yok</p>
        <p className="text-sm text-muted-foreground mt-1.5">Yeni randevu ekleyerek başlayın</p>
      </div>
    );
  }

  return (
    <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/30">
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tarih / Saat
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Hasta
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">
              Doktor
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Durum
            </th>
            <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">
              Notlar
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {appointments.map((a, i) => (
            <tr
              key={a.id}
              className="stagger-item animate-slide-up hover:bg-muted/30 transition-all duration-150"
              style={{ animationDelay: `${i * 0.03}s` }}
            >
              <td className="px-5 py-3.5 whitespace-nowrap">
                <p className="font-medium text-foreground">
                  {new Date(a.startTime).toLocaleDateString('tr-TR', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(a.startTime).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  {' – '}
                  {new Date(a.endTime).toLocaleTimeString('tr-TR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </td>
              <td className="px-5 py-3.5">
                <p className="font-medium text-foreground">
                  {a.patient.firstName} {a.patient.lastName}
                </p>
                <p className="text-xs text-muted-foreground">{a.patient.phone}</p>
              </td>
              <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">
                Dr. {a.doctor.firstName} {a.doctor.lastName}
              </td>
              <td className="px-5 py-3.5">
                <select
                  value={a.status}
                  onChange={(e) => onStatusChange(a.id, e.target.value as AppointmentStatus)}
                  className="text-xs rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-5 py-3.5 text-muted-foreground text-xs hidden lg:table-cell max-w-[200px] truncate">
                {a.notes || '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-5 py-3 border-t border-border/50 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{appointments.length}</span> randevu
      </div>
    </div>
  );
}

/* ─── FourteenDayView ───────────────────────────────────────────── */

function FourteenDayView({
  days,
  appointments,
  onStatusChange,
}: {
  days: Date[];
  appointments: Appointment[];
  onStatusChange: (id: string, s: AppointmentStatus) => void;
}) {
  const today = new Date();

  return (
    <div className="animate-slide-up grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
      {days.map((day, i) => {
        const dayApps = appointments.filter((a) => isSameDay(new Date(a.startTime), day));
        const isToday = isSameDay(day, today);

        return (
          <div
            key={day.toISOString()}
            className={cn(
              'stagger-item animate-slide-up rounded-xl border p-3 min-h-[140px] transition-all duration-200',
              isToday
                ? 'border-primary/40 bg-primary/5'
                : 'border-border bg-card hover:border-border/80',
            )}
            style={{ animationDelay: `${i * 0.03}s` }}
          >
            <p
              className={cn(
                'text-xs font-semibold mb-2.5',
                isToday ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {day.toLocaleDateString('tr-TR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
              })}
            </p>

            {dayApps.length === 0 ? (
              <p className="text-xs text-muted-foreground/30 text-center mt-4">—</p>
            ) : (
              <div className="space-y-1.5">
                {dayApps.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-lg bg-muted/40 border border-border/50 p-2 text-xs hover:bg-muted/60 transition-colors"
                  >
                    <p className="font-medium text-foreground truncate">
                      {a.patient.firstName} {a.patient.lastName}
                    </p>
                    <p className="text-muted-foreground mt-0.5">
                      {new Date(a.startTime).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="mt-1.5">
                      <select
                        value={a.status}
                        onChange={(e) =>
                          onStatusChange(a.id, e.target.value as AppointmentStatus)
                        }
                        className="w-full text-[10px] rounded border border-border/50 bg-background px-1 py-0.5 text-foreground focus:outline-none cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── MonthView ─────────────────────────────────────────────────── */

function MonthView({
  periodStart,
  appointments,
  onStatusChange,
}: {
  periodStart: Date;
  appointments: Appointment[];
  onStatusChange: (id: string, s: AppointmentStatus) => void;
}) {
  const today = new Date();

  /* Build calendar grid: always start from Monday of the week containing the 1st */
  const ms = startOfMonth(periodStart);
  const gridStart = startOfWeek(ms);

  /* Determine number of weeks needed (4, 5 or 6) */
  const lastDayOfMonth = new Date(ms.getFullYear(), ms.getMonth() + 1, 0);
  const gridEnd = addDays(startOfWeek(lastDayOfMonth), 6);
  const totalDays = Math.round((gridEnd.getTime() - gridStart.getTime()) / 86400000) + 1;
  const gridDays = Array.from({ length: totalDays }, (_, i) => addDays(gridStart, i));

  return (
    <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden">
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEK_DAYS_SHORT.map((d) => (
          <div
            key={d}
            className="px-2 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 divide-x divide-y divide-border/50">
        {gridDays.map((day, i) => {
          const dayApps = appointments.filter((a) => isSameDay(new Date(a.startTime), day));
          const isToday = isSameDay(day, today);
          const isCurrentMonth = isSameMonth(day, periodStart);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 transition-colors',
                isToday && 'bg-primary/5',
                !isCurrentMonth && 'bg-muted/20',
              )}
              style={{ animationDelay: `${i * 0.01}s` }}
            >
              {/* Day number */}
              <span
                className={cn(
                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold mb-1',
                  isToday
                    ? 'bg-primary text-white'
                    : isCurrentMonth
                      ? 'text-foreground'
                      : 'text-muted-foreground/40',
                )}
              >
                {day.getDate()}
              </span>

              {/* Appointments */}
              <div className="space-y-0.5">
                {dayApps.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="group relative rounded px-1.5 py-0.5 text-[10px] leading-tight bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors cursor-default"
                    title={`${a.patient.firstName} ${a.patient.lastName} – ${new Date(a.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`}
                  >
                    <p className="font-medium text-primary truncate">
                      {new Date(a.startTime).toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      {a.patient.firstName} {a.patient.lastName[0]}.
                    </p>
                    {/* Quick status change on hover */}
                    <div className="absolute left-0 top-full z-10 mt-1 w-36 hidden group-hover:block bg-card border border-border rounded-lg shadow-lg p-1.5">
                      <p className="text-[10px] text-muted-foreground px-1 mb-1 truncate">
                        {a.patient.firstName} {a.patient.lastName}
                      </p>
                      <select
                        value={a.status}
                        onChange={(e) =>
                          onStatusChange(a.id, e.target.value as AppointmentStatus)
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-[10px] rounded border border-border bg-muted/50 px-1.5 py-1 text-foreground focus:outline-none cursor-pointer"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {dayApps.length > 3 && (
                  <p className="text-[10px] text-muted-foreground px-1">
                    +{dayApps.length - 3} daha
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t border-border/50 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{appointments.length}</span> randevu bu
        ay
      </div>
    </div>
  );
}
