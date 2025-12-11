import React, { useState } from 'react';
import { performSemanticSearch } from '../../services/geminiService';
import { SearchResult } from '../../types';
import { useStore } from '../../store/useStore';
import { Icons } from '../Icons';

export const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Use store to "Save" content
  const { addNote } = useStore();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    const data = await performSemanticSearch(query);
    setResults(data);
    setLoading(false);
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'bg-teal-100 text-teal-800 border-teal-200';
    if (score >= 70) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-orange-100 text-orange-800 border-orange-200';
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative flex-none">
        <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask anything..."
          className="w-full bg-white border border-gray-200 pl-10 pr-12 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
        />
        {loading && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin h-4 w-4 border-2 border-teal-500 border-t-transparent rounded-full" />
        )}
      </form>

      {/* Results */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {!hasSearched && (
          <div className="flex flex-col items-center justify-center mt-10 text-gray-400">
             <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                <Icons.Search size={24} className="opacity-50" />
             </div>
             <p className="text-xs font-medium">Search the web & local notes</p>
          </div>
        )}

        {hasSearched && !loading && results.length === 0 && (
          <div className="text-center mt-10 text-gray-500 text-sm">
            No high-quality results found.
          </div>
        )}

        {results.map((res, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-gray-100 hover:border-teal-300 hover:shadow-lg transition-all group relative overflow-hidden">
            {/* Quality Score Badge */}
            <div className={`absolute top-0 right-0 px-2 py-1 rounded-bl-lg border-l border-b text-[10px] font-bold ${getQualityColor(res.qualityScore)}`}>
               {res.qualityScore} QS
            </div>

            <div className="pr-8">
              <h4 className="font-bold text-gray-800 text-sm group-hover:text-teal-700 leading-tight mb-1 cursor-pointer hover:underline">
                <a href={res.url} target="_blank" rel="noreferrer">{res.title}</a>
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 uppercase tracking-wider mb-2">
                 <span>{res.source}</span>
                 <span>•</span>
                 <span>{res.date}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-600 line-clamp-2 mb-3 leading-relaxed">{res.snippet}</p>
            
            {/* Actions Toolbar */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-50 opacity-80 group-hover:opacity-100 transition-opacity">
               <button 
                 onClick={addNote}
                 className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 hover:bg-teal-50 text-gray-600 hover:text-teal-700 text-[10px] font-medium transition-colors"
               >
                 <Icons.FileText size={12} /> Save Note
               </button>
               <button className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-700 text-[10px] font-medium transition-colors">
                 <Icons.Sparkles size={12} /> Summarize
               </button>
               <a 
                 href={res.url} 
                 target="_blank" 
                 rel="noreferrer"
                 className="ml-auto text-gray-400 hover:text-gray-700"
               >
                 <Icons.ExternalLink size={12} />
               </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};