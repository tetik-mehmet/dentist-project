'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight, Users } from 'lucide-react';
import { Header } from '@/components/layout/header';
import { Input } from '@/components/ui/input';
import { CreatePatientDialog } from '@/components/patients/create-patient-dialog';
import { getPatients, Patient } from '@/lib/patients';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function PatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebounce(search, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPatients(debouncedSearch || undefined);
      setPatients(data);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const handleCreated = (patient: Patient) => {
    setPatients((prev) => [patient, ...prev]);
  };

  return (
    <>
      <Header title="Hastalar" />
      <main className="flex-1 p-4 sm:p-6 space-y-5 overflow-auto">
        {/* Araç çubuğu */}
        <div className="animate-slide-up flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9 bg-card border-border focus-visible:border-primary/50"
              placeholder="Ad, soyad, telefon veya e-posta ile ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CreatePatientDialog onCreated={handleCreated} />
        </div>

        {/* İçerik */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="animate-fade-in text-center py-20">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Users size={24} className="text-muted-foreground" />
            </div>
            <p className="text-base font-medium text-foreground">Hasta bulunamadı</p>
            <p className="text-sm text-muted-foreground mt-1.5">
              {search ? 'Farklı bir arama terimi deneyin' : 'Yeni hasta ekleyerek başlayın'}
            </p>
          </div>
        ) : (
          <div className="animate-slide-up bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ad Soyad</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Telefon</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:table-cell">E-posta</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Kayıt Tarihi</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {patients.map((p, i) => (
                  <tr
                    key={p.id}
                    className="stagger-item animate-slide-up hover:bg-muted/30 cursor-pointer transition-all duration-150 group"
                    style={{ animationDelay: `${0.05 + i * 0.03}s` }}
                    onClick={() => router.push(`/patients/${p.id}`)}
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                          {p.firstName[0]}{p.lastName[0]}
                        </div>
                        {p.firstName} {p.lastName}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden sm:table-cell">{p.phone}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden md:table-cell">{p.email || '—'}</td>
                    <td className="px-5 py-3.5 text-muted-foreground hidden lg:table-cell">
                      {new Date(p.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-3 py-3.5 text-muted-foreground group-hover:text-primary transition-colors">
                      <ChevronRight size={15} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-border/50 text-xs text-muted-foreground">
              Toplam <span className="font-semibold text-foreground">{patients.length}</span> hasta
            </div>
          </div>
        )}
      </main>
    </>
  );
}
