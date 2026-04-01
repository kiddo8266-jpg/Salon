import React from "react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"

export default async function PublicSalonLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const { slug } = params

  const tenant = await prisma.tenant.findUnique({
    where: { slug }
  })

  if (!tenant) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0e1322] text-[#dee1f7] font-sans selection:bg-[#7c3aed]/30">
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --brand-color: ${tenant.themeColor || '#7c3aed'};
        }
      `}} />
      
      {/* Public Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#161b2b]/80 backdrop-blur-xl border-b border-[#4a4455]/10 z-50 px-6">
        <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.name} className="w-10 h-10 object-contain" />
            ) : (
              <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] text-sm font-bold">
                {tenant.name.charAt(0)}
              </span>
            )}
            <h1 className="text-xl font-bold tracking-tight text-white">{tenant.name}</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#ccc3d8]">
            <a href={`/s/${slug}`} className="hover:text-white transition-colors">About</a>
            <a href={`/s/${slug}/book`} className="bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-[#7c3aed]/20 hover:scale-105 transition-transform active:scale-95">
              Book Now
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="py-12 px-6 border-t border-[#4a4455]/10 mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 group">
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-white font-bold text-lg mb-2">{tenant.name}</h3>
            <p className="text-[#958da1] text-sm">{tenant.address || "Wellness space powered by WellnessOS"}</p>
          </div>
          
          <div className="text-[#4a4455] text-xs font-medium tracking-widest uppercase group-hover:text-[#958da1] transition-colors">
            Powered by WellnessOS
          </div>
        </div>
      </footer>
    </div>
  )
}
