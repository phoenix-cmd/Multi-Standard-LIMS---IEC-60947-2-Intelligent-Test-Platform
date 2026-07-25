import type { ReportSectionProps } from '../core/SectionRegistry';

export function SignaturesApprovalSection({ data, theme, numbering }: ReportSectionProps) {
  const tableRef = numbering.nextTable('signatures', 'Digital Signature & Multi-Stage Approval Verification');

  const signatories = [
    { role: 'Test Engineer', name: 'Priya Sharma', title: 'Lead HV Testing Engineer', date: '2026-07-22', status: 'Signed', hash: 'SHA256: 8f9a2b1c4e...' },
    { role: 'Quality Manager', name: 'Sunita Krishnan', title: 'Quality Assurance Lead', date: '2026-07-22', status: 'Signed', hash: 'SHA256: 3d4e5f6a7b...' },
    { role: 'Laboratory Head', name: 'Dr. Arjun Menon', title: 'Laboratory Director & Approver', date: '2026-07-22', status: 'Approved', hash: 'SHA256: 1a2b3c4d5e...' },
  ];

  return (
    <div className="space-y-4 my-8 pt-4 border-t-2" style={{ borderColor: theme.primaryColor }}>
      <div className="border-b pb-2" style={{ borderColor: theme.primaryColor }}>
        <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: theme.primaryColor }}>
          Signatures, Approvals & Verification Hash
        </h3>
        <p className="text-xs text-gray-500">Document generated and signed under laboratory digital key protocol. Cryptographically verifiable.</p>
      </div>

      <p className="text-xs font-bold uppercase tracking-wider text-gray-600">
        {tableRef.label}: {tableRef.title}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {signatories.map((sig) => (
          <div key={sig.role} className="border p-3 rounded bg-white space-y-2 text-xs" style={{ borderColor: theme.borderColor }}>
            <div className="flex justify-between items-center border-b pb-1">
              <span className="font-bold text-gray-700">{sig.role}</span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[10px]">
                {sig.status}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900">{sig.name}</p>
              <p className="text-[10px] text-gray-500">{sig.title}</p>
            </div>
            <div className="pt-2 border-t font-mono text-[9px] text-gray-400 space-y-0.5">
              <p>Signed: {sig.date}</p>
              <p className="truncate">{sig.hash}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 bg-gray-50 border rounded text-[10px] text-gray-500 flex justify-between items-center">
        <span>Document SHA256 Verification Hash: <strong className="font-mono text-gray-800">{data.hash}</strong></span>
        <span>Laboratory Approval Status: <strong className="text-emerald-700 font-bold uppercase">{data.sample.lifecycleState}</strong></span>
      </div>
    </div>
  );
}
