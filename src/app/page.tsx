import { AIQueryBox } from "@/components/home/AIQueryBox";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <section className="relative flex-1 flex flex-col items-center justify-center py-20 px-4 text-center space-y-12">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950 z-[-1]" />

        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium tracking-wide">
            SYSTEM ONLINE • V2.0.0
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
            Architecting the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Future of Web</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Explore the mind of Mohammad Al Qudah. A personal knowledge base powered by
            RAG and Next.js 15.
          </p>
        </div>

        <AIQueryBox />

      </section>
    </div>
  );
}
