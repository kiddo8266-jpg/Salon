"use client"

import React, { useState, useEffect } from "react"
import { 
  CreditCard, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCcw, 
  ArrowUpRight,
  TrendingUp,
  Activity,
  History,
  FileText
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"

export default function BillingManagement() {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchInvoices()
  }, [])

  async function fetchInvoices() {
    try {
      const res = await fetch("/api/admin/billing/generate")
      const data = await res.json()
      setInvoices(data)
    } catch (err) {
      console.error("Failed to fetch invoices")
    } finally {
      setLoading(false)
    }
  }

  const runBillingRitual = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/admin/billing/generate", { method: "POST" })
      const data = await res.json()
      setMessage(data.message)
      fetchInvoices()
      setTimeout(() => setMessage(""), 5000)
    } catch (err) {
      console.error("Billing ritual failed")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full w-fit mb-4">
              <CreditCard className="w-3.5 h-3.5 text-[#13ec80]" />
              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#13ec80]">Financial Rituals</span>
           </div>
           <h1 className="text-4xl font-black text-white tracking-tighter italic uppercase">Global Invoicing</h1>
           <p className="text-[#958da1] text-sm font-bold uppercase tracking-widest mt-2 leading-relaxed">System-wide automated billing and revenue orchestration.</p>
        </div>

        <button 
          onClick={runBillingRitual}
          disabled={syncing}
          className="group relative flex items-center gap-3 bg-[#13ec80] text-black px-10 py-4 rounded-[2rem] font-black uppercase italic tracking-tighter hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#13ec80]/30 disabled:opacity-50"
        >
           {syncing ? <Activity className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-black" />}
           <span>Invoke Billing Rites</span>
           <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity rounded-[2rem]" />
        </button>
      </header>

      <AnimatePresence>
         {message && (
            <motion.div 
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -20 }}
               className="p-6 rounded-[2rem] bg-[#13ec80]/10 border border-[#13ec80]/20 flex items-center gap-4"
            >
               <CheckCircle2 className="w-6 h-6 text-[#13ec80]" />
               <p className="text-sm font-bold text-[#13ec80] uppercase tracking-widest">{message}</p>
            </motion.div>
         )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         {/* Total Financial Exposure */}
         <div className="lg:col-span-12 xl:col-span-8 space-y-6">
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 mb-6">
               <History className="w-4 h-4 text-[#13ec80]" />
               Recent Invoice Nexus
            </h4>
            
            <div className="overflow-hidden rounded-[3rem] bg-[#161b2b]/40 border border-white/5 backdrop-blur-3xl shadow-2xl">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-[#050505]/40 border-b border-white/5">
                        <th className="px-8 py-6 text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">Salon Node</th>
                        <th className="px-8 py-6 text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">Amount</th>
                        <th className="px-8 py-6 text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">Ritual Period</th>
                        <th className="px-8 py-6 text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">SaaS Status</th>
                        <th className="px-8 py-6 text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">Actions</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                     {loading ? (
                        <tr><td colSpan={5} className="px-8 py-20 text-center"><Activity className="w-8 h-8 animate-spin mx-auto text-[#13ec80]" /></td></tr>
                     ) : invoices.map((inv, i) => (
                        <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                           <td className="px-8 py-8">
                              <div className="flex flex-col">
                                 <span className="text-sm font-bold text-white tracking-tight">{inv.tenant.name}</span>
                                 <span className="text-[0.65rem] font-medium text-[#4a4455] uppercase tracking-widest mt-1">/{inv.tenant.slug}</span>
                              </div>
                           </td>
                           <td className="px-8 py-8">
                              <span className="text-base font-black text-[#13ec80] tracking-tighter">${inv.amount}</span>
                           </td>
                           <td className="px-8 py-8">
                              <span className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest leading-loose">
                                 {format(new Date(inv.periodStart), 'MMM d')} - {format(new Date(inv.periodEnd), 'MMM d')}
                              </span>
                           </td>
                           <td className="px-8 py-8">
                              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border w-fit ${
                                 inv.status === 'PAID' 
                                 ? 'bg-[#13ec80]/10 border-[#13ec80]/20 text-[#13ec80]' 
                                 : 'bg-red-500/10 border-red-500/20 text-red-500'
                              }`}>
                                 {inv.status === 'PAID' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                 <span className="text-[0.6rem] font-black uppercase tracking-widest">{inv.status}</span>
                              </div>
                           </td>
                           <td className="px-8 py-8">
                              <button className="p-3 bg-white/5 rounded-2xl border border-white/5 text-[#4a4455] group-hover:text-white transition-all">
                                 <FileText className="w-4 h-4" />
                              </button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Right Sidebar: Revenue Insight */}
         <div className="lg:col-span-12 xl:col-span-4 space-y-8">
            <h4 className="text-white text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3">
               <TrendingUp className="w-4 h-4 text-[#dCAA2E]" />
               Revenue Intelligence
            </h4>

            <div className="p-10 rounded-[3rem] bg-[#161b2b]/40 border border-white/5 flex flex-col gap-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8">
                  <ArrowUpRight className="w-6 h-6 text-[#13ec80]" />
               </div>
               <div>
                  <p className="text-[#4a4455] text-[0.6rem] font-black uppercase tracking-widest mb-2">Projected MRR</p>
                  <h3 className="text-5xl font-black text-white tracking-tighter italic leading-none">$12,450.00</h3>
               </div>
               
               <div className="space-y-6 pt-6 border-t border-white/5">
                  {[
                     { label: "Pending Collection", val: "$8,200", color: "text-[#dCAA2E]" },
                     { label: "Successful Rites", val: "$4,250", color: "text-[#13ec80]" },
                  ].map((m, i) => (
                     <div key={i} className="flex justify-between items-center">
                        <span className="text-[0.65rem] font-bold text-[#4a4b5f] uppercase tracking-widest">{m.label}</span>
                        <span className={`text-base font-black ${m.color} tracking-tight`}>{m.val}</span>
                     </div>
                  ))}
               </div>

               <div className="mt-4 p-6 rounded-3xl bg-[#13ec80]/5 border border-[#13ec80]/10 flex flex-col gap-4">
                  <p className="text-[0.65rem] font-bold text-[#13ec80] uppercase tracking-widest leading-loose">
                     System-wide collection rate is <span className="text-white">12% higher</span> than previous oracle cycle.
                  </p>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: "75%" }}
                        className="h-full bg-[#13ec80]"
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
