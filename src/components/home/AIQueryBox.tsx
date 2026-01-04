'use client';

import * as React from 'react';
import { useChat } from '@ai-sdk/react';
import { Button } from '@/components/ui/button';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
// React import merged to top.
// Placeholder UI components since we haven't fully implemented Shadcn yet
// We will use raw Tailwind classes for now to speed up logic implementation.

export function AIQueryBox() {
    const { messages, append, isLoading } = useChat({
        api: '/api/ai/query',
        onError: (error: any) => {
            console.error('AI Chat Error:', error);
            alert('Failed to send message: ' + (error?.message || String(error)));
        }
    } as any) as any;
    const [query, setQuery] = React.useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('handleSubmit called', { query, isLoading });

        if (!query.trim()) {
            console.log('Query empty, returning');
            return;
        }

        if (isLoading) {
            console.log('isLoading is true, blocking submission');
            // optional: Force it anyway for debugging?
            // return; 
        }

        try {
            console.log('Calling append...');
            await append({ role: 'user', content: query });
            console.log('Append success');
            setQuery('');
        } catch (err) {
            console.error('Append failed:', err);
            alert('Error sending: ' + String(err));
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6">
            {/* Output Area */}
            <div className="min-h-[200px] max-h-[500px] overflow-y-auto space-y-4 p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-white/50 space-y-2 py-10">
                        <Sparkles className="w-8 h-8 opacity-50" />
                        <p>Ask me about my tech stack or projects...</p>
                    </div>
                )}

                {messages.map((m: any) => (
                    <div
                        key={m.id}
                        className={cn(
                            "p-4 rounded-lg text-sm leading-relaxed",
                            m.role === 'user'
                                ? "bg-blue-600/20 border border-blue-500/30 ml-auto max-w-[85%]"
                                : "bg-white/10 border border-white/10 mr-auto max-w-[90%]"
                        )}
                    >
                        <span className="block text-xs font-bold mb-1 opacity-70 uppercase tracking-wider">
                            {m.role === 'user' ? 'You' : 'Qudah-GPT'}
                        </span>
                        {m.content}
                    </div>
                ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSubmit} className="relative group">
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="How do you architect Next.js apps?"
                    className="w-full bg-slate-900/50 text-white placeholder:text-slate-500 border border-slate-800 rounded-full px-6 py-4 pr-14 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                />
                <button
                    type="submit"
                    disabled={isLoading || !query.trim()}
                    className="absolute right-2 top-2 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-full transition-colors"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
