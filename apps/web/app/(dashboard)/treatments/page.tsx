'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, MinusCircle, Stethoscope } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { CreateTreatmentDialog } from '@/components/treatments/create-treatment-dialog';
import { TreatmentStatusBadge } from '@/components/treatments/treatment-status-badge';
import {
  getTreatments,
  updateTreatmentStatus,
  updateStep,
  Treatment,
  TreatmentStatus,
  StepStatus,
} from '@/lib/treatments';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS: { value: TreatmentStatus; label: string }[] = [
  { value: 'planned', label: 'Planlandı' },
  { value: 'in_progress', label: 'Devam Ediyor' },
  { value: 'completed', label: 'Tamamlandı' },
  { value: 'cancelled', label: 'İptal' },
];

const stepIcons = {
  completed: <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />,
  skipped: <MinusCircle size={14} className="text-muted-foreground/50 shrink-0" />,
  pending: <Circle size={14} className="text-muted-foreground/30 shrink-0" />,
};

export default function TreatmentsPage() {
  const router = useRouter();
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TreatmentStatus | 'all'>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTreatments();
      setTreatments(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (t: Treatment) => setTreatments((prev) => [t, ...prev]);

  const handleStatusChange = async (id: string, status: TreatmentStatus) => {
    try {
      const updated = await updateTreatmentStatus(id, status);
      setTreatments((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {}
  };

  const handleStepToggle = async (treatmentId: string, stepId: string, currentStatus: StepStatus) => {
    const newStatus: StepStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    try {
      const updatedStep = await updateStep(stepId, { status: newStatus });
      setTreatments((prev) =>
        prev.map((t) =>
          t.id === treatmentId
            ? { ...t, steps: t.steps.map((s) => (s.id === stepId ? updatedStep : s)) }
            : t,
        ),
      );
    } catch {}
  };

  const filtered = filter === 'all' ? treatments : treatments.filter((t) => t.status === filter);

  return (
    <>
      <Header title="Tedaviler" />
      <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-auto">
        {/* Araç çubuğu */}
        <div className="animate-slide-up flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(['all', ...STATUS_OPTIONS.map((s) => s.value)] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border',
                  filter === s
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                    : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground',
                )}
              >
                {s === 'all' ? 'Tümü' : STATUS_OPTIONS.find((o) => o.value === s)?.label}
                {s !== 'all' && (
                  <span className="ml-1.5 opacity-60">
                    ({treatments.filter((t) => t.status === s).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <CreateTreatmentDialog onCreated={handleCreated} />
        </div>

        {/* İçerik */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 skeleton rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="animate-fade-in text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Stethoscope size={24} className="text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">Tedavi bulunamadı</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              {filter === 'all' ? 'Yeni tedavi planı ekleyerek başlayın' : 'Bu filtre için kayıt yok'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((t, i) => {
              const doneSteps = t.steps.filter((s) => s.status === 'completed' || s.status === 'skipped').length;
              const progress = t.steps.length > 0 ? Math.round((doneSteps / t.steps.length) * 100) : 0;

              return (
                <div
                  key={t.id}
                  className="stagger-item animate-slide-up bg-card rounded-2xl border border-border p-5 hover:border-border/80 transition-all duration-200 group"
                  style={{ animationDelay: `${i * 0.06}s` }}
                >
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => router.push(`/patients/${t.patientId}`)}
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{t.title}</h3>
                        <TreatmentStatusBadge status={t.status} />
                      </div>
                      <p className="text-sm text-primary hover:text-primary/80 transition-colors mt-0.5 cursor-pointer">
                        {t.patient.firstName} {t.patient.lastName}
                      </p>
                      {t.description && (
                        <p className="text-sm text-muted-foreground mt-1">{t.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <p className="text-sm font-bold text-foreground tabular-nums">
                        {Number(t.totalCost).toLocaleString('tr-TR')} ₺
                      </p>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value as TreatmentStatus)}
                        className="text-xs rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {t.steps.length > 0 && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          İlerleme: {doneSteps}/{t.steps.length} adım
                        </span>
                        <span className="text-xs font-semibold text-foreground tabular-nums">%{progress}</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="mt-3 space-y-1.5">
                        {t.steps.map((step) => (
                          <div
                            key={step.id}
                            className="flex items-center gap-2 text-sm cursor-pointer group/step select-none"
                            onClick={(e) => { e.stopPropagation(); handleStepToggle(t.id, step.id, step.status); }}
                          >
                            <span className="group-hover/step:scale-110 transition-transform">
                              {stepIcons[step.status]}
                            </span>
                            <span
                              className={cn(
                                step.status === 'completed'
                                  ? 'text-muted-foreground/50 line-through'
                                  : step.status === 'skipped'
                                  ? 'text-muted-foreground/30 line-through'
                                  : 'text-foreground/80',
                              )}
                            >
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}
