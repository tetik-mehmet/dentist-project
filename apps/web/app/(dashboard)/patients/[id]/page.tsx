'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Circle,
  MinusCircle,
  Plus,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { getPatient, PatientDetails } from '@/lib/patients';
import { AppointmentStatusBadge } from '@/components/appointments/appointment-status-badge';
import { TreatmentStatusBadge } from '@/components/treatments/treatment-status-badge';
import { CreateTreatmentDialog } from '@/components/treatments/create-treatment-dialog';
import { updateStep, StepStatus, Treatment } from '@/lib/treatments';
import { CreatePaymentDialog } from '@/components/payments/create-payment-dialog';
import { AddPaymentDialog } from '@/components/payments/add-payment-dialog';
import { Payment } from '@/lib/payments';
import { FileUploader } from '@/components/files/file-uploader';
import { PatientFile, isImage, isPdf, formatBytes, deleteFile } from '@/lib/files';
import { Trash2 } from 'lucide-react';

const paymentStatusMap: Record<string, { label: string; className: string }> = {
  pending: {
    label: 'Beklemede',
    className:
      'bg-muted text-muted-foreground border-border',
  },
  partial: {
    label: 'Kısmi',
    className:
      'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  },
  paid: {
    label: 'Ödendi',
    className:
      'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  },
};

const stepIcons = {
  completed: <CheckCircle2 size={15} className="text-green-500 shrink-0" />,
  skipped: <MinusCircle size={15} className="text-muted-foreground shrink-0" />,
  pending: <Circle size={15} className="text-muted-foreground/40 shrink-0" />,
};

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () =>
    getPatient(id)
      .then(setPatient)
      .catch(() => router.push('/patients'))
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleStepToggle = async (
    treatmentId: string,
    stepId: string,
    current: StepStatus,
  ) => {
    const next: StepStatus = current === 'completed' ? 'pending' : 'completed';
    try {
      await updateStep(stepId, { status: next });
      // Lokal güncelleme
      setPatient((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          treatments: prev.treatments.map((t: any) =>
            t.id === treatmentId
              ? {
                  ...t,
                  steps: t.steps.map((s: any) =>
                    s.id === stepId ? { ...s, status: next } : s,
                  ),
                }
              : t,
          ),
        };
      });
    } catch {}
  };

  const handleTreatmentCreated = (treatment: Treatment) => {
    setPatient((prev) =>
      prev ? { ...prev, treatments: [treatment, ...prev.treatments] } : prev,
    );
  };

  const handlePaymentCreated = (payment: Payment) => {
    setPatient((prev) =>
      prev ? { ...prev, payments: [payment, ...prev.payments] } : prev,
    );
  };

  const handlePaymentUpdated = (updated: Payment) => {
    setPatient((prev) =>
      prev
        ? {
            ...prev,
            payments: prev.payments.map((p: any) =>
              p.id === updated.id ? updated : p,
            ),
          }
        : prev,
    );
  };

  const handleFileUploaded = (file: PatientFile) => {
    setPatient((prev) =>
      prev ? { ...prev, files: [file, ...prev.files] } : prev,
    );
  };

  const handleFileDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setPatient((prev) =>
        prev
          ? { ...prev, files: prev.files.filter((f: any) => f.id !== fileId) }
          : prev,
      );
    } catch {}
  };

  if (loading) {
    return (
      <>
        <Header title="Hasta Detayı" />
        <main className="flex-1 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-xl" />
            <div className="h-64 bg-muted rounded-xl" />
          </div>
        </main>
      </>
    );
  }

  if (!patient) return null;

  const fullName = `${patient.firstName} ${patient.lastName}`;
  const initials = `${patient.firstName[0]}${patient.lastName[0]}`;

  return (
    <>
      <Header title={fullName} />
      <main className="flex-1 p-6 space-y-5">
        {/* Geri butonu + kart */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="mb-4 gap-2 text-muted-foreground -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft size={16} />
            Hastalara Dön
          </Button>

          <div className="bg-card rounded-xl border border-border p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-14 h-14 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xl font-bold shrink-0 border border-primary/20">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-semibold text-foreground">{fullName}</h2>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-1.5 text-sm text-muted-foreground">
                {patient.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} /> {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} /> {patient.email}
                  </span>
                )}
                {patient.dateOfBirth && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} />
                    {new Date(patient.dateOfBirth).toLocaleDateString('tr-TR')}
                  </span>
                )}
                {patient.address && (
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} /> {patient.address}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sekmeler */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-muted/50 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="treatments">
              Tedaviler
              {patient.treatments.length > 0 && (
                <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                  {patient.treatments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="appointments">
              Randevular
              {patient.appointments.length > 0 && (
                <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                  {patient.appointments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments">
              Ödemeler
              {patient.payments.length > 0 && (
                <span className="ml-1.5 text-xs bg-primary text-primary-foreground rounded-full px-1.5">
                  {patient.payments.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="files">Dosyalar</TabsTrigger>
          </TabsList>

          {/* ─── Genel Bakış ─────────────────────────────────────────── */}
          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Toplam Randevu', value: patient.appointments.length },
                {
                  label: 'Aktif Tedavi',
                  value: patient.treatments.filter(
                    (t: any) => t.status === 'in_progress',
                  ).length,
                },
                {
                  label: 'Toplam Borç',
                  value:
                    patient.payments
                      .reduce(
                        (s: number, p: any) =>
                          s + (Number(p.totalAmount) - Number(p.paidAmount)),
                        0,
                      )
                      .toLocaleString('tr-TR') + ' ₺',
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>

            {patient.notes && (
              <div className="bg-card rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground mb-1.5">Notlar</p>
                <p className="text-sm text-muted-foreground">{patient.notes}</p>
              </div>
            )}
          </TabsContent>

          {/* ─── Tedaviler ───────────────────────────────────────────── */}
          <TabsContent value="treatments" className="mt-4">
            <div className="flex justify-end mb-3">
              <CreateTreatmentDialog
                onCreated={handleTreatmentCreated}
                defaultPatientId={patient.id}
              />
            </div>

            {patient.treatments.length === 0 ? (
              <EmptyState text="Henüz tedavi kaydı yok" />
            ) : (
              <div className="space-y-4">
                {patient.treatments.map((t: any) => {
                  const doneSteps = t.steps.filter(
                    (s: any) => s.status === 'completed' || s.status === 'skipped',
                  ).length;
                  const progress =
                    t.steps.length > 0
                      ? Math.round((doneSteps / t.steps.length) * 100)
                      : 0;

                  return (
                    <div
                      key={t.id}
                      className="bg-card rounded-xl border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-2 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{t.title}</p>
                            <TreatmentStatusBadge status={t.status} />
                          </div>
                          {t.description && (
                            <p className="text-sm text-muted-foreground mt-0.5">{t.description}</p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-foreground/80 shrink-0">
                          {Number(t.totalCost).toLocaleString('tr-TR')} ₺
                        </p>
                      </div>

                      {t.steps.length > 0 && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">
                              {doneSteps}/{t.steps.length} adım
                            </span>
                            <span className="text-xs font-medium text-muted-foreground">
                              %{progress}
                            </span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-3">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <div className="space-y-2">
                            {t.steps.map((step: any) => (
                              <div
                                key={step.id}
                                className="flex items-center gap-2 text-sm cursor-pointer group"
                                onClick={() =>
                                  handleStepToggle(t.id, step.id, step.status)
                                }
                              >
                                <span className="group-hover:scale-110 transition-transform">
                                  {stepIcons[step.status as StepStatus]}
                                </span>
                                <span
                                  className={`flex-1 ${
                                    step.status === 'completed'
                                      ? 'line-through text-muted-foreground/50'
                                      : step.status === 'skipped'
                                      ? 'line-through text-muted-foreground/30'
                                      : 'text-foreground'
                                  }`}
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
          </TabsContent>

          {/* ─── Randevular ──────────────────────────────────────────── */}
          <TabsContent value="appointments" className="mt-4">
            {patient.appointments.length === 0 ? (
              <EmptyState text="Henüz randevu kaydı yok" />
            ) : (
              <div className="space-y-3">
                {patient.appointments.map((a: any) => (
                  <div
                    key={a.id}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(a.startTime).toLocaleString('tr-TR', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </p>
                        {a.doctor && (
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Dr. {a.doctor.firstName} {a.doctor.lastName}
                          </p>
                        )}
                      </div>
                      <AppointmentStatusBadge status={a.status} />
                    </div>
                    {a.notes && (
                      <p className="text-sm text-muted-foreground/70 mt-1.5">{a.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ─── Ödemeler ────────────────────────────────────────────── */}
          <TabsContent value="payments" className="mt-4">
            <div className="flex justify-end mb-3">
              <CreatePaymentDialog
                patientId={patient.id}
                onCreated={handlePaymentCreated}
              />
            </div>

            {patient.payments.length === 0 ? (
              <EmptyState text="Henüz ödeme kaydı yok" />
            ) : (
              <div className="space-y-3">
                {/* Özet bar */}
                {(() => {
                  const total = patient.payments.reduce(
                    (s: number, p: any) => s + Number(p.totalAmount), 0,
                  );
                  const paid = patient.payments.reduce(
                    (s: number, p: any) => s + Number(p.paidAmount), 0,
                  );
                  const remaining = total - paid;
                  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
                  return (
                    <div className="bg-card rounded-xl border border-border p-4 mb-2">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Toplam / Ödenen / Kalan</span>
                        <span className="font-medium text-foreground/80">%{pct}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500 rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{total.toLocaleString('tr-TR')} ₺</span>
                        <span className="text-green-500">{paid.toLocaleString('tr-TR')} ₺</span>
                        <span className="text-red-400">{remaining.toLocaleString('tr-TR')} ₺</span>
                      </div>
                    </div>
                  );
                })()}

                {patient.payments.map((p: any) => {
                  const s = paymentStatusMap[p.status];
                  const remaining = Number(p.totalAmount) - Number(p.paidAmount);
                  return (
                    <div
                      key={p.id}
                      className="bg-card rounded-xl border border-border p-4"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-foreground">
                              {Number(p.totalAmount).toLocaleString('tr-TR')} ₺
                            </p>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${s?.className}`}
                            >
                              {s?.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">
                            Ödenen: {Number(p.paidAmount).toLocaleString('tr-TR')} ₺
                            {remaining > 0 && (
                              <span className="text-red-400 ml-2">
                                Kalan: {remaining.toLocaleString('tr-TR')} ₺
                              </span>
                            )}
                          </p>
                          {p.treatment && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5">
                              Tedavi: {p.treatment.title}
                            </p>
                          )}
                          {p.notes && (
                            <p className="text-xs text-muted-foreground/70 mt-0.5">{p.notes}</p>
                          )}
                        </div>
                        {p.status !== 'paid' && (
                          <AddPaymentDialog
                            paymentId={p.id}
                            remaining={remaining}
                            onUpdated={handlePaymentUpdated}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ─── Dosyalar ────────────────────────────────────────────── */}
          <TabsContent value="files" className="mt-4 space-y-4">
            <FileUploader patientId={patient.id} onUploaded={handleFileUploaded} />

            {patient.files.length === 0 ? (
              <EmptyState text="Henüz dosya yüklenmemiş" />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {patient.files.map((f: any) => (
                  <div
                    key={f.id}
                    className="bg-card rounded-xl border border-border overflow-hidden"
                  >
                    {isImage(f.mimeType) ? (
                      <a href={f.url} target="_blank" rel="noopener noreferrer">
                        <img
                          src={f.url}
                          alt={f.originalName}
                          className="w-full h-36 object-cover hover:opacity-90 transition-opacity"
                        />
                      </a>
                    ) : (
                      <div className="w-full h-36 bg-muted/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-lg bg-red-500/15 flex items-center justify-center mx-auto mb-2">
                            <span className="text-red-500 text-xs font-bold">PDF</span>
                          </div>
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            Görüntüle
                          </a>
                        </div>
                      </div>
                    )}
                    <div className="px-3 py-2.5 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {f.originalName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatBytes(f.size)} ·{' '}
                          {new Date(f.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleFileDelete(f.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-16 text-muted-foreground">
      <p className="text-sm">{text}</p>
    </div>
  );
}
