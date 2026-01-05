'use client';

import * as React from 'react';
import { createKnowledgeEntry, deleteKnowledgeEntry, getKnowledgeEntries, uploadKnowledgeFile } from '@/app/actions/knowledge';
import { Plus, Trash2, Save, Loader2, Sparkles, FileText, Upload, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function KnowledgePage() {
    const [entries, setEntries] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isSaving, setIsSaving] = React.useState(false);

    // Form State
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [inputType, setInputType] = React.useState<'text' | 'file'>('text');

    // Text Mode
    const [title, setTitle] = React.useState('');
    const [content, setContent] = React.useState('');
    const [tags, setTags] = React.useState('');

    // File Mode
    const [file, setFile] = React.useState<File | null>(null);

    const loadEntries = React.useCallback(async () => {
        setIsLoading(true);
        const data = await getKnowledgeEntries();
        setEntries(data);
        setIsLoading(false);
    }, []);

    React.useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        let result;

        if (inputType === 'text') {
            result = await createKnowledgeEntry({ title, content, tags });
        } else {
            if (!file) return;
            const formData = new FormData();
            formData.append('file', file);
            formData.append('tags', tags);
            result = await uploadKnowledgeFile(formData);
        }

        if (result.success) {
            setTitle('');
            setContent('');
            setTags('');
            setFile(null);
            setIsFormOpen(false);
            await loadEntries();
        } else {
            alert('Error: ' + result.message);
        }

        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure? This will remove the knowledge from the AI brain immediately.')) return;
        await deleteKnowledgeEntry(id);
        await loadEntries();
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-white">Knowledge Base</h2>
                    <p className="text-slate-400 mt-1">Teach your AI new facts, or upload documents.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Knowledge</span>
                </button>
            </div>

            {/* Create Form Modal/Panel */}
            {isFormOpen && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl relative animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        New Knowledge Entry
                    </h3>

                    <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg w-fit">
                        <button
                            onClick={() => setInputType('text')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                inputType === 'text' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Type className="w-4 h-4" />
                            Manual Text
                        </button>
                        <button
                            onClick={() => setInputType('file')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                                inputType === 'file' ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-white"
                            )}
                        >
                            <Upload className="w-4 h-4" />
                            Upload File
                        </button>
                    </div>

                    <form onSubmit={handleCreate} className="space-y-4">

                        {inputType === 'text' ? (
                            <>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Title / Topic</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="e.g. My Preferred Tech Stack"
                                        className="w-full bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Content</label>
                                    <textarea
                                        required
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="Write the detailed knowledge here. The AI will use this to answer questions."
                                        className="w-full h-40 bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none resize-none leading-relaxed"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="border-2 border-dashed border-slate-700 hover:border-blue-500/50 rounded-xl p-8 transition-colors bg-black/20 text-center">
                                <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-300 font-medium mb-1">Upload PDF or Word Document</p>
                                <p className="text-xs text-slate-500 mb-4">Support English & Arabic</p>
                                <input
                                    type="file"
                                    accept=".pdf,.docx"
                                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-slate-400
                                      file:mr-4 file:py-2 file:px-4
                                      file:rounded-full file:border-0
                                      file:text-sm file:font-semibold
                                      file:bg-blue-600 file:text-white
                                      hover:file:bg-blue-500"
                                />
                                {file && (
                                    <p className="mt-2 text-sm text-blue-400 font-mono">{file.name} selected</p>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wide">Tags (Comma separated)</label>
                            <input
                                value={tags}
                                onChange={e => setTags(e.target.value)}
                                placeholder="e.g. report, resume, project-a"
                                className="w-full bg-black/40 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsFormOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || (inputType === 'file' && !file)}
                                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
                            >
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Save to Brain</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
                </div>
            ) : entries.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                    <p className="text-slate-500">No knowledge entries found. Add one to get started.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {entries.map((entry) => (
                        <div key={entry.id} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-6 transition-all group">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-lg font-medium text-blue-100 flex items-center gap-2">
                                    {entry.title.includes('Part') ? <FileText className="w-4 h-4 text-slate-400" /> : <Sparkles className="w-4 h-4 text-amber-400" />}
                                    {entry.title}
                                </h4>
                                <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="text-slate-600 hover:text-red-400 transition-colors p-2 -mr-2 -mt-2 opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed mb-4 font-mono text-xs opacity-70">
                                {entry.content.slice(0, 150)}...
                            </p>
                            <div className="flex items-center gap-2">
                                {entry.tags?.map((tag: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-xs font-medium">
                                        #{tag}
                                    </span>
                                ))}
                                <span className="ml-auto text-xs text-slate-600">
                                    {new Date(entry.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
