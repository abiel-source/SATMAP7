"use client";

export function GlobeLoader() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-space-950 gap-6">
      <div>
        <p
          className="font-display font-black text-4xl tracking-[0.4em] text-accent-cyan"
          style={{ textShadow: "0 0 40px rgba(0,200,255,0.6)" }}
        >
          SATMAP7
        </p>
        <p className="text-white/30 text-xs tracking-[0.25em] uppercase text-center mt-1">
          Initializing
        </p>
      </div>

      {/* Loading bar */}
      <div className="w-64 h-px bg-white/10 overflow-hidden">
        <div
          className="h-full bg-accent-cyan"
          style={{
            boxShadow: "0 0 12px #00c8ff",
            animation: "loadBar 1.8s ease-in-out infinite",
          }}
        />
      </div>

      <style>{`
          @keyframes loadBar {
            0%   { width: 0%;   margin-left: 0%; }
            50%  { width: 60%;  margin-left: 20%; }
            100% { width: 0%;   margin-left: 100%; }
          }
        `}</style>
    </div>
  );
}
