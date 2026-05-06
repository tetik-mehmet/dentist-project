'use client';

import { useEffect, useState } from 'react';
import {
  Users,
  Stethoscope,
  UserCog,
  Trash2,
  BadgeCheck,
  BadgeX,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { getStaff, deactivateStaff, StaffMember } from '@/lib/users';
import { getMe } from '@/lib/auth';
import { AuthUser } from '@/types/auth';
import { AddStaffDialog } from '@/components/settings/add-staff-dialog';
import { ChangePasswordDialog } from '@/components/settings/change-password-dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Tab = 'doctors' | 'assistants';

export default function SettingsPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('doctors');
  const [confirmTarget, setConfirmTarget] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const me = await getMe();
        setCurrentUser(me);
        if (me?.role === 'admin') {
          const data = await getStaff();
          setStaff(data);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreated = (member: StaffMember) => {
    setStaff((prev) => [member, ...prev]);
    toast.success(`${member.role === 'doctor' ? 'Doktor' : 'Asistan'} başarıyla eklendi`);
  };

  const handleDeactivate = async () => {
    if (!confirmTarget) return;
    try {
      await deactivateStaff(confirmTarget);
      setStaff((prev) =>
        prev.map((m) => (m.id === confirmTarget ? { ...m, isActive: false } : m)),
      );
      toast.success('Personel pasife alındı');
    } catch {
      toast.error('İşlem gerçekleştirilemedi');
    }
  };

  const doctors = staff.filter((m) => m.role === 'doctor');
  const assistants = staff.filter((m) => m.role === 'assistant');
  const current = tab === 'doctors' ? doctors : assistants;
  const currentRole = tab === 'doctors' ? 'doctor' : 'assistant';

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Ayarlar" isAdmin={isAdmin} />

      <div className="p-4 sm:p-6 space-y-5">
        {/* Hesap Güvenliği — Herkes */}
        <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
            <KeyRound size={15} className="text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Hesap Güvenliği</h2>
          </div>
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Şifre Değiştir</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Hesabınızın güvenliği için şifrenizi düzenli olarak güncelleyin.
              </p>
            </div>
            <ChangePasswordDialog />
          </div>
        </div>

        {/* Personel Yönetimi — Sadece Admin */}
        {loading ? (
          <div className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="h-4 skeleton rounded w-32 mx-auto" />
          </div>
        ) : isAdmin ? (
          <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden" style={{ animationDelay: '0.1s' }}>
            <div className="px-5 py-4 border-b border-border flex items-center gap-2.5">
              <ShieldCheck size={15} className="text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Personel Yönetimi</h2>
              <div className="ml-auto">
                <AddStaffDialog role={currentRole} onCreated={handleCreated} />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border bg-muted/20">
              {([
                { key: 'doctors' as Tab, label: 'Doktorlar', icon: Stethoscope, count: doctors.length },
                { key: 'assistants' as Tab, label: 'Asistanlar', icon: UserCog, count: assistants.length },
              ]).map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all duration-200 border-b-2 -mb-px',
                    tab === key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Icon size={15} />
                  {label}
                  <span className={cn(
                    'ml-1 text-xs rounded-full px-2 py-0.5 font-semibold',
                    tab === key
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted text-muted-foreground',
                  )}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Personel listesi */}
            {current.length === 0 ? (
              <div className="p-10 text-center">
                <Users size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">
                  Henüz {tab === 'doctors' ? 'doktor' : 'asistan'} eklenmemiş.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {current.map((member, i) => (
                  <div
                    key={member.id}
                    className="stagger-item animate-slide-up flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-all duration-150 group"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn(
                        'w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border transition-colors',
                        member.isActive
                          ? 'bg-primary/15 text-primary border-primary/20 group-hover:bg-primary/20'
                          : 'bg-muted text-muted-foreground border-border',
                      )}>
                        {member.firstName[0]}{member.lastName[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {member.role === 'doctor' && 'Dr. '}
                          {member.firstName} {member.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 ml-4 shrink-0">
                      {member.isActive ? (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-1">
                          <BadgeCheck size={11} /> Aktif
                        </span>
                      ) : (
                        <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border rounded-full px-2.5 py-1">
                          <BadgeX size={11} /> Pasif
                        </span>
                      )}
                      {member.isActive && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setConfirmTarget(member.id)}
                          className="text-red-400 border-red-500/20 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                        >
                          <Trash2 size={13} />
                          <span className="hidden sm:inline ml-1.5">Pasife Al</span>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmTarget}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title="Personeli Pasife Al"
        description="Bu personel sisteme giriş yapamayacak. Bu işlemi geri almak için tekrar aktif edebilirsiniz."
        confirmLabel="Pasife Al"
        onConfirm={handleDeactivate}
      />
    </div>
  );
}

function Header({ title, isAdmin }: { title: string; isAdmin: boolean | undefined }) {
  return (
    <div className="bg-card border-b border-border px-4 sm:px-6 py-4">
      <div>
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {isAdmin ? 'Klinik personelini ve hesap ayarlarını yönetin' : 'Hesap ayarlarınızı yönetin'}
        </p>
      </div>
    </div>
  );
}
