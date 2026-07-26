import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Enterprise Laboratory Database...');

  // 1. Create Organization & Laboratory
  const org = await prisma.organization.upsert({
    where: { code: 'ABB-IN' },
    update: {},
    create: {
      name: 'ABB Electrification India',
      code: 'ABB-IN',
    },
  });

  const lab = await prisma.laboratory.upsert({
    where: {
      organizationId_code: {
        organizationId: org.id,
        code: 'PUNE-LV-LAB',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Pune LV Switchgear Intelligence Lab',
      code: 'PUNE-LV-LAB',
      location: 'Pune, Maharashtra',
    },
  });

  // 2. Create Permissions
  const permissionCodes = [
    'sample:create', 'sample:edit', 'sample:delete', 'sample:inspect',
    'test:execute', 'test:override', 'test:view_all',
    'report:generate', 'report:sign', 'report:approve', 'report:export',
    'equipment:view', 'equipment:edit', 'equipment:calibrate',
    'standard:manage', 'standard:install',
    'audit:view', 'audit:export',
    'admin:users', 'admin:settings',
  ];

  const permissionsMap: Record<string, string> = {};
  for (const code of permissionCodes) {
    const perm = await prisma.permission.upsert({
      where: { code },
      update: {},
      create: { code, description: `Permission for ${code}` },
    });
    permissionsMap[code] = perm.id;
  }

  // 3. Create Roles
  const rolesData = [
    { name: 'LabDirector', description: 'Laboratory Director & Executive Lead' },
    { name: 'LeadEngineer', description: 'Senior Test & Certification Lead' },
    { name: 'Technician', description: 'Laboratory Testing Technician' },
    { name: 'QualityInspector', description: 'Quality Assurance & Auditor' },
  ];

  const rolesMap: Record<string, string> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: {},
      create: { name: r.name, description: r.description },
    });
    rolesMap[r.name] = role.id;

    // Attach permissions
    const permsToAssign = Object.values(permissionsMap);
    for (const permId of permsToAssign) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: permId },
        },
        update: {},
        create: { roleId: role.id, permissionId: permId },
      });
    }
  }

  // 4. Create Users
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123456!', 10);

  const usersData = [
    {
      id: 'u1', email: 'arjun.menon@lab.in', name: 'Dr. Arjun Menon',
      role: 'LabDirector', department: 'Testing & Certification', avatarInitials: 'AM',
      hash: adminPasswordHash,
    },
    {
      id: 'u2', email: 'priya.sharma@lab.in', name: 'Priya Sharma',
      role: 'LeadEngineer', department: 'HV Testing', avatarInitials: 'PS',
      hash: passwordHash,
    },
    {
      id: 'u3', email: 'rahul.verma@lab.in', name: 'Rahul Verma',
      role: 'Technician', department: 'LV Switchgear', avatarInitials: 'RV',
      hash: passwordHash,
    },
    {
      id: 'u4', email: 'sunita@lab.in', name: 'Sunita Krishnan',
      role: 'QualityInspector', department: 'Quality Assurance', avatarInitials: 'SK',
      hash: passwordHash,
    },
  ];

  const userMap: Record<string, string> = {};
  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { passwordHash: u.hash },
      create: {
        id: u.id,
        organizationId: org.id,
        laboratoryId: lab.id,
        email: u.email,
        passwordHash: u.hash,
        name: u.name,
        department: u.department,
        avatarInitials: u.avatarInitials,
      },
    });
    userMap[u.id] = user.id;

    // Assign Role
    const roleId = rolesMap[u.role];
    if (roleId) {
      await prisma.userRole.upsert({
        where: { userId_roleId: { userId: user.id, roleId } },
        update: {},
        create: { userId: user.id, roleId },
      });
    }
  }

  // 5. Create Equipment
  const equipmentData = [
    {
      id: 'eq1', assetTag: 'LAB-EQ-001', name: 'Short-Circuit Test Station', model: 'STS-630',
      manufacturer: 'Schneider Test Systems', serialNo: 'STS630-2021-0084', category: 'High-Power Source',
      location: 'HV Lab Bay 1', status: 'Operational', hoursUsed: 3420, lastUsedDate: '2026-07-22',
      purchaseDate: '2021-03-15', nextCalibrationDue: '2026-09-01', currentCertNo: 'NABL-STS-2025-4721', qrCode: 'LAB-EQ-001',
    },
    {
      id: 'eq2', assetTag: 'LAB-EQ-002', name: 'Digital Storage Oscilloscope', model: 'DPO7354C',
      manufacturer: 'Tektronix', serialNo: 'TEK7354-2022-1103', category: 'Measurement',
      location: 'HV Lab Bay 1', status: 'Operational', hoursUsed: 1820, lastUsedDate: '2026-07-22',
      purchaseDate: '2022-07-10', nextCalibrationDue: '2026-12-01', currentCertNo: 'NABL-OSC-2025-9021', qrCode: 'LAB-EQ-002',
    },
    {
      id: 'eq3', assetTag: 'LAB-EQ-003', name: 'Primary Current Injection Set', model: 'PCIS-1200',
      manufacturer: 'Omicron', serialNo: 'OMCR-PCIS-2020-0345', category: 'Calibration',
      location: 'Calibration Lab', status: 'CalibrationDue', hoursUsed: 5100, lastUsedDate: '2026-06-30',
      purchaseDate: '2020-01-20', nextCalibrationDue: '2026-07-28', currentCertNo: 'NABL-PCJ-2025-1132', qrCode: 'LAB-EQ-003',
    },
  ];

  for (const eq of equipmentData) {
    await prisma.equipment.upsert({
      where: { assetTag: eq.assetTag },
      update: {},
      create: {
        id: eq.id,
        organizationId: org.id,
        laboratoryId: lab.id,
        assetTag: eq.assetTag,
        name: eq.name,
        model: eq.model,
        manufacturer: eq.manufacturer,
        serialNo: eq.serialNo,
        category: eq.category,
        location: eq.location,
        status: eq.status,
        hoursUsed: eq.hoursUsed,
        lastUsedDate: eq.lastUsedDate,
        purchaseDate: eq.purchaseDate,
        nextCalibrationDue: eq.nextCalibrationDue,
        currentCertNo: eq.currentCertNo,
        qrCode: eq.qrCode,
      },
    });
  }

  // 6. Create Samples
  const samplesData = [
    {
      id: 's1', reportNo: 'LAB-2026-MCCB-00891', receivedDate: '2026-07-10', clientName: 'Siemens Energy Ltd',
      clientRef: 'PO-991204', standardId: 'iec60947-2', standardRevision: '2016', lifecycleState: 'Review',
      assignedToUserId: 'u2',
      specification: {
        frameSize: '250A', poles: 3, ratedCurrent: 250, ratedVoltage: 415, insulationVoltage: 690,
        impulsWithstand: 8, shortCircuitUltimate: 50, shortCircuitService: 36, category: 'A',
        releaseType: 'Thermal-Magnetic', manufacturer: 'Siemens', model: '3VA1225-5EF32',
      },
    },
    {
      id: 's2', reportNo: 'LAB-2026-MCCB-00892', receivedDate: '2026-07-15', clientName: 'Schneider Electric',
      clientRef: 'PO-881203', standardId: 'iec60947-2', standardRevision: '2016', lifecycleState: 'Testing',
      assignedToUserId: 'u2',
      specification: {
        frameSize: '160A', poles: 4, ratedCurrent: 160, ratedVoltage: 415, insulationVoltage: 800,
        impulsWithstand: 8, shortCircuitUltimate: 36, shortCircuitService: 36, category: 'A',
        releaseType: 'Electronic', manufacturer: 'Schneider', model: 'NSX160N',
      },
    },
    {
      id: 's3', reportNo: 'LAB-2026-MCCB-00893', receivedDate: '2026-07-20', clientName: 'L&T Electrical & Automation',
      clientRef: 'PO-771920', standardId: 'iec60947-2', standardRevision: '2016', lifecycleState: 'Received',
      assignedToUserId: 'u3',
      specification: {
        frameSize: '630A', poles: 3, ratedCurrent: 630, ratedVoltage: 415, insulationVoltage: 1000,
        impulsWithstand: 12, shortCircuitUltimate: 70, shortCircuitService: 50, category: 'B',
        releaseType: 'Electronic', manufacturer: 'L&T', model: 'DN3-630N',
      },
    },
  ];

  for (const s of samplesData) {
    const createdSample = await prisma.sample.upsert({
      where: { reportNo: s.reportNo },
      update: {},
      create: {
        id: s.id,
        organizationId: org.id,
        laboratoryId: lab.id,
        reportNo: s.reportNo,
        receivedDate: s.receivedDate,
        clientName: s.clientName,
        clientRef: s.clientRef,
        standardId: s.standardId,
        standardRevision: s.standardRevision,
        lifecycleState: s.lifecycleState,
        assignedToUserId: s.assignedToUserId,
        specification: {
          create: {
            frameSize: s.specification.frameSize,
            poles: s.specification.poles,
            ratedCurrent: s.specification.ratedCurrent,
            ratedVoltage: s.specification.ratedVoltage,
            insulationVoltage: s.specification.insulationVoltage,
            impulsWithstand: s.specification.impulsWithstand,
            shortCircuitUltimate: s.specification.shortCircuitUltimate,
            shortCircuitService: s.specification.shortCircuitService,
            category: s.specification.category,
            releaseType: s.specification.releaseType,
            manufacturer: s.specification.manufacturer,
            model: s.specification.model,
          },
        },
        lifecycleHistory: {
          create: [
            { state: 'Received', user: 'System', notes: 'Sample received at lab' },
            { state: s.lifecycleState, user: 'Priya Sharma', notes: 'Sample in progress' },
          ],
        },
      },
    });

    // Create a Report for sample 1
    if (s.id === 's1') {
      await prisma.report.upsert({
        where: { reportNo: s.reportNo },
        update: {},
        create: {
          organizationId: org.id,
          laboratoryId: lab.id,
          reportNo: s.reportNo,
          sampleId: createdSample.id,
          title: `Type Test Report — MCCB 250A — ${s.reportNo}`,
          approvalStage: 'LeadEngineer_Approved',
          status: 'Signed',
          createdByUserId: 'u2',
          data: {
            testResults: 'PASS',
            summary: 'Tested according to IEC 60947-2 Edition 5.0 (2016)',
          },
        },
      });
    }
  }

  // 7. Create Audit Logs
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: org.id, laboratoryId: lab.id, userId: 'u2', userName: 'Priya Sharma',
        action: 'auth:login', resource: 'UserSession', resourceId: 'session-1',
        details: 'User logged in', ipAddress: '127.0.0.1', userAgent: 'Chrome',
      },
      {
        organizationId: org.id, laboratoryId: lab.id, userId: 'u2', userName: 'Priya Sharma',
        action: 'sample:create', resource: 'Sample', resourceId: 's1',
        details: 'Sample LAB-2026-MCCB-00891 registered', ipAddress: '127.0.0.1', userAgent: 'Chrome',
      },
    ],
  });

  // 8. Create Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: 'u2', type: 'calibration_due', title: 'Calibration Required',
        message: 'Primary Current Injection Set (LAB-EQ-003) calibration is due on 2026-07-28.',
        read: false, category: 'equipment', priority: 'high', link: '/equipment',
      },
      {
        userId: 'u2', type: 'sample_waiting', title: 'New Sample Received',
        message: 'Sample LAB-2026-MCCB-00893 is waiting for inspection.',
        read: false, category: 'sample', priority: 'normal', link: '/samples',
      },
    ],
  });

  console.log('✅ Enterprise Laboratory Database Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
