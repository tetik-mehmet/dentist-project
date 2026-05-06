'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  ChevronDown,
  RefreshCw,
  UserPlus,
  UserCog,
  UserMinus,
  CalendarPlus,
  CalendarCog,
  CalendarX,
  Stethoscope,
  CreditCard,
  FileUp,
  Trash2,
  PenLine,
  Calendar,
  X,
} from 'lucide-react';
import { Header } from '@/components/layout/header';
import { getMe } from '@/lib/auth';
import { getAuditLogs } from '@/lib/audit';
import { AuditLogEntry } from '@/lib/dashboard';

/* ─────────────────────────────────────────────
   Sabit etiketler
───────────────────────────────────────────── */

const ENTITY_LABELS: Record<string, string> = {
  Patient: 'Hasta',
  Appointment: 'Randevu',
  Treatment: 'Tedavi',
  Payment: 'Ödeme',
  File: 'Dosya',
  User: 'Kullanıcı',
};

/** Log kaydına göre eylem cümlesi üretir */
function getActionLabel(log: AuditLogEntry): string {
  const { entityType, action, newData } = log;

  // Şifre değişikliği: PATCH /api/users/me/password → newData = { message: '...' }
  if (entityType === 'User' && action === 'UPDATE') {
    if (newData?.message && String(newData.message).toLowerCase().includes('şifre')) {
      return 'kendi şifresini değiştirdi';
    }
    return 'kullanıcı bilgilerini güncelledi';
  }

  // Tedavi adımı güncellemesi: newData'da treatmentId varsa bu bir step'tir
  if (entityType === 'Treatment' && action === 'UPDATE' && newData?.treatmentId !== undefined) {
    return 'tedavi adımını güncelledi';
  }

  const map: Record<string, Record<string, string>> = {
    Patient:     { CREATE: 'yeni hasta ekledi',    UPDATE: 'hasta bilgilerini güncelledi', DELETE: 'hastayı sildi' },
    Appointment: { CREATE: 'randevu oluşturdu',    UPDATE: 'randevuyu güncelledi',         DELETE: 'randevuyu iptal etti' },
    Treatment:   { CREATE: 'yeni tedavi planladı', UPDATE: 'tedaviyi güncelledi',          DELETE: 'tedaviyi sildi' },
    Payment:     { CREATE: 'tahsilat ekledi',      UPDATE: 'ödeme güncelledi',             DELETE: 'ödemeyi sildi' },
    File:        { CREATE: 'dosya yükledi',        UPDATE: 'dosyayı güncelledi',           DELETE: 'dosyayı sildi' },
    User:        { CREATE: 'yeni kullanıcı oluşturdu',                                     DELETE: 'kullanıcıyı sildi' },
  };
  return map[entityType]?.[action] ?? `${entityType} ${action.toLowerCase()}`;
}

/** entity+action için ikon bileşeni */
function ActionIcon({ entityType, action }: { entityType: string; action: string }) {
  const cls = 'shrink-0';
  const sz = 14;
  if (entityType === 'Patient') {
    if (action === 'CREATE') return <UserPlus size={sz} className={cls} />;
    if (action === 'DELETE') return <UserMinus size={sz} className={cls} />;
    return <UserCog size={sz} className={cls} />;
  }
  if (entityType === 'Appointment') {
    if (action === 'CREATE') return <CalendarPlus size={sz} className={cls} />;
    if (action === 'DELETE') return <CalendarX size={sz} className={cls} />;
    return <CalendarCog size={sz} className={cls} />;
  }
  if (entityType === 'Treatment') return <Stethoscope size={sz} className={cls} />;
  if (entityType === 'Payment')   return <CreditCard size={sz} className={cls} />;
  if (entityType === 'File') {
    if (action === 'DELETE') return <Trash2 size={sz} className={cls} />;
    return <FileUp size={sz} className={cls} />;
  }
  if (entityType === 'User') {
    if (action === 'CREATE') return <UserPlus size={sz} className={cls} />;
    if (action === 'DELETE') return <UserMinus size={sz} className={cls} />;
    return <UserCog size={sz} className={cls} />;
  }
  return <PenLine size={sz} className={cls} />;
}

