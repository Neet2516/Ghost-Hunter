export default function HomePage() {
  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="border border-ink p-8 bg-paper shadow-hard">
        <span className="inline-block px-3 py-1 bg-phantom text-ink font-mono text-xs uppercase tracking-wider mb-4 rounded-full">
          Status: Ready to hunt
        </span>
        <h1 className="text-5xl font-black tracking-tight mb-4">
          Silence is data.
        </h1>
        <p className="text-lg text-ash leading-relaxed mb-6">
          Ghost-Hunter is an autonomous, durable follow-up agent for job and internship outreach powered by Temporal and local Gemma.
        </p>
      </div>
    </main>
  );
}
