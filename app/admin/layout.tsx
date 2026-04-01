"use client"

import React, { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect, usePathname } from "next/navigation"
import { 
  BarChart3, 
  Users, 
  Building2, 
  CreditCard, 
  Settings, 
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Zap,
  Globe,
  Plus
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [isSidebarOpen, setSidebarOpen] = useState(true)

  // Role Protection
  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.role !== "SUPER_ADMIN") {
      redirect("/login")
    }
  }, [session, status])

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
       <div className="w-12 h-12 border-4 border-[#13ec80]/20 border-t-[#13ec80] rounded-full animate-spin" />
    </div>
  )

  const navItems = [
    { name: "Overview", icon: BarChart3, path: "/admin" },
    { name: "Tenants", icon: Building2, path: "/admin/tenants" },
    { name: "Global Users", icon: Users, path: "/admin/users" },
    { name: "Billing Rituals", icon: CreditCard, path: "/admin/billing" },
    { name: "SaaS Settings", icon: Settings, path: "/admin/settings" },
  ]

  return (
    <div className="min-h-screen bg-[#050505] text-[#dee1f7] flex font-sans selection:bg-[#13ec80]/30 selection:text-white">
      {/* Premium Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            className="fixed lg:relative z-50 w-72 h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col p-6 shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header: Global Identity */}
            <div className="flex items-center gap-4 mb-12 px-2">
               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#13ec80] to-[#0f8b50] flex items-center justify-center shadow-lg shadow-[#13ec80]/20 group">
                  <ShieldCheck className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
               </div>
               <div>
                  <h1 className="text-xl font-black tracking-tighter text-white">SYSTEM</h1>
                  <p className="text-[0.65rem] font-bold text-[#4a4a4a] uppercase tracking-widest italic">WellnessOS Control</p>
               </div>
            </div>

            {/* Global Nav */}
            <nav className="flex-1 space-y-2">
               {navItems.map((item) => {
                 const isActive = pathname === item.path
                 return (
                   <Link 
                     key={item.path} 
                     href={item.path}
                     className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                       isActive 
                        ? 'bg-gradient-to-r from-[#13ec80]/10 to-transparent text-[#13ec80] border border-[#13ec80]/10' 
                        : 'text-[#4a4a4a] hover:bg-white/5 hover:text-white'
                     }`}
                   >
                      <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-[#13ec80]' : 'group-hover:text-white'}`} />
                      <span className="text-sm font-bold tracking-tight">{item.name}</span>
                      {isActive && <motion.div layoutId="nav-dot" className="w-1.5 h-1.5 rounded-full bg-[#13ec80] ml-auto" />}
                   </Link>
                 )
               })}
            </nav>

            {/* Footer: User ritual */}
            <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
               <div className="flex items-center gap-4 px-2">
                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1c2237] to-[#0e1322] flex items-center justify-center text-white border border-white/10 font-black italic">
                   {session?.user.name?.charAt(0)}
                 </div>
                 <div className="grow">
                    <p className="text-xs font-bold truncate max-w-[120px] text-white tracking-tight">{session?.user.name}</p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#13ec80]/10 border border-[#13ec80]/20 w-fit">
                       <Zap className="w-2 h-2 text-[#13ec80] fill-[#13ec80]" />
                       <span className="text-[0.55rem] font-bold text-[#13ec80] uppercase tracking-widest">Global Admin</span>
                    </div>
                 </div>
               </div>
               <button className="flex items-center gap-3 p-4 text-[#4a4a4a] hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-bold">Logout Ritual</span>
               </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 h-screen overflow-y-auto relative bg-gradient-to-br from-[#050505] via-[#080808] to-[#050505]">
         <header className="sticky top-0 z-40 bg-[#050505]/40 backdrop-blur-xl border-b border-white/5 px-8 h-20 flex items-center justify-between">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              className="p-3 bg-white/5 rounded-2xl border border-white/5 text-[#4a4a4a] hover:text-white transition-all"
            >
               {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-6">
               <div className="hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-white/5 border border-white/5">
                  <Globe className="w-4 h-4 text-[#13ec80]" />
                  <span className="text-xs font-bold text-[#958da1]">System Status: <span className="text-[#13ec80]">Operational</span></span>
               </div>
               <Link href="/admin/tenants/new" className="flex items-center gap-2 bg-[#13ec80] text-black px-6 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#13ec80]/20">
                  <Plus className="w-4 h-4" />
                  <span>Provision Tenant</span>
               </Link>
            </div>
         </header>

         <div className="p-8 lg:p-12 max-w-7xl mx-auto">
            {children}
         </div>
      </main>
    </div>
  )
}
