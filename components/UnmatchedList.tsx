import React, { useState } from 'react';
import { Transaction, AIAnalysisResult, TransactionSource } from '../types';
import { analyzeUnmatched } from '../services/geminiService';
import { Sparkles, Loader2, AlertCircle, FileWarning, Search, Bot, Lightbulb, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

interface Props {
  unmatchedBank: Transaction[];
  unmatchedBook: Transaction[];
}

const UnmatchedList: React.FC<Props> = ({ unmatchedBank, unmatchedBook }) => {
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const result = await analyzeUnmatched(unmatchedBank, unmatchedBook);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const getSuggestion = (txId: string) => {
    return analysis?.suggestions.find(s => s.id === txId);
  };

  const getActionColor = (action?: string) => {
    switch (action) {
      case 'ADJUST_BOOK': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'INVESTIGATE': return 'bg-red-100 text-red-700 border-red-200';
      case 'IGNORE': return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getCategoryIcon = (category?: string) => {
     switch (category) {
        case 'FEE': return '💰';
        case 'TIMING': return '⏳';
        case 'ERROR': return '❌';
        case 'MISSING': return '❓';
        default: return '📝';
     }
  };

  const renderTable = (transactions: Transaction[], title: string, themeColor: 'blue' | 'orange') => {
    const isBlue = themeColor === 'blue';
    const borderColor = isBlue ? 'border-blue-100' : 'border-orange-100';
    const headerBg = isBlue ? 'bg-blue-50/50' : 'bg-orange-50/50';
    const textColor = isBlue ? 'text-blue-800' : 'text-orange-800';
    const iconColor = isBlue ? 'text-blue-500' : 'text-orange-500';

    return (
      <div className={`border ${borderColor} rounded-2xl overflow-hidden shadow-sm bg-white flex flex-col h-full`}>
        <div className={`px-5 py-4 font-bold ${headerBg} ${textColor} flex justify-between items-center border-b ${borderColor}`}>
          <div className="flex items-center gap-2">
            <FileWarning size={18} className={iconColor} />
            <span>{title}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full bg-white/60 border ${borderColor}`}>
             {transactions.length} รายการ
          </span>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-500 text-xs uppercase w-[15%]">วันที่</th>
                <th className="px-5 py-3 text-left font-medium text-slate-500 text-xs uppercase w-[25%]">รายละเอียด</th>
                <th className="px-5 py-3 text-right font-medium text-slate-500 text-xs uppercase w-[20%]">จำนวนเงิน</th>
                {analysis && <th className="px-5 py-3 text-left font-medium text-violet-600 text-xs uppercase w-[40%]">AI Analysis</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {transactions.map(tx => {
                const suggestion = getSuggestion(tx.id);
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-3 whitespace-nowrap text-slate-600 align-top">{tx.date}</td>
                    <td className="px-5 py-3 text-slate-800 font-medium align-top">
                      {tx.description}
                      <div className="text-[10px] text-slate-400 font-mono mt-1">ID: {tx.id}</div>
                    </td>
                    <td className="px-5 py-3 text-right font-mono text-slate-700 align-top">{tx.amount.toLocaleString()}</td>
                    {analysis && (
                      <td className="px-5 py-3 align-top">
                         {suggestion ? (
                           <div className="flex flex-col gap-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${getActionColor(suggestion.action)}`}>
                                   {suggestion.action === 'ADJUST_BOOK' && <CheckCircle2 size={10} />}
                                   {suggestion.action === 'INVESTIGATE' && <HelpCircle size={10} />}
                                   {suggestion.action.replace('_', ' ')}
                                </span>
                                <span className="text-[10px] text-slate-400 border border-slate-100 px-1.5 rounded bg-slate-50">
                                   {getCategoryIcon(suggestion.category)} {suggestion.category}
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 leading-snug">
                                {suggestion.reason}
                              </p>
                           </div>
                         ) : (
                           <span className="text-xs text-slate-300 italic">Waiting for analysis...</span>
                         )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {transactions.length === 0 && (
                  <tr>
                      <td colSpan={analysis ? 4 : 3} className="p-8 text-center text-slate-400">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Search size={20} />
                            </div>
                            <span>ไม่พบรายการคงค้าง</span>
                          </div>
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
           <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-rose-500 rounded-full"></div>
                รายการที่ไม่ตรงกัน (Unmatched)
           </h3>
           <p className="text-sm text-slate-500 ml-3.5 mt-1">รายการที่ต้องตรวจสอบและปรับปรุงบัญชี</p>
        </div>
        
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || (unmatchedBank.length === 0 && unmatchedBook.length === 0)}
          className={`group relative flex items-center gap-2 px-6 py-2.5 rounded-full text-white font-medium transition-all shadow-lg shadow-violet-200 
            ${isAnalyzing 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:scale-105 hover:shadow-xl'
            }`}
        >
           {!isAnalyzing && <Sparkles size={18} className="text-yellow-200 animate-pulse" />}
           {isAnalyzing ? (
             <>
               <Loader2 className="animate-spin" size={18} />
               <span>Gemini กำลังวิเคราะห์...</span>
             </>
           ) : (
             <span>วิเคราะห์สาเหตุด้วย AI</span>
           )}
        </button>
      </div>

      {analysis && (
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
             {/* Summary Header */}
             <div className="md:col-span-3 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-violet-200">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                <h4 className="font-bold text-lg flex items-center gap-2 mb-2">
                   <Bot className="text-violet-200" /> ผลการวิเคราะห์จาก Gemini (Key Insights)
                </h4>
                <p className="text-violet-100 text-sm opacity-90">
                   ระบบได้วิเคราะห์ความสัมพันธ์ของข้อมูลและพบสาเหตุความผิดปกติดังนี้
                </p>
             </div>

             {/* Insight Cards */}
             {analysis.insights.map((insight, idx) => (
               <div key={idx} className="bg-white p-5 rounded-xl border border-violet-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-violet-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                  <Lightbulb className="text-violet-500 mb-3 relative z-10" size={24} />
                  <p className="text-slate-700 font-medium relative z-10 leading-relaxed text-sm">
                    {insight}
                  </p>
               </div>
             ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderTable(unmatchedBank, "รายการใน Bank (Missing in Book)", "blue")}
        {renderTable(unmatchedBook, "รายการใน Book (Missing in Bank)", "orange")}
      </div>
      
      {(unmatchedBank.length > 0 || unmatchedBook.length > 0) && !analysis && (
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600 flex gap-3 items-start">
            <AlertCircle size={20} className="mt-0.5 shrink-0 text-slate-400"/>
            <div>
                <p className="font-semibold text-slate-700 mb-1">คำแนะนำเบื้องต้น:</p>
                <p>
                    กดปุ่ม <strong>"วิเคราะห์สาเหตุด้วย AI"</strong> ด้านบน เพื่อให้ระบบช่วยตรวจสอบ Pattern ของข้อมูล 
                    และแนะนำวิธีการลงบัญชีปรับปรุง (Adjusting Entries) อย่างละเอียด
                </p>
            </div>
          </div>
      )}
    </div>
  );
};

export default UnmatchedList;