const ACTION_ICON_COLOR: Record<string, string> = {
  CREATE: 'text-emerald-400',
  UPDATE: 'text-blue-400',
  DELETE: 'text-red-400',
};

const ACTION_BADGE: Record<string, string> = {
  CREATE: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  UPDATE: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  DELETE: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const ACTION_DOT: Record<string, string> = {
  CREATE: 'bg-emerald-500',
  UPDATE: 'bg-blue-500',
  DELETE: 'bg-red-500',
};

/* ─────────────────────────────────────────────
   Bağlamsal detay satırları
───────────────────────────────────────────── */

interface LogDetail {
  primary: string;      // Asıl isim / konu
  secondary?: string;   // Tarih/saat, tutar vb.
  tertiary?: string;    // Ek bilgi (telefon, durum vb.)
}

function fmt(amount: unknown): string {
  return `${Number(amount).toLocaleString('tr-TR')} ₺`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString('tr-TR', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  });
}

function getLogDetail(log: AuditLogEntry): LogDetail | null {
  const d = log.newData;

  /* ── Hasta ── */
  if (log.entityType === 'Patient') {
    if (!d?.firstName) return null;
    const primary = `${d.firstName} ${d.lastName}`;
    const parts: string[] = [];
    if (d.phone) parts.push(d.phone);
    if (d.email) parts.push(d.email);
    return { primary, secondary: parts.join(' · ') || undefined };
  }

  /* ── Randevu ── */
  if (log.entityType === 'Appointment') {
    const patientName = d?.patient
      ? `${d.patient.firstName} ${d.patient.lastName}`
      : null;
    const appointmentTime = d?.startTime ? fmtDate(d.startTime) : null;
    const endTime = d?.endTime
      ? new Date(d.endTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
      : null;
    const timeRange = appointmentTime && endTime
      ? `${appointmentTime} – ${endTime}`
      : appointmentTime ?? null;

    const statusMap: Record<string, string> = {
      scheduled: 'Planlandı', completed: 'Tamamlandı',
      cancelled: 'İptal', no_show: 'Gelmedi',
    };
    const statusLabel = d?.status ? statusMap[d.status] : null;

    if (!patientName && !timeRange) return null;
    return {
      primary:    patientName ?? 'Bilinmeyen hasta',
      secondary:  timeRange ?? undefined,
      tertiary:   statusLabel ?? undefined,
    };
  }

  /* ── Tedavi adımı (newData.treatmentId mevcutsa bu bir step) ── */
  if (log.entityType === 'Treatment' && d?.treatmentId !== undefined) {
    if (!d?.title) return null;
    const stepStatusMap: Record<string, string> = {
      pending: 'Bekliyor', in_progress: 'Devam ediyor',
      completed: 'Tamamlandı', skipped: 'Atlandı',
    };
    const statusLabel = d.status ? stepStatusMap[d.status] : null;

    // updateStep artık treatment.patient'ı da döndürüyor
    const patient = d.treatment?.patient;
    const patientName = patient ? `${patient.firstName} ${patient.lastName}` : null;
    const treatmentTitle = d.treatment?.title ?? null;

    return {
      primary:   patientName ? `${patientName} — ${d.title}` : d.title,
      secondary: treatmentTitle ? `Tedavi: ${treatmentTitle}` : undefined,
      tertiary:  statusLabel ?? undefined,
    };
  }

  /* ── Tedavi ── */
  if (log.entityType === 'Treatment') {
    if (!d?.title) return null;
    const patientName = d.patient
      ? `${d.patient.firstName} ${d.patient.lastName}`
      : null;
    const cost = d.totalCost ? fmt(d.totalCost) : null;
    const statusMap: Record<string, string> = {
      planned: 'Planlandı', in_progress: 'Devam ediyor',
      completed: 'Tamamlandı', cancelled: 'İptal',
    };
    const statusLabel = d.status ? statusMap[d.status] : null;

    return {
      primary:   patientName ? `${patientName} — ${d.title}` : d.title,
      secondary: cost ?? undefined,
      tertiary:  statusLabel ?? undefined,
    };
  }

  /* ── Ödeme ── */
  if (log.entityType === 'Payment') {
    const patientName = d?.patient
      ? `${d.patient.firstName} ${d.patient.lastName}`
      : null;
    const treatmentTitle = d?.treatment?.title ?? null;

    const totalAmount  = d?.totalAmount  != null ? fmt(d.totalAmount)  : null;
    const paidAmount   = d?.paidAmount   != null ? fmt(d.paidAmount)   : null;

    const parts: string[] = [];
    if (totalAmount) parts.push(`Toplam: ${totalAmount}`);
    if (paidAmount)  parts.push(`Ödenen: ${paidAmount}`);

    const statusMap: Record<string, string> = {
      pending: 'Bekliyor', partial: 'Kısmi ödendi', paid: 'Tamamlandı',
    };
    const statusLabel = d?.status ? statusMap[d.status] : null;

    return {
      primary:   patientName ?? 'Bilinmeyen hasta',
      secondary: treatmentTitle
        ? `${treatmentTitle} · ${parts.join(' · ')}`
        : parts.join(' · ') || undefined,
      tertiary: statusLabel ?? undefined,
    };
  }

  /* ── Dosya ── */
  if (log.entityType === 'File') {
    if (!d?.originalName) return null;
    const size = d.size
      ? d.size >= 1_048_576
        ? `${(d.size / 1_048_576).toFixed(1)} MB`
        : `${(d.size / 1024).toFixed(0)} KB`
      : null;
    return {
      primary:   d.originalName,
      secondary: [d.mimeType, size].filter(Boolean).join(' · ') || undefined,
    };
  }

  /* ── Kullanıcı ── */
  if (log.entityType === 'User') {
    // Şifre değişikliği — extra detay gerekmez
    if (d?.message && String(d.message).toLowerCase().includes('şifre')) {
      return null;
    }
    const fullName = d?.firstName ? `${d.firstName} ${d.lastName ?? ''}`.trim() : null;
    const parts: string[] = [];
    if (d?.email) parts.push(d.email);
    if (d?.role) {
      const roleMap: Record<string, string> = { admin: 'Yönetici', dentist: 'Diş Hekimi', assistant: 'Asistan' };
      parts.push(roleMap[d.role] ?? d.role);
    }
    if (!fullName) return null;
    return {
      primary:   fullName,
      secondary: parts.join(' · ') || undefined,
    };
  }

  return null;
}

/* ─────────────────────────────────────────────
   Filtre dropdown
───────────────────────────────────────────── */

interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  label: string;
}

