import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlatılıyor...');

  // ─── Klinik ──────────────────────────────────────────────────────────────────
  const clinic = await prisma.clinic.upsert({
    where: { id: 'clinic-001' },
    update: {},
    create: {
      id: 'clinic-001',
      name: 'Demo Diş Kliniği',
      address: 'Atatürk Cad. No:1, Kadıköy/İstanbul',
      phone: '0216 000 0000',
      email: 'info@demodis.com',
    },
  });
  console.log(`✅ Klinik: ${clinic.name}`);

  // ─── Kullanıcılar ─────────────────────────────────────────────────────────────
  const password = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demodis.com' },
    update: {},
    create: {
      email: 'admin@demodis.com',
      password,
      firstName: 'Ali',
      lastName: 'Yıldız',
      role: 'admin',
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  const doctor = await prisma.user.upsert({
    where: { email: 'doktor@demodis.com' },
    update: {},
    create: {
      email: 'doktor@demodis.com',
      password,
      firstName: 'Mehmet',
      lastName: 'Aydın',
      role: 'doctor',
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Doktor: ${doctor.email}`);

  const assistant = await prisma.user.upsert({
    where: { email: 'asistan@demodis.com' },
    update: {},
    create: {
      email: 'asistan@demodis.com',
      password,
      firstName: 'Fatma',
      lastName: 'Kaya',
      role: 'assistant',
      clinicId: clinic.id,
    },
  });
  console.log(`✅ Asistan: ${assistant.email}`);

  // ─── Örnek Hastalar ───────────────────────────────────────────────────────────
  const patientsData = [
    {
      firstName: 'Ahmet',
      lastName: 'Çelik',
      phone: '0532 111 1111',
      email: 'ahmet.celik@ornek.com',
      dateOfBirth: new Date('1985-03-15'),
      address: 'Bağcılar, İstanbul',
    },
    {
      firstName: 'Zeynep',
      lastName: 'Demir',
      phone: '0533 222 2222',
      email: 'zeynep.demir@ornek.com',
      dateOfBirth: new Date('1992-07-22'),
      address: 'Üsküdar, İstanbul',
    },
    {
      firstName: 'Mustafa',
      lastName: 'Şahin',
      phone: '0534 333 3333',
      email: null,
      dateOfBirth: new Date('1978-11-05'),
      address: 'Beşiktaş, İstanbul',
    },
    {
      firstName: 'Ayşe',
      lastName: 'Koç',
      phone: '0535 444 4444',
      email: 'ayse.koc@ornek.com',
      dateOfBirth: new Date('2000-01-30'),
      address: null,
    },
    {
      firstName: 'Hasan',
      lastName: 'Arslan',
      phone: '0536 555 5555',
      email: null,
      dateOfBirth: null,
      address: 'Kartal, İstanbul',
    },
  ];

  const patients: { id: string; firstName: string; lastName: string }[] = [];
  for (const pd of patientsData) {
    const patient = await prisma.patient.upsert({
      where: { id: `patient-${pd.lastName.toLowerCase()}` },
      update: {},
      create: {
        id: `patient-${pd.lastName.toLowerCase()}`,
        ...pd,
        clinicId: clinic.id,
      },
    });
    patients.push(patient);
    console.log(`✅ Hasta: ${patient.firstName} ${patient.lastName}`);
  }

  // ─── Örnek Randevular ─────────────────────────────────────────────────────────
  const now = new Date();

  const appointmentsData = [
    {
      patientId: patients[0].id,
      doctorId: doctor.id,
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30),
      status: 'scheduled' as const,
      notes: 'Kontrol muayenesi',
    },
    {
      patientId: patients[1].id,
      doctorId: doctor.id,
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 10, 30),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0),
      status: 'scheduled' as const,
      notes: 'Kanal tedavisi takibi',
    },
    {
      patientId: patients[2].id,
      doctorId: doctor.id,
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 14, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 14, 45),
      status: 'completed' as const,
      notes: null,
    },
    {
      patientId: patients[3].id,
      doctorId: doctor.id,
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 11, 30),
      status: 'scheduled' as const,
      notes: 'İlk muayene',
    },
  ];

  for (const ad of appointmentsData) {
    await prisma.appointment.create({
      data: { ...ad, clinicId: clinic.id },
    });
  }
  console.log(`✅ ${appointmentsData.length} randevu oluşturuldu`);

  // ─── Örnek Tedaviler ──────────────────────────────────────────────────────────
  const treatment1 = await prisma.treatment.create({
    data: {
      title: 'Üst Sağ 6 No Kanal Tedavisi',
      description: 'Derin çürük nedeniyle kanal tedavisi gerekti',
      status: 'in_progress',
      totalCost: 2500,
      patientId: patients[0].id,
      clinicId: clinic.id,
      steps: {
        create: [
          { title: 'Röntgen çekimi', order: 0, cost: 200, status: 'completed' },
          { title: 'Anestezi ve kanal açımı', order: 1, cost: 800, status: 'completed' },
          { title: 'Kanal dolgusu', order: 2, cost: 1000, status: 'pending' },
          { title: 'Kronlama', order: 3, cost: 500, status: 'pending' },
        ],
      },
    },
  });

  const treatment2 = await prisma.treatment.create({
    data: {
      title: 'Alt Çene Implant',
      description: '35-36 bölgesi implant tedavisi',
      status: 'planned',
      totalCost: 8000,
      patientId: patients[1].id,
      clinicId: clinic.id,
      steps: {
        create: [
          { title: 'Tomografi çekimi', order: 0, cost: 500, status: 'completed' },
          { title: 'Cerrahi implant yerleştirme', order: 1, cost: 5000, status: 'pending' },
          { title: 'Bekleme süreci (3 ay)', order: 2, cost: 0, status: 'pending' },
          { title: 'Üst yapı uygulaması', order: 3, cost: 2500, status: 'pending' },
        ],
      },
    },
  });
  console.log(`✅ 2 tedavi oluşturuldu`);

  // ─── Örnek Ödemeler ───────────────────────────────────────────────────────────
  await prisma.payment.create({
    data: {
      totalAmount: 2500,
      paidAmount: 1000,
      amount: 1000,
      status: 'partial',
      patientId: patients[0].id,
      treatmentId: treatment1.id,
      clinicId: clinic.id,
      notes: 'İlk taksit alındı',
      paidAt: new Date(),
    },
  });

  await prisma.payment.create({
    data: {
      totalAmount: 8000,
      paidAmount: 0,
      amount: 0,
      status: 'pending',
      patientId: patients[1].id,
      treatmentId: treatment2.id,
      clinicId: clinic.id,
      notes: 'Tedavi başlamadan ödeme planlanacak',
    },
  });
  console.log(`✅ 2 ödeme kaydı oluşturuldu`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅  Seed tamamlandı!\n');
  console.log('📧  Giriş bilgileri:');
  console.log('    Admin    → admin@demodis.com     / password123');
  console.log('    Doktor   → doktor@demodis.com    / password123');
  console.log('    Asistan  → asistan@demodis.com   / password123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
