import React from 'react';
import { MatchPair, MatchStatus } from '../types';
import { ArrowRight, BadgeCheck, AlertOctagon, Calendar, FileText, ListChecks } from 'lucide-react';

interface Props {
  matches: MatchPair[];
}

const MatchList: React.FC<Props> = ({ matches }) => {
  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="bg-slate-50 p-4 rounded-full mb-3">
            <ListChecks size={32} />
        </div>
        <p>ยังไม่มีรายการที่จับคู่ได้</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-green-500 rounded-full"></div>
            รายการที่จับคู่แล้ว (Matched)
        </h3>
        <span className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full font-medium">
            ทั้งหมด {matches.length} รายการ
        </span>
      </div>

      <div className="overflow-hidden border border-slate-200 rounded-xl shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-slate-50/80 text-slate-500 font-semibold uppercase text-xs tracking-wider backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4">สถานะ (Status)</th>
              <th className="px-6 py-4 w-[35%]">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Bank (Source)
                </div>
              </th>
              <th className="px-2 py-4"></th>
              <th className="px-6 py-4 w-[35%]">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Book (GL)
                </div>
              </th>
              <th className="px-6 py-4 text-right">จำนวนเงิน</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                    match.status === MatchStatus.MATCHED 
                      ? 'bg-green-50 text-green-700 border-green-100' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-100'
                  }`}>
                    {match.status === MatchStatus.MATCHED ? (
                      <BadgeCheck size={14} className="fill-green-100" />
                    ) : (
                      <AlertOctagon size={14} className="fill-yellow-100" />
                    )}
                    {match.status === MatchStatus.MATCHED ? 'Exact Match' : 'Fuzzy Match'}
                  </span>
                </td>
                
                {/* Bank Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                         <Calendar size={12} /> {match.bankTx.date}
                    </div>
                    <div className="font-medium text-slate-800 line-clamp-1" title={match.bankTx.description}>
                      {match.bankTx.description}
                    </div>
                  </div>
                </td>

                <td className="px-2 py-4 text-center">
                  <div className="bg-slate-100 p-1.5 rounded-full inline-block group-hover:bg-brand-100 group-hover:text-brand-600 transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </td>

                {/* Book Column */}
                <td className="px-6 py-4">
                   <div className="flex flex-col">
                    <div className={`flex items-center gap-2 text-xs mb-1 ${match.status === MatchStatus.FUZZY ? 'text-yellow-600 font-medium' : 'text-slate-400'}`}>
                         <Calendar size={12} /> {match.bookTx.date}
                    </div>
                    <div className="font-medium text-slate-800 line-clamp-1" title={match.bookTx.description}>
                      {match.bookTx.description}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 text-right">
                    <span className="font-mono font-bold text-slate-700 text-base">
                        {match.bankTx.amount.toLocaleString()}
                    </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MatchList;