function FilterDropdown({ value, options, onChange, label }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const selected = options.find((o) => o.value === value)?.label ?? value;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground hover:border-primary/40 transition-colors"
      >
        <span className="text-muted-foreground">{label}:</span>
        <span className="font-medium">{selected}</span>
        <ChevronDown
          size={12}
          className={`text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1.5 z-50 min-w-[150px] bg-card border border-border rounded-xl shadow-lg overflow-hidden">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors hover:bg-muted/60 ${
                opt.value === value ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Tarih yardımcıları
───────────────────────────────────────────── */

// toISOString() UTC döndürür — UTC+3'te gece yarısı sonrası yanlış gün verir.
// getFullYear/Month/Date her zaman YEREL tarihi döndürür.
function toDateStr(d: Date): string {
  const y  = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${mo}-${day}`;
}

function todayStr(): string { return toDateStr(new Date()); }

function startOfWeek(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1)); // Pazartesi
  return toDateStr(d);
}

function startOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return toDateStr(d);
}

/* ─────────────────────────────────────────────
   Tarih aralığı filtresi
───────────────────────────────────────────── */

interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onBothChange: (from: string, to: string) => void;
  onClear: () => void;
}

function DateRangeFilter({ dateFrom, dateTo, onFromChange, onToChange, onBothChange, onClear }: DateRangeFilterProps) {
  const hasFilter = dateFrom || dateTo;

  // Hızlı butonlar için tek handler — iki ayrı çağrı yapılırsa React state
  // async olduğundan ikinci fetchLogs eski (boş) state'i okurdu.
  const setQuick = (from: string, to: string) => {
    onBothChange(from, to);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Hızlı kısayollar */}
      <div className="flex items-center gap-1">
        {[
          { label: 'Bugün',    from: todayStr(),    to: todayStr() },
          { label: 'Bu hafta', from: startOfWeek(), to: todayStr() },
          { label: 'Bu ay',    from: startOfMonth(),to: todayStr() },
        ].map(({ label, from, to }) => {
          const active = dateFrom === from && dateTo === to;
          return (
            <button
              key={label}
              onClick={() => active ? onClear() : setQuick(from, to)}
              className={`text-xs px-2.5 py-1.5 rounded-lg border transition-colors ${
                active
                  ? 'bg-primary/10 text-primary border-primary/30 font-semibold'
                  : 'bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Tarih inputları */}
      <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-1.5">
        <Calendar size={12} className="text-muted-foreground shrink-0" />
        <input
          type="date"
          value={dateFrom}
          max={dateTo || todayStr()}
          onChange={(e) => onFromChange(e.target.value)}
          className="text-xs bg-transparent text-foreground outline-none w-[110px] cursor-pointer"
          title="Başlangıç tarihi"
        />
        <span className="text-muted-foreground text-xs">–</span>
        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          max={todayStr()}
          onChange={(e) => onToChange(e.target.value)}
          className="text-xs bg-transparent text-foreground outline-none w-[110px] cursor-pointer"
          title="Bitiş tarihi"
        />
      </div>

      {/* Temizle */}
      {hasFilter && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground bg-card border border-border rounded-xl px-2.5 py-1.5 transition-colors"
          title="Tarih filtresini temizle"
        >
          <X size={11} />
          Temizle
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sayfa
───────────────────────────────────────────── */

const ENTITY_TYPES = ['Hepsi', 'Patient', 'Appointment', 'Treatment', 'Payment', 'File', 'User'];

export default function ActivitiesPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterEntity, setFilterEntity] = useState('Hepsi');
  const [filterAction, setFilterAction] = useState('Hepsi');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo]     = useState('');

  useEffect(() => {
    getMe().then((user) => {
      if (!user || user.role !== 'admin') router.replace('/dashboard');
    });
  }, [router]);

  const fetchLogs = async (silent = false, fromOverride?: string, toOverride?: string) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const from = fromOverride !== undefined ? fromOverride : dateFrom;
      const to   = toOverride   !== undefined ? toOverride   : dateTo;
      const data = await getAuditLogs({
        limit:    500,
        dateFrom: from || undefined,
        dateTo:   to   || undefined,
      });
      setLogs(data);
    } catch { /* ignore */ }
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Manuel input değişimlerinde — state'in eski değeri doğrudan parametre geçilir
  const handleDateFrom = (v: string) => {
    setDateFrom(v);
    fetchLogs(true, v, dateTo);       // dateTo: mevcut state doğru çünkü sadece from değişti
  };
  const handleDateTo = (v: string) => {
    setDateTo(v);
    fetchLogs(true, dateFrom, v);     // dateFrom: mevcut state doğru çünkü sadece to değişti
  };
  // Hızlı butonlar (Bugün / Bu hafta / Bu ay) — her iki tarih aynı anda değişir,
  // state race condition'ı önlemek için tek çağrı
  const handleBothDates = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
    fetchLogs(true, from, to);        // her iki değer de explicit — state beklenmez
  };
  const clearDates = () => {
    setDateFrom('');
    setDateTo('');
    fetchLogs(true, '', '');
  };

  const filtered = logs.filter((log) => {
    const entityMatch = filterEntity === 'Hepsi' || log.entityType === filterEntity;
    const actionMatch = filterAction === 'Hepsi' || log.action === filterAction;
    return entityMatch && actionMatch;
  });

  return (
    <>
      <Header title="Son Aktiviteler" />
      <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-auto">

        {/* Filtre + yenile */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterDropdown
            label="Tür"
            value={filterEntity}
            onChange={setFilterEntity}
            options={ENTITY_TYPES.map((t) => ({
              value: t,
              label: t === 'Hepsi' ? 'Hepsi' : ENTITY_LABELS[t] ?? t,
            }))}
          />
          <FilterDropdown
            label="İşlem"
            value={filterAction}
            onChange={setFilterAction}
            options={['Hepsi', 'CREATE', 'UPDATE', 'DELETE'].map((a) => ({
              value: a,
              label: { Hepsi: 'Hepsi', CREATE: 'Ekleme', UPDATE: 'Güncelleme', DELETE: 'Silme' }[a] ?? a,
            }))}
          />
          <button
            onClick={() => fetchLogs(true)}
            disabled={refreshing}
            className="ml-auto flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground bg-card border border-border rounded-xl px-3 py-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Yenile
          </button>
        </div>

        {/* Tarih aralığı filtresi */}
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onFromChange={handleDateFrom}
          onToChange={handleDateTo}
          onBothChange={handleBothDates}
          onClear={clearDates}
        />

        {/* Log listesi */}
        <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2.5 flex-wrap">
            <ClipboardList size={15} className="text-muted-foreground shrink-0" />
            <h2 className="font-semibold text-sm text-foreground">
              {loading ? 'Yükleniyor…' : `${filtered.length} kayıt`}
            </h2>
            {(dateFrom || dateTo) && !loading && (
              <span className="ml-1 text-xs text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
                {dateFrom && dateTo && dateFrom === dateTo
                  ? new Date(dateFrom).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
                  : [
                      dateFrom ? new Date(dateFrom).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) : '…',
                      dateTo   ? new Date(dateTo).toLocaleDateString('tr-TR',   { day: 'numeric', month: 'short', year: 'numeric' }) : '…',
                    ].join(' – ')
                }
              </span>
            )}
          </div>

          <div className="divide-y divide-border/50">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="px-5 py-4 flex gap-4">
                  <div className="h-8 w-8 skeleton rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 skeleton rounded w-3/4" />
                    <div className="h-2.5 skeleton rounded w-1/2" />
                    <div className="h-2.5 skeleton rounded w-1/4" />
                  </div>
                  <div className="h-5 w-20 skeleton rounded-full" />
                </div>
              ))
            ) : !filtered.length ? (
              <p className="text-sm text-muted-foreground text-center py-16">
                Kayıt bulunamadı
              </p>
            ) : (
              filtered.map((log, i) => {
                const detail = getLogDetail(log);
                const iconColor = ACTION_ICON_COLOR[log.action] ?? 'text-muted-foreground';
                return (
                  <div
                    key={log.id}
                    className="stagger-item animate-slide-up px-5 py-4 flex items-start gap-4 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${i * 0.02}s` }}
                  >
                    {/* İkon kutusu */}
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        log.action === 'CREATE'
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : log.action === 'UPDATE'
                          ? 'bg-blue-500/10 border border-blue-500/20'
                          : 'bg-red-500/10 border border-red-500/20'
                      } ${iconColor}`}
                    >
                      <ActionIcon entityType={log.entityType} action={log.action} />
                    </div>

                    {/* İçerik */}
                    <div className="flex-1 min-w-0">
                      {/* Kim — ne yaptı */}
                      <p className="text-sm text-foreground/80 leading-snug">
                        <span className="font-semibold text-foreground">
                          {log.user.firstName} {log.user.lastName}
                        </span>{' '}
                        {getActionLabel(log)}
                      </p>

                      {/* Birincil detay: isim / konu */}
                      {detail?.primary && (
                        <p className="text-xs font-medium text-foreground/75 mt-1 truncate">
                          {detail.primary}
                        </p>
                      )}

                      {/* İkincil detay: tutar / tarih aralığı / dosya tipi */}
                      {detail?.secondary && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {detail.secondary}
                        </p>
                      )}

                      {/* Üçüncül detay: durum etiketi */}
                      {detail?.tertiary && (
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                          {detail.tertiary}
                        </span>
                      )}

                      {/* Zaman damgası */}
                      <p className="text-[11px] text-muted-foreground/60 mt-1.5">
                        {new Date(log.createdAt).toLocaleString('tr-TR', {
                          weekday: 'short', day: 'numeric', month: 'long',
                          year: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    </div>

                    {/* Sağ badge */}
                    <span
                      className={`shrink-0 text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                        ACTION_BADGE[log.action] ?? 'bg-muted text-muted-foreground border-border'
                      }`}
                    >
                      {ENTITY_LABELS[log.entityType] ?? log.entityType}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>
    </>
  );
}
