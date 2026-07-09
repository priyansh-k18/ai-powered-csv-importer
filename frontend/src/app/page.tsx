"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { 
  UploadCloud, CheckCircle, AlertCircle, Loader2, 
  LayoutDashboard, Users, FileSpreadsheet, Settings, 
  X, Search, Plus, MoreVertical, Phone, Mail, 
  MessageSquare, Briefcase, ChevronRight
} from 'lucide-react';
import axios from 'axios';

type AppState = 'idle' | 'upload' | 'preview' | 'processing';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [importedRecords, setImportedRecords] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ imported: 0, skipped: 0 });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const selectedFile = acceptedFiles[0];
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    
    setError(null);
    setFile(selectedFile);
    
    // Parse for preview
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (results) => {
        if (results.data.length > 0) {
          setPreviewHeaders(Object.keys(results.data[0] as object));
          setPreviewData(results.data);
          setAppState('preview');
        } else {
          setError('CSV file appears to be empty.');
        }
      },
      error: (err) => {
        setError('Error parsing CSV: ' + err.message);
      }
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  const handleConfirm = async () => {
    if (!file) return;
    setAppState('processing');
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/upload';
      const response = await axios.post(apiUrl, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setImportedRecords(prev => [...response.data.records, ...prev]);
      setStats({
        imported: stats.imported + response.data.total_imported,
        skipped: stats.skipped + response.data.total_skipped
      });
      setAppState('idle');
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'An error occurred during processing.');
      setAppState('preview');
    }
  };

  const closeModal = () => {
    setAppState('idle');
    setFile(null);
    setError(null);
  };

  // Helper for Status Pills
  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('good') || s.includes('done')) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">{status}</span>;
    }
    if (s.includes('bad') || s.includes('not')) {
      return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">{status}</span>;
    }
    return <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-200 dark:border-slate-500/30">{status || 'UNKNOWN'}</span>;
  };

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#09090b] text-[#09090b] dark:text-[#fafafa] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#09090b] flex-shrink-0 flex flex-col h-full hidden md:flex">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800/50">
          <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-black font-bold text-xl leading-none">G</span>
          </div>
          <span className="font-bold text-xl tracking-tight">GrowEasy</span>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-3 p-3 mb-6 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
              TC
            </div>
            <div>
              <p className="text-sm font-semibold">Test Corp</p>
              <p className="text-xs text-gray-500">Owner</p>
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Main</p>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <LayoutDashboard className="w-5 h-5" /> <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <Users className="w-5 h-5" /> <span className="text-sm font-medium">Generate Leads</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-medium transition-colors border border-indigo-100 dark:border-indigo-500/20">
              <FileSpreadsheet className="w-5 h-5" /> <span className="text-sm font-semibold">Manage Leads</span>
            </a>
          </nav>

          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-8 mb-3 px-3">Control Center</p>
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <Briefcase className="w-5 h-5" /> <span className="text-sm font-medium">Team Members</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <MessageSquare className="w-5 h-5" /> <span className="text-sm font-medium">WhatsApp Account</span>
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <Settings className="w-5 h-5" /> <span className="text-sm font-medium">Settings</span>
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 border-b border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-[#09090b]/50 backdrop-blur-md flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Your Leads</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitor lead status, assign tasks, and close deals faster.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-900 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            <button 
              onClick={() => setAppState('upload')}
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Import CSV
            </button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Leads</p>
              <p className="text-3xl font-bold">{importedRecords.length}</p>
            </div>
            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Successfully Imported</p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.imported}</p>
            </div>
            <div className="bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Skipped / Invalid</p>
              <p className="text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.skipped}</p>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-5 rounded-2xl shadow-sm text-white flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-20"><Users className="w-16 h-16" /></div>
              <p className="text-sm font-medium opacity-90 mb-1">AI Pipeline</p>
              <p className="text-lg font-bold">Active & Ready</p>
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white dark:bg-[#121214] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 dark:bg-[#18181b] border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lead Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Source</th>
                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                  {importedRecords.length > 0 ? (
                    importedRecords.map((record: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">{record.name || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{record.created_at ? new Date(record.created_at).toLocaleDateString() : 'No date'}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Mail className="w-3.5 h-3.5" /> {record.email || '-'}
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                              <Phone className="w-3.5 h-3.5" /> {record.country_code ? `+${record.country_code} ` : ''}{record.mobile_without_country_code || '-'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">{record.company || '-'}</td>
                        <td className="px-6 py-4">
                          {getStatusBadge(record.crm_status)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-medium bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-gray-600 dark:text-gray-400">
                            {record.data_source || 'Manual'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <FileSpreadsheet className="w-12 h-12 mb-4 opacity-20" />
                          <p className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-1">No leads found</p>
                          <p className="text-sm mb-6 max-w-sm">Get started by importing your raw CSV files. Our AI will automatically map and clean the data for you.</p>
                          <button 
                            onClick={() => setAppState('upload')}
                            className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 text-black dark:text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                          >
                            Import First CSV
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {importedRecords.length > 0 && (
               <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#18181b] flex justify-center">
                 <button className="text-sm font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1">
                   Load More <ChevronRight className="w-4 h-4" />
                 </button>
               </div>
            )}
          </div>
        </div>

        {/* Modal Overlay for Upload Workflow */}
        {appState !== 'idle' && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            
            <div className="bg-white dark:bg-[#121214] w-full max-w-3xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800/60">
                <div>
                  <h2 className="text-xl font-bold">Import Leads via CSV</h2>
                  <p className="text-sm text-gray-500 mt-1">Upload a CSV file to bulk import leads into your system.</p>
                </div>
                {appState !== 'processing' && (
                  <button onClick={closeModal} className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-700 dark:text-red-400 flex items-start rounded-xl text-sm">
                    <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Upload State */}
                {appState === 'upload' && (
                  <div 
                    {...getRootProps()} 
                    className={`rounded-xl p-10 text-center border-2 border-dashed transition-all duration-200 cursor-pointer flex flex-col items-center justify-center bg-gray-50 dark:bg-[#09090b] ${isDragActive ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10' : 'border-gray-300 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                  >
                    <input {...getInputProps()} />
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4 border border-gray-100 dark:border-gray-700">
                      <UploadCloud className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">Drop your CSV file here</h3>
                    <p className="text-gray-500 text-sm mb-6">or click to browse files</p>
                    
                    <div className="bg-gray-100 dark:bg-gray-900 text-xs text-gray-500 p-3 rounded-lg max-w-sm mx-auto">
                      <span className="font-semibold block mb-1 text-gray-700 dark:text-gray-300">Supported format: .csv (Max 5MB)</span>
                      Our AI will automatically detect headers like names, emails, phone numbers, and statuses.
                    </div>
                  </div>
                )}

                {/* Preview State */}
                {appState === 'preview' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-[#09090b] p-4 rounded-xl border border-gray-200 dark:border-gray-800">
                       <div className="flex items-center gap-3">
                         <div className="bg-indigo-100 dark:bg-indigo-900/50 p-2 rounded text-indigo-600 dark:text-indigo-400">
                           <FileSpreadsheet className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="font-semibold text-sm">{file?.name}</p>
                           <p className="text-xs text-gray-500">Previewing first 5 rows</p>
                         </div>
                       </div>
                       <button onClick={() => setAppState('upload')} className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
                         Change file
                       </button>
                    </div>

                    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs whitespace-nowrap">
                          <thead className="bg-gray-50 dark:bg-[#18181b] text-gray-500 border-b border-gray-200 dark:border-gray-800">
                            <tr>
                              {previewHeaders.map((header, idx) => (
                                <th key={idx} className="px-4 py-3 font-semibold uppercase tracking-wider">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                            {previewData.map((row, rowIdx) => (
                              <tr key={rowIdx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/20">
                                {previewHeaders.map((header, colIdx) => (
                                  <td key={colIdx} className="px-4 py-3 text-gray-700 dark:text-gray-300">
                                    {row[header]?.toString() || '-'}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Processing State */}
                {appState === 'processing' && (
                  <div className="py-12 text-center flex flex-col items-center justify-center">
                    <div className="relative mb-6">
                      <div className="w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900/50 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400 animate-[spin_3s_linear_infinite_reverse]" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Analyzing CSV Data</h3>
                    <p className="text-gray-500 text-sm max-w-sm mx-auto">
                      AI is dynamically mapping columns, standardizing dates, formatting phone numbers, and identifying lead owners...
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              {appState !== 'processing' && (
                <div className="p-6 border-t border-gray-100 dark:border-gray-800/60 bg-gray-50 dark:bg-[#09090b] flex justify-end gap-3 rounded-b-2xl">
                  <button 
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={appState === 'preview' ? handleConfirm : undefined}
                    disabled={appState === 'upload'}
                    className={`px-6 py-2.5 rounded-lg font-semibold shadow-sm transition-all text-sm flex items-center gap-2 ${
                      appState === 'preview' 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600' 
                        : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {appState === 'preview' ? 'Upload & Import' : 'Select a file first'}
                  </button>
                </div>
              )}

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
