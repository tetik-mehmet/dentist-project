import { TreatmentStatus } from '@/lib/treatments';

const statusMap: Record<TreatmentStatus, { label: string; className: string }> = {
  planned: { label: 'Planlandı', className: 'bg-muted text-muted-foreground border-border' },
  in_progress: { label: 'Devam Ediyor', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  completed: { label: 'Tamamlandı', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  cancelled: { label: 'İptal', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export function TreatmentStatusBadge({ status }: { status: TreatmentStatus }) {
  const s = statusMap[status] ?? statusMap.planned;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${s.className}`}>
      {s.label}
    </span>
  );
}
