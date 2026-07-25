import type { ReportDocumentData } from '../types/document';
import { ReportDataMapper } from './ReportDataMapper';

export class PackageExporter {
  static generatePackageJSON(doc: ReportDocumentData): string {
    const clauseVMs = ReportDataMapper.mapClauseViewModels(doc);
    const spec = doc.sample.specification;

    const auditPackage = {
      metadata: {
        documentId: doc.sample.reportNo,
        standard: 'IEC 60947-2 Ed 5.0 (2016)',
        revision: doc.revision,
        generatedAt: doc.generatedAt,
        sha256Checksum: doc.hash,
        themeId: doc.themeId,
      },
      specimen: {
        clientName: doc.sample.clientName,
        clientRef: doc.sample.clientRef,
        model: spec.model,
        manufacturer: spec.manufacturer,
        ratings: {
          In_A: spec.ratedCurrent,
          Ue_V: spec.ratedVoltage,
          Ui_V: spec.insulationVoltage,
          Uimp_kV: spec.impulsWithstand,
          Icu_kA: spec.shortCircuitUltimate,
          Ics_kA: spec.shortCircuitService,
          poles: spec.poles,
          category: spec.category,
        },
      },
      testResults: clauseVMs.map((c) => ({
        clauseId: c.clauseId,
        clauseTitle: c.clauseTitle,
        verdict: c.verdict,
        measuredValue: c.measuredValue,
        limitValue: c.limitValue,
        unit: c.unit,
        formulaSteps: c.formulaSteps,
        aiDiagnosis: c.aiDiagnosis ? c.aiDiagnosis.failureMechanism : undefined,
      })),
      equipmentUsed: doc.equipmentList.map((eq) => ({
        assetTag: eq.assetTag,
        name: eq.name,
        certNo: eq.currentCertNo,
        calDue: eq.nextCalibrationDue,
      })),
      digitalManifest: (doc.sample.attachments || []).map((att) => ({
        filename: att.name,
        type: att.type,
        uploadedAt: att.uploadedAt,
        sizeBytes: att.size,
        checksum: `SHA256:${doc.hash.slice(0, 16)}`,
      })),
    };

    return JSON.stringify(auditPackage, null, 2);
  }

  static downloadPackageJSON(doc: ReportDocumentData) {
    const jsonString = this.generatePackageJSON(doc);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.sample.reportNo}_AuditPackage_Rev${doc.revision}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
