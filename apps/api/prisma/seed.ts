import { PrismaClient } from '@prisma/client';
import { hash } from 'argon2';

const prisma = new PrismaClient();

/**
 * Permission catalogue. Format: "<resource>.<action>".
 * These are referenced by the RolesGuard / PermissionsGuard on the API.
 */
const PERMISSIONS = [
  'users.read',
  'users.write',
  'roles.read',
  'roles.write',
  'patients.read',
  'patients.write',
  'tests.read',
  'tests.write',
  'orders.read',
  'orders.write',
  'requests.read',
  'requests.write',
  'samples.read',
  'samples.write',
  'devices.read',
  'devices.write',
  'results.read',
  'results.write',
  'results.review',
  'results.approve',
  'payments.read',
  'payments.write',
  'support.read',
  'support.write',
  'reports.read',
];

/** Which permissions each role receives. */
const ROLE_MATRIX: Record<string, string[]> = {
  ADMIN: PERMISSIONS, // full access
  DOCTOR: [
    'patients.read',
    'patients.write',
    'tests.read',
    'orders.read',
    'orders.write',
    'requests.read',
    'requests.write',
    'results.read',
    'reports.read',
  ],
  LAB_TECH: [
    'patients.read',
    'tests.read',
    'requests.read',
    'samples.read',
    'samples.write',
    'devices.read',
    'results.read',
    'results.write',
    'results.review',
  ],
  RECEPTIONIST: [
    'patients.read',
    'patients.write',
    'tests.read',
    'orders.read',
    'orders.write',
    'requests.read',
    'requests.write',
    'support.read',
    'support.write',
  ],
  ACCOUNTANT: [
    'patients.read',
    'payments.read',
    'payments.write',
    'support.read',
    'support.write',
    'reports.read',
  ],
};

const TESTS = [
  { name: 'Complete Blood Count (CBC)', category: 'Hematology', sampleType: 'Blood', price: 25, loincCode: '58410-2', unit: 'cells/µL', referenceRange: '4.5-11.0 x10^3' },
  { name: 'Fasting Blood Glucose', category: 'Chemistry', sampleType: 'Blood', price: 12, loincCode: '1558-6', unit: 'mg/dL', referenceRange: '70-99' },
  { name: 'Lipid Panel', category: 'Chemistry', sampleType: 'Blood', price: 35, loincCode: '57698-3', unit: 'mg/dL', referenceRange: 'See report' },
  { name: 'Thyroid Stimulating Hormone (TSH)', category: 'Endocrinology', sampleType: 'Blood', price: 40, loincCode: '3016-3', unit: 'mIU/L', referenceRange: '0.4-4.0' },
  { name: 'Urinalysis', category: 'Urine', sampleType: 'Urine', price: 15, loincCode: '24357-6', unit: '-', referenceRange: 'Normal' },
  { name: 'Vitamin D, 25-Hydroxy', category: 'Chemistry', sampleType: 'Blood', price: 55, loincCode: '1989-3', unit: 'ng/mL', referenceRange: '30-100' },
  { name: 'Liver Function Test (LFT)', category: 'Chemistry', sampleType: 'Blood', price: 30, loincCode: '24325-3', unit: 'U/L', referenceRange: 'See report' },
  { name: 'HbA1c', category: 'Chemistry', sampleType: 'Blood', price: 28, loincCode: '4548-4', unit: '%', referenceRange: '<5.7' },
  { name: 'C-Reactive Protein (CRP)', category: 'Immunology', sampleType: 'Blood', price: 22, loincCode: '1988-5', unit: 'mg/L', referenceRange: '<3.0' },
  { name: 'COVID-19 PCR', category: 'Microbiology', sampleType: 'Swab', price: 60, loincCode: '94500-6', unit: '-', referenceRange: 'Not detected' },
];

async function main() {
  console.log('🌱 Seeding database...');

  // 1) Permissions
  for (const name of PERMISSIONS) {
    await prisma.permission.upsert({ where: { name }, update: {}, create: { name } });
  }

  // 2) Roles + role-permission links
  for (const [roleName, perms] of Object.entries(ROLE_MATRIX)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });

    for (const permName of perms) {
      const perm = await prisma.permission.findUnique({ where: { name: permName } });
      if (!perm) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: perm.id } },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }

  // 3) Admin user
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const adminEmail = 'admin@labsphere.io';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'System Administrator',
      email: adminEmail,
      phone: '+10000000000',
      password: await hash('Admin@123'),
    },
  });
  if (adminRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: admin.id, roleId: adminRole.id } },
      update: {},
      create: { userId: admin.id, roleId: adminRole.id },
    });
  }

  // 4) A demo lab technician
  const techRole = await prisma.role.findUnique({ where: { name: 'LAB_TECH' } });
  const tech = await prisma.user.upsert({
    where: { email: 'tech@labsphere.io' },
    update: {},
    create: {
      name: 'Lena Technician',
      email: 'tech@labsphere.io',
      password: await hash('Tech@123'),
    },
  });
  if (techRole) {
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: tech.id, roleId: techRole.id } },
      update: {},
      create: { userId: tech.id, roleId: techRole.id },
    });
  }

  // 5) Test catalogue
  const existingTests = await prisma.test.count();
  if (existingTests === 0) {
    for (const t of TESTS) {
      await prisma.test.create({ data: t });
    }
  }

  // 6) A couple of demo patients
  const patientCount = await prisma.patient.count();
  if (patientCount === 0) {
    await prisma.patient.createMany({
      data: [
        { patientNumber: 'P-000001', name: 'John Carter', phone: '+1555000111', email: 'john@example.com', gender: 'male' },
        { patientNumber: 'P-000002', name: 'Maria Gomez', phone: '+1555000222', email: 'maria@example.com', gender: 'female' },
      ],
    });
  }

  // 7) A demo device
  const deviceCount = await prisma.device.count();
  if (deviceCount === 0) {
    await prisma.device.create({ data: { name: 'Sysmex XN-1000 Analyzer', status: 'active', calibratedAt: new Date() } });
  }

  console.log('✅ Seed complete.');
  console.log('   Admin login → admin@labsphere.io / Admin@123');
  console.log('   Tech  login → tech@labsphere.io / Tech@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
