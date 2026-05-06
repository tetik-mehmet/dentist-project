'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Banknote } from 'lucide-react';
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
import { addPayment, Payment } from '@/lib/payments';

const schema = z.object({
  amount: z.number().min(0.01, 'Tutar 0\'dan büyük olmalı'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  paymentId: string;
  remaining: number;
  onUpdated: (payment: Payment) => void;
}

export function AddPaymentDialog({ paymentId, remaining, onUpdated }: Props) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const updated = await addPayment(paymentId, data.amount, data.notes);
      onUpdated(updated);
      reset();
      setOpen(false);
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Ödeme eklenemedi.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="gap-1.5">
            <Banknote size={14} />
            Ödeme Al
          </Button>
        }
      />

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Ödeme Al</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
            Kalan borç: <strong>{remaining.toLocaleString('tr-TR')} ₺</strong>
          </div>

          <div className="space-y-1.5">
            <Label>Alınan Tutar (₺) *</Label>
            <Input
              type="number"
              min={0.01}
              max={remaining}
              step={0.01}
              placeholder="0.00"
              {...register('amount', { valueAsNumber: true })}
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-xs text-red-500">{errors.amount.message}</p>
            )}
          </div>

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
              {isSubmitting ? 'Kaydediliyor...' : 'Onayla'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
