import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  UploadCloud, 
  FileText, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Type, 
  Box, 
  Layers, 
  Zap, 
  X 
} from 'lucide-react';
import SearchableDropdown from '../../components/common/SearchableDropdown';
import {
  getAdapters,
  getReleases,
  getEnhancements,
  createMeetingWithTranscript,
} from './uploadApi';
import type { AdapterOption, ReleaseOption, EnhancementOption } from './uploadApi';
import { toast } from 'react-hot-toast';

// Widths for the animated transcript lines on hover
const DROPZONE_LINES = [100, 85, 95, 70, 90, 50];

export default function Upload() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [selectedAdapter, setSelectedAdapter] = useState<AdapterOption | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseOption | null>(null);
  const [selectedEnhancement, setSelectedEnhancement] = useState<EnhancementOption | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [adapters, setAdapters] = useState<AdapterOption[]>([]);
  const [releases, setReleases] = useState<ReleaseOption[]>([]);
  const [enhancements, setEnhancements] = useState<EnhancementOption[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getAdapters()
      .then(setAdapters)
      .catch(() => toast.error('Failed to load adapters'));
  }, []);

  useEffect(() => {
    if (!selectedAdapter) {
      setReleases([]);
      setSelectedRelease(null);
      setEnhancements([]);
      setSelectedEnhancement(null);
      return;
    }
    getReleases(selectedAdapter.id)
      .then(setReleases)
      .catch(() => setError('Failed to load releases'));
    setSelectedRelease(null);
    setEnhancements([]);
    setSelectedEnhancement(null);
  }, [selectedAdapter]);

  useEffect(() => {
    if (!selectedRelease) {
      setEnhancements([]);
      setSelectedEnhancement(null);
      return;
    }
    getEnhancements(selectedRelease.id)
      .then(setEnhancements)
      .catch(() => setError('Failed to load enhancements'));
    setSelectedEnhancement(null);
  }, [selectedRelease]);

  const handleFileChange = (file: File | null) => {
    if (file && !file.name.match(/\.(vtt|docx|txt)$/i)) {
      setError('Unsupported file format. Please upload .vtt, .docx, or .txt files.');
      return;
    }
    setSelectedFile(file);
    setError('');
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedAdapter || !selectedRelease || !selectedEnhancement || !selectedFile) {
      setError('Please fill out all required fields and attach a transcript file.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await createMeetingWithTranscript({
        title,
        adapterId: selectedAdapter.id,
        releaseId: selectedRelease.id,
        enhancementId: selectedEnhancement.id,
        transcriptFile: selectedFile,
      });
      navigate(`/processing/${result.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 tracking-tight mb-2">
          Upload Transcript
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-base max-w-xl">
          Create a new meeting by uploading a Microsoft Teams transcript. We'll automatically generate your summary and flowchart.
        </p>
      </div>

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="relative bg-white rounded-3xl border border-slate-200 p-6 md:p-10 shadow-sm overflow-hidden">
        
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-gradient-to-br from-teal-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          
          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 px-5 py-4 rounded-2xl animate-in slide-in-from-top-2 fade-in">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
              <Type className="w-4 h-4 text-slate-400" /> Meeting Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
              placeholder="e.g., Q4 Architecture Review"
            />
          </div>

          {/* Cascading Dropdowns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
            {/* Adapter */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                <Box className="w-4 h-4 text-teal-500" /> Adapter <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <SearchableDropdown
                  options={adapters.map(a => a.name)}
                  value={selectedAdapter?.name || ''}
                  onChange={(name) => {
                    const adapter = adapters.find(a => a.name === name);
                    setSelectedAdapter(adapter || null);
                  }}
                  placeholder="Search adapters..."
                />
              </div>
            </div>

            {/* Release */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                <Layers className="w-4 h-4 text-sky-500" /> Release <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-opacity duration-300 ${!selectedAdapter ? 'opacity-50 pointer-events-none' : ''}`}>
                <SearchableDropdown
                  options={releases.map(r => r.name)}
                  value={selectedRelease?.name || ''}
                  onChange={(name) => {
                    const release = releases.find(r => r.name === name);
                    setSelectedRelease(release || null);
                  }}
                  placeholder={selectedAdapter ? "Search releases..." : "Select adapter first"}
                />
              </div>
            </div>

            {/* Enhancement */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                <Zap className="w-4 h-4 text-amber-500" /> Enhancement <span className="text-red-500">*</span>
              </label>
              <div className={`relative transition-opacity duration-300 ${!selectedRelease ? 'opacity-50 pointer-events-none' : ''}`}>
                <SearchableDropdown
                  options={enhancements.map(e => e.name)}
                  value={selectedEnhancement?.name || ''}
                  onChange={(name) => {
                    const enhancement = enhancements.find(e => e.name === name);
                    setSelectedEnhancement(enhancement || null);
                  }}
                  placeholder={selectedRelease ? "Search enhancements..." : "Select release first"}
                />
              </div>
            </div>
          </div>

          {/* Premium Dropzone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
              <FileText className="w-4 h-4 text-slate-400" /> Transcript File <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => !selectedFile && fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (!selectedFile) handleFileChange(e.dataTransfer.files[0] || null);
              }}
              className={`group relative overflow-hidden border-2 border-dashed rounded-3xl p-10 text-center transition-all duration-300 ${
                selectedFile 
                  ? 'border-teal-500 bg-teal-50/40 cursor-default' 
                  : 'border-slate-200 hover:border-teal-400 hover:bg-slate-50/80 hover:shadow-md cursor-pointer active:scale-[0.99]'
              }`}
            >
              {selectedFile ? (
                /* Success State */
                <div className="flex flex-col items-center justify-center gap-3 animate-in zoom-in-95 duration-300">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-teal-200 flex items-center justify-center text-teal-500">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800">{selectedFile.name}</p>
                    <p className="text-sm text-teal-600 font-medium mt-0.5">Ready for processing</p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors shadow-sm"
                  >
                    <X className="w-3.5 h-3.5" /> Remove file
                  </button>
                </div>
              ) : (
                /* Empty Upload State */
                <div className="grid md:grid-cols-[1fr_auto] gap-8 items-center max-w-lg mx-auto">
                  <div className="text-left">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 flex items-center justify-center mb-5 group-hover:bg-teal-50 group-hover:text-teal-500 group-hover:border-teal-200 transition-all duration-300 shadow-sm group-hover:-translate-y-1">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">
                      Select or drop file
                    </h3>
                    <p className="text-slate-500 text-sm mb-4 font-medium leading-relaxed">
                      Upload your exported Teams transcript. We'll extract the insights instantly.
                    </p>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-[11px] font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                      .vtt · .docx · .txt
                    </div>
                  </div>
                  
                  {/* Animated Transcript Extraction on Hover */}
                  <div className="hidden md:flex flex-col justify-center gap-2.5 w-24 pr-4" aria-hidden="true">
                    {DROPZONE_LINES.map((w, i) => (
                      <div
                        key={i}
                        className="h-1.5 rounded-full bg-slate-200 origin-left transition-colors duration-300 group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-cyan-400 group-hover:animate-[generate-text_2s_ease-out_infinite]"
                        style={{ 
                          width: `${w}%`, 
                          animationDelay: `${i * 120}ms`,
                          transitionDelay: `${i * 30}ms` 
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".vtt,.docx,.txt"
                className="hidden"
                onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={submitting || !selectedFile}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 ${
                submitting || !selectedFile
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-teal-600 text-white hover:bg-teal-700 shadow-md hover:shadow-lg active:scale-[0.99] cursor-pointer'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Processing Transcript...
                </>
              ) : (
                'Generate Summary & Flowchart'
              )}
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}