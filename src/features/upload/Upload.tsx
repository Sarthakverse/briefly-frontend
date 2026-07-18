import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, FileText } from 'lucide-react';
import SearchableDropdown from '../../components/common/SearchableDropdown';
import {
  getAdapters,
  getReleases,
  getEnhancements,
  createMeetingWithTranscript,
} from './uploadApi';
import type { AdapterOption, ReleaseOption, EnhancementOption } from './uploadApi';

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
      .catch(() => setError('Failed to load adapters'));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedAdapter || !selectedRelease || !selectedEnhancement || !selectedFile) {
      setError('Please fill all fields and select a file.');
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
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Transcript</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Q4 Architecture Review"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Adapter *</label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Release *</label>
          <SearchableDropdown
            options={releases.map(r => r.name)}
            value={selectedRelease?.name || ''}
            onChange={(name) => {
              const release = releases.find(r => r.name === name);
              setSelectedRelease(release || null);
            }}
            placeholder="Search releases..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enhancement *</label>
          <SearchableDropdown
            options={enhancements.map(e => e.name)}
            value={selectedEnhancement?.name || ''}
            onChange={(name) => {
              const enhancement = enhancements.find(e => e.name === name);
              setSelectedEnhancement(enhancement || null);
            }}
            placeholder="Search enhancements..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Transcript File *</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFileChange(e.dataTransfer.files[0] || null);
            }}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-blue-50/30 transition cursor-pointer"
          >
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-6 w-6 text-blue-500" />
                <span className="text-gray-700">{selectedFile.name}</span>
              </div>
            ) : (
              <>
                <UploadCloud className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Drag & drop a transcript, or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Supports .vtt, .docx, .txt
                </p>
              </>
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

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Creating meeting...' : 'Upload & Create Meeting'}
        </button>
      </form>
    </div>
  );
}