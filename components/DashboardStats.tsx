import React from 'react';
import { ReconciliationResult } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { CheckCircle, AlertCircle, AlertTriangle, Activity, Database, Landmark } from 'lucide-react';

interface Props {
  result: ReconciliationResult;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, bgClass, gradientFrom, gradientTo }: any) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start space-x-4 hover:shadow-md transition-shadow duration-300">
    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradientFrom} ${gradientTo} text-white shadow-lg shadow-${colorClass}/20`}>
      <Icon size={24} />
    </div>
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{value}</h3>
      {subtext && <p className={`text-xs mt-1 ${bgClass} inline-block px-2 py-0.5 rounded-full font-medium ${colorClass}`}>{subtext}</p>}
    </div>
  </div>
);

const DashboardStats: React.FC<Props> = ({ result }) => {
  const data = [
    { name: 'จับคู่ได้ (Matched)', value: result.stats.matchedCount },
    { name: 'ไม่พบใน Book', value: result.stats.unmatchedBankCount },
    { name: 'ไม่พบใน Bank', value: result.stats.unmatchedBookCount },
  ];

  const totalTx = result.stats.totalBank + result.stats.totalBook;
  const matchRate = totalTx > 0 ? Math.round((result.stats.matchedCount * 2 / totalTx) * 100) : 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard 
          title="จับคู่สำเร็จ" 
          value={result.stats.matchedCount} 
          subtext={`${matchRate}% Complete`}
          icon={CheckCircle}
          colorClass="text-emerald-700"
          bgClass="bg-emerald-50"
          gradientFrom="from-emerald-400"
          gradientTo="to-emerald-600"
        />

        <StatCard 
          title="Bank คงเหลือ" 
          value={result.stats.unmatchedBankCount} 
          subtext="Source of Truth"
          icon={Landmark}
          colorClass="text-blue-700"
          bgClass="bg-blue-50"
          gradientFrom="from-blue-400"
          gradientTo="to-blue-600"
        />

        <StatCard 
          title="Book คงเหลือ" 
          value={result.stats.unmatchedBookCount} 
          subtext="ต้องตรวจสอบ"
          icon={Database}
          colorClass="text-orange-700"
          bgClass="bg-orange-50"
          gradientFrom="from-orange-400"
          gradientTo="to-orange-600"
        />

        <StatCard 
          title="ผลต่าง (Diff)" 
          value={result.stats.totalDifference.toLocaleString(undefined, { minimumFractionDigits: 2 })} 
          subtext={result.stats.totalDifference === 0 ? "Perfect Match" : "Balance Mismatch"}
          icon={Activity}
          colorClass={result.stats.totalDifference === 0 ? "text-emerald-700" : "text-rose-700"}
          bgClass={result.stats.totalDifference === 0 ? "bg-emerald-50" : "bg-rose-50"}
          gradientFrom={result.stats.totalDifference === 0 ? "from-emerald-400" : "from-rose-400"}
          gradientTo={result.stats.totalDifference === 0 ? "to-emerald-600" : "to-rose-600"}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-50 p-6 rounded-2xl border border-slate-100 relative overflow-hidden">
          <div className="relative z-10 flex flex-col justify-center h-full">
            <h4 className="text-lg font-bold text-slate-800 mb-2">สรุปผลการ Reconcile</h4>
            <p className="text-slate-500 text-sm mb-6">
              ระบบสามารถจับคู่รายการได้ทั้งหมด <span className="font-semibold text-brand-600">{result.stats.matchedCount} คู่</span> 
              จากรายการทั้งหมด {result.stats.totalBank + result.stats.totalBook} รายการ คิดเป็นความสำเร็จ {matchRate}%
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-semibold">Total Bank Items</p>
                <p className="text-xl font-bold text-slate-800">{result.stats.totalBank}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-semibold">Total Book Items</p>
                <p className="text-xl font-bold text-slate-800">{result.stats.totalBook}</p>
              </div>
            </div>
          </div>
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-brand-100 opacity-50 blur-3xl"></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4 self-start">Distribution</h4>
          <div className="h-48 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 600, color: '#334155' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="block text-2xl font-bold text-slate-800">{result.stats.unmatchedBankCount + result.stats.unmatchedBookCount}</span>
              <span className="block text-[10px] text-slate-400 uppercase font-bold">Pending</span>
            </div>
          </div>
          <div className="flex justify-center gap-3 mt-4 text-xs">
            {data.map((entry, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                <span className="text-slate-500 font-medium">{entry.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;