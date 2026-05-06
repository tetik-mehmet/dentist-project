'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
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
import { changePassword } from '@/lib/users';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifreyi girin'),
    newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır'),
    confirmPassword: z.string().min(1, 'Şifreyi tekrar girin'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await changePassword(data.currentPassword, data.newPassword);
      toast.success('Şifreniz başarıyla değiştirildi');
      reset();
      setOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Şifre değiştirilemedi.');
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) reset();
  };

  const PasswordField = ({
    label,
    name,
    show,
    onToggle,
  }: {
    label: string;
    name: keyof FormData;
    show: boolean;
    onToggle: () => void;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label} *</Label>
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          {...register(name)}
          className={errors[name] ? 'border-destructive pr-10' : 'pr-10'}
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {errors[name] && <p className="text-xs text-destructive animate-slide-up">{errors[name]?.message}</p>}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={
        <Button variant="outline" className="gap-2 shrink-0">
          <KeyRound size={15} />Şifre Değiştir
        </Button>
      } />
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle>Şifre Değiştir</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <PasswordField label="Mevcut Şifre" name="currentPassword" show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
          <PasswordField label="Yeni Şifre" name="newPassword" show={showNew} onToggle={() => setShowNew(v => !v)} />
          <PasswordField label="Yeni Şifre (Tekrar)" name="confirmPassword" show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>İptal</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
