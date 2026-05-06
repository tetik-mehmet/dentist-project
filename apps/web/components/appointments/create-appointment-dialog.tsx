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
import { createAppointment, Appointment } from '@/lib/appointments';
import { getPatients, Patient } from '@/lib/patients';
import api from '@/lib/api';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
}

const schema = z
  .object({
    patientId: z.string().min(1, 'Hasta seçin'),
    doctorId: z.string().min(1, 'Doktor seçin'),
    startTime: z.string().min(1, 'Başlangıç zamanı girin'),
    endTime: z.string().min(1, 'Bitiş zamanı girin'),
    notes: z.string().optional(),
  })
  .refine((d) => new Date(d.endTime) > new Date(d.startTime), {
    message: 'Bitiş zamanı başlangıçtan sonra olmalıdır',
    path: ['endTime'],
  });

type FormData = z.infer<typeof schema>;

interface Props {
  onCreated: (appointment: Appointment) => void;
  defaultDate?: string; // YYYY-MM-DD
}

export function CreateAppointmentDialog({ onCreated, defaultDate }: Props) {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!open) return;
    getPatients().then(setPatients).catch(() => {});
    api
      .get<Doctor[]>('/api/users')
      .then((r) => setDoctors(r.data))
      .catch(() => {});
  }, [open]);

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const appointment = await createAppointment({
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
      });
      onCreated(appointment);
      reset();
      setOpen(false);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 'Randevu oluşturulamadı.',
      );
    }
  };

  const today = defaultDate || new Date().toISOString().slice(0, 10);
  const defaultStart = `${today}T09:00`;
  const defaultEnd = `${today}T09:30`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button className="gap-2">
            <Plus size={16} />
            Yeni Randevu
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Ekle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Hasta */}
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

          {/* Doktor */}
          <div className="space-y-1.5">
            <Label>Doktor *</Label>
            <select
              {...register('doctorId')}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">Doktor seçin...</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.firstName} {d.lastName}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className="text-xs text-red-500">{errors.doctorId.message}</p>
            )}
          </div>

          {/* Başlangıç */}
          <div className="space-y-1.5">
            <Label>Başlangıç *</Label>
            <Input
              type="datetime-local"
              defaultValue={defaultStart}
              {...register('startTime')}
              className={errors.startTime ? 'border-red-500' : ''}
            />
            {errors.startTime && (
              <p className="text-xs text-red-500">{errors.startTime.message}</p>
            )}
          </div>

          {/* Bitiş */}
          <div className="space-y-1.5">
            <Label>Bitiş *</Label>
            <Input
              type="datetime-local"
              defaultValue={defaultEnd}
              {...register('endTime')}
              className={errors.endTime ? 'border-red-500' : ''}
            />
            {errors.endTime && (
              <p className="text-xs text-red-500">{errors.endTime.message}</p>
            )}
          </div>

          {/* Notlar */}
          <div className="space-y-1.5">
            <Label>Notlar</Label>
            <Input placeholder="Ek bilgiler..." {...register('notes')} />
          </div>

          {serverError && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded px-3 py-2">
              {serverError}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
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
