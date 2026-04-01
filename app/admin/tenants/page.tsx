"use client"

import React, { useState, useEffect } from "react"
import { 
  Building2, 
  Search, 
  Filter, 
  MoreVertical, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  CreditCard,
  Building,
  User,
  Activity,
  ArrowRight
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function TenantManagement() {
  const [tenants, setTenants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetchTenants()
  }, [])

  async function fetchTenants() {
    try {
      const res = await fetch("/api/admin/tenants")
      const data = await res.json()
      setTenants(data)
    } catch (err) {
      console.error("Failed to fetch tenants:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredTenants = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.slug.toLowerCase().includes(search.toLowerCase())
  )

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch("/api/admin/tenants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !currentStatus })
      })
      fetchTenants()
    } catch (err) {
      console.error("Update failed")
    }
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full w-fit mb-4">
              <Building2 className="w-3.5 h-3.5 text-[#13ec80]" />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#13ec80]">SaaS Directory</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Tenant Rituals</h1>
           <p className="text-[#958da1] text-sm font-bold uppercase tracking-widest mt-2 leading-relaxed">System-wide administration of business nodes.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a4455] group-hover:text-[#13ec80] transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name or slug..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#161b2b]/40 border border-white/5 rounded-2xl pl-12 pr-4 py-3 placeholder-[#4a4455] text-sm text-white focus:border-[#13ec80]/30 outline-none transition-all shadow-xl"
            />
          </div>
          <button className="p-3 bg-[#161b2b]/40 border border-white/5 rounded-2xl text-[#958da1] hover:text-white transition-all">
             <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 text-[#13ec80]"><Activity className="w-10 h-10 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
           <AnimatePresence>
              {filteredTenants.map((t, i) => (
                <motion.div 
                  key={t.id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative p-8 rounded-[3rem] bg-[#161b2b]/40 border border-white/5 hover:border-[#13ec80]/30 transition-all duration-500 overflow-hidden"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-6 opacity-40 group-hover:opacity-100 transition-opacity">
                     <div className={`w-3 h-3 rounded-full ${t.isActive ? 'bg-[#13ec80] shadow-[0_0_15px_#13ec80]' : 'bg-red-500'}`} />
                  </div>

                  <div className="flex items-center gap-6 mb-8">
                     <div className="w-16 h-16 rounded-[1.5rem] bg-[#2f3445] flex items-center justify-center text-white border border-white/10 text-2xl font-black italic shadow-2xl">
                        {t.logoUrl ? <img src={t.logoUrl} className="w-full h-full object-contain" /> : t.name.charAt(0)}
                     </div>
                     <div>
                        <h3 className="text-xl font-bold text-white tracking-tight truncate max-w-[120px]">{t.name}</h3>
                        <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest mt-1">/{t.slug}</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                     <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-[0.55rem] font-bold text-[#4a4455] uppercase tracking-[0.1em] mb-1">Ritual Service</p>
                        <div className="flex items-center gap-2">
                           <Activity className="w-3.5 h-3.5 text-[#7c3aed]" />
                           <span className="text-sm font-bold text-white">{t._count.services}</span>
                        </div>
                     </div>
                     <div className="p-4 rounded-2xl bg-black/20 border border-white/5">
                        <p className="text-[0.55rem] font-bold text-[#4a4455] uppercase tracking-[0.1em] mb-1">SaaS Goal</p>
                        <div className="flex items-center gap-2">
                           <CreditCard className="w-3.5 h-3.5 text-[#dCAA2E]" />
                           <span className="text-sm font-bold text-white">{t.planType}</span>
                        </div>
                     </div>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-white/5">
                     <div className="flex gap-2">
                        <button 
                          onClick={() => toggleStatus(t.id, t.isActive)}
                          className={`p-2.5 rounded-xl border transition-all ${
                            t.isActive 
                            ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white' 
                            : 'bg-[#13ec80]/10 border-[#13ec80]/20 text-[#13ec80] hover:bg-[#13ec80] hover:text-black'
                          }`}
                        >
                           {t.isActive ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                        </button>
                        <button className="p-2.5 bg-[#161b2b] border border-white/5 rounded-xl text-[#958da1] hover:text-white transition-all">
                           <Edit3 className="w-4 h-4" />
                        </button>
                     </div>
                     <Link 
                       href={`/s/${t.slug}`} 
                       target="_blank"
                       className="flex items-center gap-2 text-[#958da1] hover:text-white text-[0.65rem] font-bold uppercase tracking-widest transition-colors"
                     >
                       Visit Space <ArrowRight className="w-3.5 h-3.5" />
                     </Link>
                  </div>
                </motion.div>
              ))}
           </AnimatePresence>

           {/* Quick Action: Provision New */}
           <motion.div
             initial={{ y: 20, opacity: 0 }}
             animate={{ y: 0, opacity: 1 }}
             className="group relative p-8 rounded-[3rem] bg-transparent border-2 border-dashed border-[#4a4455]/20 hover:border-[#13ec80]/40 transition-all duration-500 flex flex-col items-center justify-center gap-4 cursor-pointer"
           >
              <div className="w-16 h-16 rounded-full bg-[#161b2b] border border-white/10 flex items-center justify-center text-[#4a4455] group-hover:text-[#13ec80] group-hover:scale-110 transition-all">
                 <Building className="w-8 h-8" />
              </div>
              <div className="text-center">
                 <h4 className="text-white font-bold group-hover:text-[#d2bbff] transition-colors">Invoke New Node</h4>
                 <p className="text-[#4a4455] text-xs font-medium uppercase mt-1">Tenant Provisioning</p>
              </div>
           </motion.div>
        </div>
      )}
    </div>
  )
}
