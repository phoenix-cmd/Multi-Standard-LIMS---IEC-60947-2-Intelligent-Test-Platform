import type { ReportDocumentData, ValidationResult, ValidationError } from '../types/document';

export class ReportValidator {
  static validate(doc: ReportDocumentData): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    const { sample, equipmentList } = doc;

    // 1. Sample basic validation
    if (!sample.clientName) {
      errors.push({ code: 'MISSING_CLIENT', severity: 'error', field: 'clientName', message: 'Client name is missing.' });
    }
    if (!sample.reportNo) {
      errors.push({ code: 'MISSING_REPORT_NO', severity: 'error', field: 'reportNo', message: 'Report number is missing.' });
    }

    // 2. Specification validation
    const spec = sample.specification;
    if (!spec.ratedCurrent || spec.ratedCurrent <= 0) {
      errors.push({ code: 'INVALID_IN', severity: 'error', field: 'specification.ratedCurrent', message: 'Rated current (In) must be specified.' });
    }
    if (!spec.ratedVoltage || spec.ratedVoltage <= 0) {
      errors.push({ code: 'INVALID_UE', severity: 'error', field: 'specification.ratedVoltage', message: 'Rated voltage (Ue) must be specified.' });
    }

    // 3. Test Runs & Clauses validation
    if (!sample.testRuns || sample.testRuns.length === 0) {
      warnings.push({ code: 'NO_TEST_RUNS', severity: 'warning', field: 'testRuns', message: 'No test runs completed for this sample.' });
    } else {
      sample.testRuns.forEach((run, idx) => {
        if (!run.clauseResults || run.clauseResults.length === 0) {
          warnings.push({ code: 'EMPTY_CLAUSE_RESULTS', severity: 'warning', field: `testRuns[${idx}]`, message: `Test run ${run.sequenceId} has no clause results.` });
        } else {
          run.clauseResults.forEach((cr) => {
            if (cr.verdict === 'PENDING' || cr.verdict === 'IN_PROGRESS') {
              errors.push({ code: 'UNFINISHED_CLAUSE', severity: 'error', field: `clause_${cr.clauseId}`, message: `Clause ${cr.clauseId} has an unresolved verdict (${cr.verdict}).` });
            }
          });
        }
      });
    }

    // 4. Equipment calibration check
    equipmentList.forEach((eq) => {
      if (eq.status === 'CalibrationDue' || eq.status === 'OutOfService' || eq.status === 'Quarantined') {
        warnings.push({
          code: 'EQUIPMENT_CAL_WARN',
          severity: 'warning',
          field: `equipment_${eq.id}`,
          message: `Equipment "${eq.name}" (${eq.assetTag}) status is "${eq.status}".`,
        });
      }
    });

    // 5. Signature check
    if (sample.lifecycleState !== 'Approved' && sample.lifecycleState !== 'Released') {
      warnings.push({
        code: 'UNAPPROVED_DRAFT',
        severity: 'warning',
        field: 'lifecycleState',
        message: `Sample state is "${sample.lifecycleState}". Report will print with DRAFT watermark.`,
      });
    }

    const canExport = errors.length === 0;

    return {
      valid: errors.length === 0,
      canExport,
      errors,
      warnings,
    };
  }
}
