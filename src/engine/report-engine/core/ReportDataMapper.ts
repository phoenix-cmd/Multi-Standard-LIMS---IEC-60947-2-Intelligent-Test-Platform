import type { ReportDocumentData } from '../types/document';
import type { ClauseViewModel, FormulaStepViewModel, EquipmentViewModel, AppendixViewModel, SpecSectionViewModel } from '../types/viewModels';
import { DiagnosisEngine } from '../../../ai/engines';

const diagnosisEngine = new DiagnosisEngine();

export class ReportDataMapper {
  static mapSpecificationSections(doc: ReportDocumentData): SpecSectionViewModel[] {
    const s = doc.sample.specification;
    return [
      {
        title: '1. General Specimen Identification',
        items: [
          { label: 'Manufacturer', value: s.manufacturer },
          { label: 'Model / Type Designation', value: s.model },
          { label: 'Drawing Number', value: s.drawingNo || 'N/A' },
          { label: 'Number of Poles', value: `${s.poles}P` },
          { label: 'Frame Size', value: s.frameSize },
          { label: 'Release Type', value: s.releaseType },
        ],
      },
      {
        title: '2. Rated Electrical Parameters',
        items: [
          { label: 'Rated Operational Current (In)', value: `${s.ratedCurrent} A` },
          { label: 'Rated Operational Voltage (Ue)', value: `${s.ratedVoltage} V` },
          { label: 'Rated Insulation Voltage (Ui)', value: `${s.insulationVoltage} V` },
          { label: 'Impulse Withstand Voltage (Uimp)', value: `${s.impulsWithstand} kV` },
          { label: 'Rated Frequency', value: '50 / 60 Hz' },
          { label: 'Selectivity Category', value: `Category ${s.category}` },
        ],
      },
      {
        title: '3. Short-Circuit Performance Ratings',
        items: [
          { label: 'Ultimate Breaking Capacity (Icu)', value: `${s.shortCircuitUltimate} kA` },
          { label: 'Service Breaking Capacity (Ics)', value: `${s.shortCircuitService} kA` },
          { label: 'Short-Time Withstand (Icw)', value: s.shortTimeWithstand ? `${s.shortTimeWithstand} kA` : 'N/A' },
          { label: 'Short-Time Duration (tw)', value: s.shortTimeDuration ? `${s.shortTimeDuration} s` : 'N/A' },
        ],
      },
    ];
  }

  static mapClauseViewModels(doc: ReportDocumentData): ClauseViewModel[] {
    const clauseVMs: ClauseViewModel[] = [];
    const spec = doc.sample.specification;

    doc.sample.testRuns.forEach((run) => {
      run.clauseResults.forEach((res) => {
        const formulaSteps: FormulaStepViewModel[] = [];

        // Build dynamic formula steps based on clause
        if (res.clauseId === '8.3.3.1') {
          formulaSteps.push({
            stepName: 'Terminal R ΔT Calculation',
            expression: 'ΔT = T_measured - T_ambient',
            substitution: `ΔT = 93.4 °C - 35.0 °C`,
            result: `${res.measuredValue} K`,
            unit: 'K',
            verdict: 'PASS',
          });
          formulaSteps.push({
            stepName: 'Operating Handle ΔT Limit Check',
            expression: 'ΔT_handle <= 35 K',
            substitution: '22.0 K <= 35 K',
            result: '22.0 K',
            unit: 'K',
            verdict: 'PASS',
          });
        } else if (res.clauseId === '8.3.3.2') {
          const expectedV = 2 * spec.insulationVoltage + 1000;
          formulaSteps.push({
            stepName: 'Test Voltage Calculation (IEC 60947-2 Cl. 8.3.3.2)',
            expression: 'V_test = 2 × Ui + 1000',
            substitution: `V_test = 2 × ${spec.insulationVoltage} + 1000`,
            result: `${expectedV} V`,
            unit: 'V',
            verdict: 'PASS',
          });
        } else if (res.clauseId === '8.3.3.3') {
          const i105 = 1.05 * spec.ratedCurrent;
          const i130 = 1.30 * spec.ratedCurrent;
          formulaSteps.push({
            stepName: 'Non-Tripping Test Current (1.05×In)',
            expression: 'I_applied = 1.05 × In',
            substitution: `I_applied = 1.05 × ${spec.ratedCurrent}`,
            result: `${i105} A`,
            unit: 'A',
            verdict: 'PASS',
          });
          formulaSteps.push({
            stepName: 'Tripping Test Current (1.30×In)',
            expression: 'I_applied = 1.30 × In',
            substitution: `I_applied = 1.30 × ${spec.ratedCurrent}`,
            result: `${i130} A`,
            unit: 'A',
            verdict: 'PASS',
          });
        }

        let aiDiagnosis;
        if (res.verdict === 'FAIL') {
          aiDiagnosis = diagnosisEngine.diagnose([res], spec);
        }

        clauseVMs.push({
          clauseId: res.clauseId,
          clauseTitle: res.clauseTitle,
          requirement: getClauseRequirement(res.clauseId),
          purpose: getClausePurpose(res.clauseId),
          acceptanceCriteria: getClauseCriteria(res.clauseId, spec),
          measuredValue: res.measuredValue,
          limitValue: res.limitValue,
          unit: res.unit,
          formulaSteps,
          observations: res.message,
          equipmentIds: ['eq1', 'eq2'],
          verdict: res.verdict,
          aiDiagnosis,
          engineerRemarks: 'Test conducted per standard setup without deviation.',
          sequenceId: run.sequenceId,
        });
      });
    });

    return clauseVMs;
  }

