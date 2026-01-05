export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col">
            <header className="border-b border-white/10 p-4 flex items-center justify-between bg-slate-900/50 backdrop-blur">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    Qudah Authority Admin
                </h1>
                <nav className="flex gap-4 text-sm text-slate-400">
                    <a href="/" className="hover:text-white transition-colors">View Site</a>
                    <span className="w-px h-4 bg-white/10" />
                    <span className="text-blue-400">Knowledge Base</span>
                </nav>
            </header>
            <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
                {children}
            </main>
        </div>
    );
}
