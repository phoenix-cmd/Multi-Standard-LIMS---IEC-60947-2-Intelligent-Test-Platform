import { PrismaClient } from '@prisma/client';
import { UpdateOrganizationDTO } from '../dto/organization.dto.js';
import { AuditAdminService, AuditContext } from './audit.admin.service.js';

const prisma = new PrismaClient();

export class OrganizationService {
  /**
   * Retrieves organization & laboratory profile data.
   */
  static async getOrganization(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { laboratories: true },
    });
    if (!org) {
      // Fallback default
      return {
        id: organizationId,
        name: 'National Electrical Testing Laboratories Inc.',
        code: 'NETL-HQ',
        labName: 'High-Power IEC 60947-2 Test Facility',
        address: 'Plot 42, Tech Park, Industrial Corridor, Bangalore 560066',
        contactEmail: 'admin@netl-lims.in',
        contactPhone: '+91 80 2845 9900',
        timezone: 'Asia/Kolkata',
        logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=80',
        brandingColor: '#0284c7',
        defaultLanguage: 'English (US)',
        defaultUnits: 'SI Metric (A, V, K, ms)',
      };
    }

    const lab = org.laboratories[0];
    return {
      id: org.id,
      name: org.name,
      code: org.code,
      labName: lab ? lab.name : 'Primary Testing Facility',
      address: 'Plot 42, Tech Park, Industrial Corridor, Bangalore 560066',
      contactEmail: 'admin@netl-lims.in',
      contactPhone: '+91 80 2845 9900',
      timezone: 'Asia/Kolkata',
      logoUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=120&auto=format&fit=crop&q=80',
      brandingColor: '#0284c7',
      defaultLanguage: 'English (US)',
      defaultUnits: 'SI Metric (A, V, K, ms)',
    };
  }

  /**
   * Updates organization & laboratory details.
   */
  static async updateOrganization(organizationId: string, dto: UpdateOrganizationDTO, ctx: AuditContext) {
    const updateData: any = {};
    if (dto.name) updateData.name = dto.name;
    if (dto.code) updateData.code = dto.code;

    const org = await prisma.organization.upsert({
      where: { id: organizationId },
      update: updateData,
      create: {
        id: organizationId,
        name: dto.name || 'National Electrical Testing Laboratories',
        code: dto.code || 'NETL-HQ',
      },
    });

    await AuditAdminService.logEvent(ctx, 'ORGANIZATION_UPDATED', 'Organization', organizationId, `Updated organization settings`, null, dto);
    return { ...org, ...dto };
  }
}