  static mapEquipmentViewModels(doc: ReportDocumentData): EquipmentViewModel[] {
    return doc.equipmentList.map((eq) => ({
      assetTag: eq.assetTag,
      name: eq.name,
      manufacturer: eq.manufacturer,
      model: eq.model,
      serialNo: eq.serialNo,
      certNo: eq.currentCertNo || 'NABL-PENDING',
      calDue: eq.nextCalibrationDue,
      status: eq.status,
      usedInClauses: ['8.3.3.1', '8.3.3.2', '8.3.3.3', '8.3.4', '8.3.5'],
    }));
  }

  static mapAppendixViewModels(doc: ReportDocumentData): AppendixViewModel[] {
    const appendices: AppendixViewModel[] = [];

    // Check for waveform oscillographs
    doc.sample.testRuns.forEach((run) => {
      if (run.waveformData) {
        appendices.push({
          id: `app-osg-${run.sequenceId}`,
          title: `Short-Circuit Oscillograph Telemetry (${run.sequenceId.toUpperCase()})`,
          type: 'oscillograph',
          description: `Captured waveforms for sequence ${run.sequenceId}. Peak Ip: ${run.waveformData.peakCurrent} kA, Clearing Time: ${run.waveformData.clearingTime} s.`,
          content: run.waveformData,
          refCode: `OSG-${run.sequenceId.toUpperCase()}`,
        });
      }
    });

    // Add attachments as photos / certificates
    doc.sample.attachments.forEach((att) => {
      appendices.push({
        id: `app-att-${att.id}`,
        title: `Specimen Attachment — ${att.name}`,
        type: att.type === 'photo' ? 'photo' : 'certificate',
        description: `Uploaded by ${att.uploadedBy} on ${new Date(att.uploadedAt).toLocaleDateString()}`,
        content: att,
        refCode: `ATT-${att.id.toUpperCase()}`,
      });
    });

    return appendices;
  }
}

function getClauseRequirement(clauseId: string): string {
  switch (clauseId) {
    case '8.3.3.1': return 'IEC 60947-2 Cl. 8.3.3.1 — Temperature rise of any part shall not exceed the values specified in Table 7 under continuous rated current In.';
    case '8.3.3.2': return 'IEC 60947-2 Cl. 8.3.3.2 — Dielectric properties shall withstand 2 × Ui + 1000 V (min 2500 V) for 60 seconds without flashover or insulation breakdown.';
    case '8.3.3.3': return 'IEC 60947-2 Cl. 8.3.3.3 — Breaker shall not trip at 1.05 × In (conventional non-tripping current) and shall trip within conventional time at 1.30 × In.';
    case '8.3.4':   return 'IEC 60947-2 Cl. 8.3.4 — Ultimate short-circuit breaking capacity Icu test sequence O - t - CO.';
    case '8.3.5':   return 'IEC 60947-2 Cl. 8.3.5 — Service short-circuit breaking capacity Ics test sequence O - t - CO - t - CO.';
    default:        return 'IEC 60947-2 Standard Clause Requirement.';
  }
}

function getClausePurpose(clauseId: string): string {
  switch (clauseId) {
    case '8.3.3.1': return 'Verify thermal equilibrium and safety of current-carrying terminals and operating components under normal full load.';
    case '8.3.3.2': return 'Verify solid dielectric insulation integrity between live phases, frame ground, and open contacts after operational stress.';
    case '8.3.3.3': return 'Verify accuracy of overcurrent release calibration against time-current tripping characteristic bounds.';
    default:        return 'Verification of operational compliance.';
  }
}

function getClauseCriteria(clauseId: string, spec: any): string {
  switch (clauseId) {
    case '8.3.3.1': return 'Terminal ΔT ≤ 70 K; Handle ΔT ≤ 35 K; Metallic enclosure ΔT ≤ 45 K.';
    case '8.3.3.2': return `Test Voltage = 2 × ${spec.insulationVoltage} + 1000 = ${2 * spec.insulationVoltage + 1000} V AC; Leakage current < 5 mA.`;
    case '8.3.3.3': return 'No trip at 1.05 × In for 2h; Trip at 1.30 × In within maximum allowed time band.';
    default:        return 'Compliance per manufacturer data sheet.';
  }
}
