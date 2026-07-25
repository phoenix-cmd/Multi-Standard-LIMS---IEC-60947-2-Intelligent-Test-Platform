import React from 'react';

export function TrendChartsWidget() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const passData = [8, 12, 10, 14, 9, 6, 4];
  const failData = [1, 0, 2, 1, 0, 0, 1];

  const max = 16;

  return (
    <div className="bg-surface-900 border border-surface-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-surface-100">Test Execution & Throughput Trend</h3>
          <p className="text-xs text-surface-400">Daily pass vs fail count over current week</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> Pass
          </span>
          <span className="flex items-center gap-1 text-red-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-sm bg-red-500" /> Fail
          </span>
        </div>
      </div>

      {/* SVG Bar Chart */}
      <div className="h-48 flex items-end justify-between gap-2 pt-4 border-b border-surface-800">
        {days.map((day, i) => {
          const passH = (passData[i] / max) * 100;
          const failH = (failData[i] / max) * 100;
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
              <div className="w-full flex items-end justify-center gap-1 h-full">
                <div
                  className="w-3 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-400"
                  style={{ height: `${passH}%` }}
                  title={`${day} Pass: ${passData[i]}`}
                />
                {failData[i] > 0 && (
                  <div
                    className="w-3 bg-red-500 rounded-t transition-all group-hover:bg-red-400"
                    style={{ height: `${failH}%` }}
                    title={`${day} Fail: ${failData[i]}`}
                  />
                )}
              </div>
              <span className="text-[10px] text-surface-400 font-mono mt-2">{day}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
