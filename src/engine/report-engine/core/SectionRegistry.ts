import type React from 'react';
import type { ReportDocumentData, ThemeConfig } from '../types/document';
import type { NumberingEngine } from './NumberingEngine';

import { LaboratoryHeaderSection } from '../sections/LaboratoryHeaderSection';
import { CoverInformationSection } from '../sections/CoverInformationSection';
import { TableOfContentsSection } from '../sections/TableOfContentsSection';
import { ExecutiveSummarySection } from '../sections/ExecutiveSummarySection';
import { SampleSpecificationSection } from '../sections/SampleSpecificationSection';
import { ClauseResultSection } from '../sections/ClauseResultSection';
import { OscillographWaveformSection } from '../sections/OscillographWaveformSection';
import { EquipmentCalibrationSection } from '../sections/EquipmentCalibrationSection';
import { PhotoGallerySection, AppendixSection } from '../sections/PhotoGallerySection';
import { SignaturesApprovalSection } from '../sections/SignaturesApprovalSection';

export interface ReportSectionProps<T = any> {
  data: ReportDocumentData;
  viewModel?: T;
  theme: ThemeConfig;
  numbering: NumberingEngine;
}

export interface IReportSection<T = any> {
  id: string;
  title: string;
  category: 'header' | 'general' | 'results' | 'telemetry' | 'compliance' | 'appendix';
  defaultOrder: number;
  isVisible: (doc: ReportDocumentData) => boolean;
  Component: React.ComponentType<ReportSectionProps<T>>;
}

class SectionRegistryClass {
  private sections: Map<string, IReportSection> = new Map();

  constructor() {
    this.registerDefaults();
  }

  register(section: IReportSection) {
    this.sections.set(section.id, section);
  }

  getVisibleSections(doc: ReportDocumentData): IReportSection[] {
    return Array.from(this.sections.values())
      .filter((s) => s.isVisible(doc))
      .sort((a, b) => a.defaultOrder - b.defaultOrder);
  }

  getSection(id: string): IReportSection | undefined {
    return this.sections.get(id);
  }

  private registerDefaults() {
    this.register({
      id: 'header',
      title: 'Laboratory Header',
      category: 'header',
      defaultOrder: 10,
      isVisible: () => true,
      Component: LaboratoryHeaderSection,
    });

    this.register({
      id: 'cover',
      title: 'Type Test Certificate & Cover Information',
      category: 'general',
      defaultOrder: 20,
      isVisible: () => true,
      Component: CoverInformationSection,
    });

    this.register({
      id: 'toc',
      title: 'Document Table of Contents',
      category: 'general',
      defaultOrder: 30,
      isVisible: () => true,
      Component: TableOfContentsSection,
    });

    this.register({
      id: 'exec-summary',
      title: 'Executive Summary & Clause Matrix',
      category: 'results',
      defaultOrder: 40,
      isVisible: (doc) => doc.sample.testRuns && doc.sample.testRuns.length > 0,
      Component: ExecutiveSummarySection,
    });

    this.register({
      id: 'specifications',
      title: 'Technical Specimen Specifications',
      category: 'general',
      defaultOrder: 50,
      isVisible: () => true,
      Component: SampleSpecificationSection,
    });

    this.register({
      id: 'clause-results',
      title: 'Clause-Wise Detailed Test Results & Calculations',
      category: 'results',
      defaultOrder: 60,
      isVisible: (doc) => doc.sample.testRuns && doc.sample.testRuns.length > 0,
      Component: ClauseResultSection,
    });

    this.register({
      id: 'oscillographs',
      title: 'Short-Circuit Telemetry & Oscillograph Analysis',
      category: 'telemetry',
      defaultOrder: 70,
      isVisible: (doc) => doc.sample.testRuns.some((r) => !!r.waveformData),
      Component: OscillographWaveformSection,
    });

    this.register({
      id: 'equipment-cal',
      title: 'Test Equipment Traceability & Calibration',
      category: 'compliance',
      defaultOrder: 80,
      isVisible: () => true,
      Component: EquipmentCalibrationSection,
    });

    this.register({
      id: 'photos',
      title: 'Specimen Photographs & Attachments',
      category: 'appendix',
      defaultOrder: 90,
      isVisible: (doc) => doc.sample.attachments && doc.sample.attachments.length > 0,
      Component: PhotoGallerySection,
    });

    this.register({
      id: 'signatures',
      title: 'Signatures, Approvals & Verification Hash',
      category: 'compliance',
      defaultOrder: 100,
      isVisible: () => true,
      Component: SignaturesApprovalSection,
    });

    this.register({
      id: 'appendices',
      title: 'Appendices & Supporting Documentation',
      category: 'appendix',
      defaultOrder: 110,
      isVisible: () => true,
      Component: AppendixSection,
    });
  }
}

export const SectionRegistry = new SectionRegistryClass();
