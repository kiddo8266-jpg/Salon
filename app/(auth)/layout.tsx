import React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full bg-[#0e1322] text-[#dee1f7] overflow-hidden flex flex-col items-center justify-center font-sans tracking-tight">
      {/* Ethereal Architect: Ambient Glows & Mesh Layers */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#7C3AED]/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-[#d2bbff]/10 blur-[160px] rounded-full pointer-events-none" />
      
      {/* Floating UI Container */}
      <div className="relative z-10 w-full max-w-md px-6 z-10">
        {children}
      </div>
    </div>
  )
}
