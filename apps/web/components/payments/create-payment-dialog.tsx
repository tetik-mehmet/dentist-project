'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { createPayment, Payment } from '@/lib/payments';
import { getTreatments } from '@/lib/treatments';

const schema = z.object({
  totalAmount: z.number().min(1, 'Tutar 0\'dan büyük olmalı'),
  paidAmount: z.number().min(0).optional(),
  treatmentId: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  patientId: string;
  onCreated: (payment: Payment) => void;
}

export function CreatePaymentDialog({ patientId, onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [treatments, setTreatments] = useState<{ id: string; title: string }[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    getTreatments(patientId)
      .then((ts) => setTreatments(ts.map((t) => ({ id: t.id, title: t.title }))))
      .catch(() => {});
  }, [open, patientId]);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const payment = await createPayment({
        ...data,
        patientId,
        treatmentId: data.treatmentId || undefined,
      });
      onCreated(payment);
      reset();
      setOpen(false);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Ödeme kaydedilemedi.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" className="gap-1.5">
            <Plus size={14} />
            Ödeme Ekle
          </Button>
        }
      />

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Yeni Ödeme Kaydı</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Tedavi bağlantısı */}
          {treatments.length > 0 && (
            <div className="space-y-1.5">
              <Label>Tedavi (opsiyonel)</Label>
              <select
                {...register('treatmentId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Tedaviye bağlama</option>
                {treatments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Toplam tutar */}
          <div className="space-y-1.5">
            <Label>Toplam Tutar (₺) *</Label>
            <Input
              type="number"
              min={1}
              step={0.01}
              placeholder="0.00"
              {...register('totalAmount', { valueAsNumber: true })}
              className={errors.totalAmount ? 'border-red-500' : ''}
            />
            {errors.totalAmount && (
              <p className="text-xs text-red-500">{errors.totalAmount.message}</p>
            )}
          </div>

          {/* Peşin ödeme */}
          <div className="space-y-1.5">
            <Label>Peşin Ödeme (₺)</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              placeholder="0.00"
              {...register('paidAmount', { valueAsNumber: true })}
            />
            <p className="text-xs text-gray-400">Boş bırakırsanız tamamı beklemede olur</p>
          </div>

          {/* Notlar */}
          <div className="space-y-1.5">
            <Label>Notlar</Label>
            <Input placeholder="Ödeme notu..." {...register('notes')} />
          </div>

          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
