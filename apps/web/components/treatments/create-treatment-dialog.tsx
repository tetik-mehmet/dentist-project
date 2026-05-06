'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
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
import { createTreatment, Treatment } from '@/lib/treatments';
import { getPatients, Patient } from '@/lib/patients';

const stepSchema = z.object({
  title: z.string().min(2, 'En az 2 karakter'),
  description: z.string().optional(),
  order: z.number().min(0),
  cost: z.number().min(0).optional(),
});

const schema = z.object({
  title: z.string().min(2, 'En az 2 karakter'),
  description: z.string().optional(),
  patientId: z.string().min(1, 'Hasta seçin'),
  totalCost: z.number().min(0).optional(),
  steps: z.array(stepSchema).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  onCreated: (treatment: Treatment) => void;
  defaultPatientId?: string;
}

export function CreateTreatmentDialog({ onCreated, defaultPatientId }: Props) {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      patientId: defaultPatientId || '',
      steps: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'steps' });

  useEffect(() => {
    if (!open) return;
    getPatients().then(setPatients).catch(() => {});
  }, [open]);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const treatment = await createTreatment(data);
      onCreated(treatment);
      reset();
      setOpen(false);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 'Tedavi oluşturulamadı.',
      );
    }
  };

  const addStep = () =>
    append({ title: '', description: '', order: fields.length, cost: 0 });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus size={16} />
            Yeni Tedavi
          </Button>
        }
      />

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Tedavi Planı</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-2">
          {/* Hasta */}
          {!defaultPatientId && (
            <div className="space-y-1.5">
              <Label>Hasta *</Label>
              <select
                {...register('patientId')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Hasta seçin...</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} — {p.phone}
                  </option>
                ))}
              </select>
              {errors.patientId && (
                <p className="text-xs text-red-500">{errors.patientId.message}</p>
              )}
            </div>
          )}

          {/* Başlık */}
          <div className="space-y-1.5">
            <Label>Tedavi Başlığı *</Label>
            <Input
              placeholder="örn: Kanal Tedavisi"
              {...register('title')}
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="text-xs text-red-500">{errors.title.message}</p>
            )}
          </div>

          {/* Açıklama */}
          <div className="space-y-1.5">
            <Label>Açıklama</Label>
            <Input placeholder="Tedavi hakkında notlar..." {...register('description')} />
          </div>

          {/* Toplam Maliyet */}
          <div className="space-y-1.5">
            <Label>Toplam Maliyet (₺)</Label>
            <Input
              type="number"
              min={0}
              placeholder="0"
              {...register('totalCost', { valueAsNumber: true })}
            />
          </div>

          {/* Adımlar */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Tedavi Adımları</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addStep}
                className="gap-1 text-xs"
              >
                <Plus size={13} />
                Adım Ekle
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-4 border border-dashed rounded-lg">
                Henüz adım eklenmedi
              </p>
            )}

            <div className="space-y-3">
              {fields.map((field, i) => (
                <div
                  key={field.id}
                  className="border border-gray-200 rounded-lg p-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Adım {i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <Input
                    placeholder="Adım başlığı *"
                    {...register(`steps.${i}.title`)}
                  />
                  <Input
                    placeholder="Açıklama (opsiyonel)"
                    {...register(`steps.${i}.description`)}
                  />
                  <Input
                    type="number"
                    min={0}
                    placeholder="Maliyet (₺)"
                    {...register(`steps.${i}.cost`, { valueAsNumber: true })}
                  />
                  <input
                    type="hidden"
                    value={i}
                    {...register(`steps.${i}.order`, { valueAsNumber: true })}
                  />
                </div>
              ))}
            </div>
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
