import React, { useState, useEffect } from 'react';
import { Upload, FileText, RefreshCw, BarChart3, ListChecks, AlertOctagon, ArrowRightLeft, Sparkles, Database } from 'lucide-react';
import { Transaction, TransactionSource, ReconciliationResult } from './types';
import { parseCSV, generateSampleData } from './utils/csvHelper';
import { reconcileData } from './services/reconciliationService';
import DashboardStats from './components/DashboardStats';
import MatchList from './components/MatchList';
import UnmatchedList from './components/UnmatchedList';

enum Tab {
  DASHBOARD = 'DASHBOARD',
  MATCHED = 'MATCHED',
  UNMATCHED = 'UNMATCHED',
}

const App: React.FC = () => {
  const [bankData, setBankData] = useState<Transaction[]>([]);
  const [bookData, setBookData] = useState<Transaction[]>([]);
  const [result, setResult] = useState<ReconciliationResult | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.DASHBOARD);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, source: TransactionSource) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      try {
        const data = parseCSV(text, source);
        if (source === TransactionSource.BANK) setBankData(data);
        else setBookData(data);
      } catch (err) {
        alert('เกิดข้อผิดพลาดในการอ่านไฟล์: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    const { bankCSV, bookCSV } = generateSampleData();
    setBankData(parseCSV(bankCSV, TransactionSource.BANK));
    setBookData(parseCSV(bookCSV, TransactionSource.BOOK));
  };

  useEffect(() => {
    if (bankData.length > 0 && bookData.length > 0) {
      setIsProcessing(true);
      // Simulate processing delay for UX
      setTimeout(() => {
        const res = reconcileData(bankData, bookData);
        setResult(res);
        setIsProcessing(false);
      }, 800);
    } else {
      setResult(null);
    }
  }, [bankData, bookData]);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      {/* Decorative Background */}
      <div className="fixed top-0 left-0 right-0 h-64 bg-gradient-to-br from-brand-900 via-brand-800 to-indigo-900 -z-10" />

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/10 border-b border-white/10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-xl border border-white/20 shadow-inner backdrop-blur-sm">
              <RefreshCw className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Smart Reconcile AI</h1>
              <p className="text-brand-100 text-xs font-medium opacity-90">Automated Financial Matching</p>
            </div>
          </div>
          <button 
            onClick={loadSampleData}
            className="text-sm text-white hover:text-white font-medium px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all shadow-sm backdrop-blur-sm flex items-center gap-2"
          >
            <Database size={16} />
            โหลดข้อมูลตัวอย่าง
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-2">
        
        {/* Upload Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Bank Card */}
          <div className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 group
            ${bankData.length > 0 
              ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' 
              : 'bg-white/95 border-white/20 shadow-lg hover:shadow-xl backdrop-blur-sm'}`}>
            
            <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
               <FileText size={120} className="text-blue-600 transform rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${bankData.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'} transition-colors`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Bank Statement</h2>
                    <p className="text-xs text-slate-500">ข้อมูลจากธนาคาร</p>
                  </div>
                </div>
                {bankData.length > 0 && (
                  <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full border border-blue-200 shadow-sm">
                    {bankData.length} รายการ
                  </span>
                )}
              </div>
              
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${bankData.length > 0 
                    ? 'border-blue-300 bg-blue-50/50' 
                    : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50/30'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {bankData.length > 0 ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-full mb-2">
                        <ListChecks className="text-green-600" size={24} />
                      </div>
                      <p className="text-sm text-blue-900 font-medium">อัปโหลดเรียบร้อย</p>
                      <p className="text-xs text-blue-600 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-blue-500 transition-colors" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold text-blue-600">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง</p>
                      <p className="text-xs text-slate-400">CSV (Date, Description, Amount)</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, TransactionSource.BANK)} />
              </label>
            </div>
          </div>

          {/* Book Card */}
          <div className={`relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 group
            ${bookData.length > 0 
              ? 'bg-white border-orange-200 shadow-md ring-1 ring-orange-100' 
              : 'bg-white/95 border-white/20 shadow-lg hover:shadow-xl backdrop-blur-sm'}`}>
            
             <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
               <Database size={120} className="text-orange-600 transform -rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl ${bookData.length > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'} transition-colors`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Book / GL</h2>
                    <p className="text-xs text-slate-500">ข้อมูลสมุดบัญชีบริษัท</p>
                  </div>
                </div>
                 {bookData.length > 0 && (
                  <span className="text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                    {bookData.length} รายการ
                  </span>
                )}
              </div>
              
              <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all
                  ${bookData.length > 0 
                    ? 'border-orange-300 bg-orange-50/50' 
                    : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50/30'}`}>
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                   {bookData.length > 0 ? (
                    <>
                      <div className="bg-green-100 p-2 rounded-full mb-2">
                        <ListChecks className="text-green-600" size={24} />
                      </div>
                      <p className="text-sm text-orange-900 font-medium">อัปโหลดเรียบร้อย</p>
                      <p className="text-xs text-orange-600 mt-1">คลิกเพื่อเปลี่ยนไฟล์</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mb-3 text-slate-400 group-hover:text-orange-500 transition-colors" />
                      <p className="mb-2 text-sm text-slate-500"><span className="font-semibold text-orange-600">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง</p>
                      <p className="text-xs text-slate-400">CSV (Date, Description, Amount)</p>
                    </>
                  )}
                </div>
                <input type="file" accept=".csv" className="hidden" onChange={(e) => handleFileUpload(e, TransactionSource.BOOK)} />
              </label>
            </div>
          </div>
        </div>

        {/* Processing State */}
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/60 shadow-lg">
            <div className="relative">
              <div className="absolute inset-0 bg-brand-400 rounded-full blur opacity-20 animate-pulse"></div>
              <RefreshCw className="animate-spin text-brand-600 relative z-10" size={48} />
            </div>
            <p className="text-slate-600 font-medium mt-6 text-lg">กำลังวิเคราะห์และจับคู่ข้อมูล...</p>
            <p className="text-slate-400 text-sm mt-2">AI กำลังทำงาน กรุณารอสักครู่</p>
          </div>
        )}

        {/* Results Area */}
        {!isProcessing && result && (
          <div className="animate-fade-in space-y-6">
            
            {/* Custom Tab Navigation (Pill Shape) */}
            <div className="flex justify-center">
              <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex space-x-1">
                {[
                  { id: Tab.DASHBOARD, label: 'ภาพรวม (Dashboard)', icon: BarChart3 },
                  { id: Tab.MATCHED, label: `จับคู่สำเร็จ (${result.stats.matchedCount})`, icon: ListChecks },
                  { id: Tab.UNMATCHED, label: `ไม่ตรงกัน (${result.stats.unmatchedBankCount + result.stats.unmatchedBookCount})`, icon: AlertOctagon },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200
                      ${activeTab === tab.id 
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-200 scale-[1.02]' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                      }`}
                  >
                    <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Container */}
            <div className="bg-white rounded-3xl shadow-soft border border-slate-100 p-8 min-h-[500px] transition-all">
              {activeTab === Tab.DASHBOARD && <DashboardStats result={result} />}
              {activeTab === Tab.MATCHED && <MatchList matches={result.matches} />}
              {activeTab === Tab.UNMATCHED && (
                <UnmatchedList 
                  unmatchedBank={result.unmatchedBank} 
                  unmatchedBook={result.unmatchedBook} 
                />
              )}
            </div>
          </div>
        )}

        {!isProcessing && !result && (
          <div className="flex flex-col items-center justify-center py-24 bg-white/80 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 shadow-sm group hover:border-brand-300 transition-colors">
            <div className="relative mb-6">
               <div className="absolute inset-0 bg-brand-200 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
               <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 relative z-10">
                 <ArrowRightLeft className="text-brand-500" size={40} />
               </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800">พร้อมเริ่มงานหรือยัง?</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto text-center leading-relaxed">
              อัปโหลดไฟล์ <span className="text-blue-600 font-medium">Bank Statement</span> และ <span className="text-orange-600 font-medium">Book CSV</span> <br/>
              เพื่อเริ่มระบบ AI Reconciliation อัตโนมัติ
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;