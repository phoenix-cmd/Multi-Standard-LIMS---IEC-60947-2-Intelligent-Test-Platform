import React from 'react';

export function HeatMapWidget() {
  const clauses = [
    { id: '8.3.3.1', name: 'Temp Rise' },
    { id: '8.3.3.2', name: 'Dielectric' },
    { id: '8.3.3.3', name: 'Tripping' },
    { id: '8.3.4',   name: 'Icu Break' },
    { id: '8.3.5',   name: 'Ics Break' },
  ];

  const sequences = ['Seq I', 'Seq II', 'Seq III', 'Seq IV'];

  // Matrix fail counts
  const matrix: Record<string, number[]> = {
    '8.3.3.1': [2, 0, 0, 0],
    '8.3.3.2': [0, 1, 0, 0],
    '8.3.3.3': [3, 0, 0, 0],
    '8.3.4':   [0, 0, 0, 0],
    '8.3.5':   [0, 0, 1, 0],
  };

  const getHeatBg = (count: number) => {
    if (count === 0) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (count === 1) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-red-500/30 text-red-300 border-red-500/40 font-bold animate-pulse';
  };

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-surface-100">Clause vs Sequence Failure Matrix Heatmap</h3>
          <p className="text-xs text-surface-400">Distribution of test failures across IEC 60947-2 sequences</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-surface-800">
              <th className="py-2 px-3 text-surface-400 font-semibold">Clause</th>
              {sequences.map((seq) => (
                <th key={seq} className="py-2 px-3 text-surface-400 font-semibold text-center">{seq}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clauses.map((c) => (
              <tr key={c.id} className="border-b border-surface-800/50 hover:bg-surface-800/40">
                <td className="py-2.5 px-3">
                  <p className="font-mono font-bold text-surface-200">{c.id}</p>
                  <p className="text-[10px] text-surface-400">{c.name}</p>
                </td>
                {sequences.map((_, i) => {
                  const cnt = matrix[c.id]?.[i] ?? 0;
                  return (
                    <td key={i} className="py-2.5 px-3 text-center">
                      <span className={`inline-block w-10 py-1.5 rounded-lg border text-xs ${getHeatBg(cnt)}`}>
                        {cnt === 0 ? '✓' : `${cnt} F`}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
