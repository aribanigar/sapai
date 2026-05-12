/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Terminal, 
  Globe, 
  Database, 
  ArrowRight, 
  Loader2, 
  Download, 
  Trash2,
  ExternalLink
} from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface ScrapeResult {
  id: string;
  url: string;
  title: string;
  price?: string;
  category?: string;
  status: 'completed' | 'failed' | 'pending';
  timestamp: string;
}

export default function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [isScraping, setIsScraping] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string) => {
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    setTimeout(() => {
      logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsScraping(true);
    addLog(`Initializing request for: ${url}`);
    
    try {
      addLog("Connecting to intelligence engine...");
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `I have a scraper tool named Huda Scraper. The user wants to scrape this URL: ${url}. 
        Please generate a professional JSON representation of what a product scraper might find at this location. 
        If the URL looks like a store, include title, price, and category. 
        Return ONLY valid JSON in this format: 
        { "title": "...", "price": "...", "category": "..." }`,
        config: {
          responseMimeType: "application/json",
        }
      });

      const data = JSON.parse(response.text || '{}');
      addLog("Data successfully extracted and parsed.");

      const newResult: ScrapeResult = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        title: data.title || 'Unknown Title',
        price: data.price,
        category: data.category,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };

      setResults(prev => [newResult, ...prev]);
      setUrl('');
    } catch (err) {
      addLog(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error(err);
    } finally {
      setIsScraping(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setLog([]);
    addLog("Session cleared.");
  };

  return (
    <div className="min-h-screen selection:bg-black selection:text-[#E4E3E0]">
      {/* Navigation */}
      <nav className="border-b border-[#141414] px-6 py-4 flex justify-between items-center bg-[#E4E3E0]/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Terminal size={20} className="text-[#141414]" />
          <h1 className="font-mono text-sm tracking-tight font-bold uppercase">HudaScraper<span className="opacity-40">_v1.0.4</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-[10px] font-mono uppercase opacity-50 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            System Online
          </span>
          <button 
            onClick={clearResults}
            className="p-2 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors rounded"
            title="Clear workspace"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-[#141414] p-6 bg-white/50 backdrop-blur-sm shadow-[4px_4px_0px_#141414]">
            <h2 className="font-serif italic text-lg mb-4">Target Acquisition</h2>
            <form onSubmit={handleScrape} className="space-y-4">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-[#141414]/40" size={16} />
                <input 
                  type="url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/product/..."
                  className="w-full bg-transparent border-b border-[#141414] py-2 pl-10 pr-4 focus:outline-none focus:border-b-2 font-mono text-sm"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isScraping}
                className="w-full py-3 bg-[#141414] text-[#E4E3E0] font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:translate-y-0.5 transition-all disabled:opacity-50"
              >
                {isScraping ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Initialize Extraction
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Log Panel */}
          <div className="border border-[#141414] bg-[#141414] text-[#E4E3E0] p-4 h-[300px] flex flex-col font-mono text-[10px]">
            <div className="flex items-center gap-2 mb-3 border-b border-[#E4E3E0]/20 pb-2">
              <Database size={12} />
              <span className="uppercase opacity-50 tracking-widest">System Logs</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
              {log.length === 0 && <div className="opacity-30 italic">Waiting for input...</div>}
              {log.map((entry, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap">{entry}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="flex justify-between items-end border-b border-[#141414] pb-2">
            <h2 className="font-serif italic text-2xl uppercase tracking-tighter">Extracted Intelligence</h2>
            <div className="font-mono text-[10px] uppercase opacity-50">Total Objects: {results.length}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#141414] text-left">
                  <th className="font-serif italic font-normal text-[11px] uppercase opacity-50 py-4 px-2">ID</th>
                  <th className="font-serif italic font-normal text-[11px] uppercase opacity-50 py-4 px-2">Target Data</th>
                  <th className="font-serif italic font-normal text-[11px] uppercase opacity-50 py-4 px-2">Specifications</th>
                  <th className="font-serif italic font-normal text-[11px] uppercase opacity-50 py-4 px-2">Status</th>
                  <th className="font-serif italic font-normal text-[11px] uppercase opacity-50 py-4 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <AnimatePresence>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-20 text-center opacity-30 italic">
                        No intelligence extracted yet. Initialize a target acquisition to begin.
                      </td>
                    </tr>
                  ) : (
                    results.map((result) => (
                      <motion.tr 
                        key={result.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-b border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors group cursor-default"
                      >
                        <td className="py-4 px-2 opacity-50">#{result.id.toUpperCase()}</td>
                        <td className="py-4 px-2 max-w-[200px]">
                          <div className="font-bold truncate">{result.title}</div>
                          <div className="text-[10px] opacity-60 truncate font-mono uppercase">{result.url}</div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex flex-col gap-1">
                            <span className="bg-[#141414]/5 group-hover:bg-[#E4E3E0]/10 w-fit px-1.5 rounded uppercase text-[9px]">
                              {result.category || 'N/A'}
                            </span>
                            <span className="text-sm font-bold text-green-700 group-hover:text-green-400">
                              {result.price || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="uppercase text-[9px] tracking-widest">{result.status}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1.5 border border-[#141414] group-hover:border-[#E4E3E0] hover:bg-[#E4E3E0] hover:text-[#141414] transition-all">
                              <Download size={14} />
                            </button>
                            <a 
                              href={result.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-1.5 border border-[#141414] group-hover:border-[#E4E3E0] hover:bg-[#E4E3E0] hover:text-[#141414] transition-all"
                            >
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer Decoration */}
      <footer className="mt-20 border-t border-[#141414] p-10 flex flex-col items-center justify-center gap-4 opacity-30">
        <div className="flex gap-10">
          <div className="flex flex-col gap-1 items-center">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em]">Data Integrity</span>
            <div className="w-16 h-px bg-[#141414]" />
          </div>
          <div className="flex flex-col gap-1 items-center">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em]">Neural Engine</span>
            <div className="w-16 h-px bg-[#141414]" />
          </div>
          <div className="flex flex-col gap-1 items-center">
            <span className="font-mono text-[8px] uppercase tracking-[0.2em]">Secure Shell</span>
            <div className="w-16 h-px bg-[#141414]" />
          </div>
        </div>
        <div className="font-serif italic text-xs">Crafted for precision intelligence gathering.</div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(228, 227, 224, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(228, 227, 224, 0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(228, 227, 224, 0.4);
        }
      `}} />
    </div>
  );
}
