"use client"

import React, { useState, useEffect } from "react"
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  Calendar,
  Zap,
  ShieldCheck,
  Search
} from "lucide-react"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts'
import { motion } from "framer-motion"

const data = [
  { name: 'Jan', revenue: 4000, nodes: 12 },
  { name: 'Feb', revenue: 3000, nodes: 15 },
  { name: 'Mar', revenue: 5000, nodes: 18 },
  { name: 'Apr', revenue: 4500, nodes: 22 },
  { name: 'May', revenue: 6000, nodes: 30 },
  { name: 'Jun', revenue: 8000, nodes: 42 },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
     // Fetch Global Stats Simulation (Will be real API later)
     setTimeout(() => {
        setStats({
          totalTenants: 42,
          activeUsers: 890,
          grossRevenue: 124500,
          growthRate: 15.4
        })
        setLoading(false)
     }, 1000)
  }, [])

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-12 h-12 text-[#13ec80] animate-spin" /></div>

  const metrics = [
    { label: "Total Active Tenants", value: stats.totalTenants, icon: Building2, color: "text-[#13ec80]", bg: "bg-[#13ec80]/10", trend: "+12.5%" },
    { label: "Total Platform Users", value: stats.activeUsers, icon: Users, color: "text-[#7c3aed]", bg: "bg-[#7c3aed]/10", trend: "+8.2%" },
    { label: "Gross SaaS Revenue", value: `$${stats.grossRevenue.toLocaleString()}`, icon: CreditCard, color: "text-[#dCAA2E]", bg: "bg-[#dCAA2E]/10", trend: "+24.1%" },
    { label: "Growth Index", value: `${stats.growthRate}%`, icon: TrendingUp, color: "text-[#0ea5e9]", bg: "bg-[#0ea5e9]/10", trend: "+2.3%" },
  ]

  return (
    <div className="flex flex-col gap-12 animate-in fade-in duration-700">
       <header className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/5 rounded-full w-fit">
             <Zap className="w-3.5 h-3.5 text-[#13ec80] fill-[#13ec80]" />
             <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#13ec80]">Global Command Center</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter italic uppercase">Ecosystem Rituals</h1>
          <p className="text-[#958da1] text-sm font-bold uppercase tracking-widest leading-relaxed">System-wide monitoring and intelligence orchestration.</p>
       </header>

       {/* Grid Metrics */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <motion.div 
              key={m.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-[2.5rem] bg-[#161b2b]/40 border border-white/5 hover:border-[#13ec80]/30 transition-all duration-500 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowUpRight className={`w-5 h-5 ${m.color}`} />
               </div>
               <div className={`w-14 h-14 rounded-2xl ${m.bg} flex items-center justify-center ${m.color} mb-6 shadow-lg shadow-black/40`}>
                  <m.icon className="w-6 h-6" />
               </div>
               <p className="text-[#4a4455] text-[0.65rem] font-bold uppercase tracking-[0.15em] mb-2">{m.label}</p>
               <div className="flex items-baseline gap-3">
                  <h3 className="text-3xl font-black text-white tracking-tight">{m.value}</h3>
                  <span className="text-[#13ec80] text-[0.65rem] font-bold">{m.trend}</span>
               </div>
            </motion.div>
          ))}
       </div>

       {/* Charts Section */}
       <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-8 p-10 rounded-[3rem] bg-[#161b2b]/40 border border-white/5 shadow-2xl relative overflow-hidden h-[500px]"
          >
             <div className="flex items-center justify-between mb-12 relative z-10">
                <div>
                   <h3 className="text-xl font-bold text-white tracking-tight">Revenue Trajectory</h3>
                   <p className="text-[#4a4455] text-[0.6rem] font-bold uppercase tracking-widest mt-1">Gross Annualized Recurring Revenue</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 p-2 bg-[#050505] rounded-xl border border-white/5">
                      <div className="w-2 h-2 rounded-full bg-[#13ec80]" />
                      <span className="text-[0.65rem] font-bold text-[#958da1]">Projected</span>
                   </div>
                </div>
             </div>
             
             <div className="h-[300px] w-full relative z-10">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#13ec80" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#13ec80" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                   <XAxis dataKey="name" stroke="#4a4455" fontSize={10} axisLine={false} tickLine={false} />
                   <YAxis hide />
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#050505', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}
                     itemStyle={{ color: '#13ec80', fontSize: '12px', fontWeight: 'bold' }}
                   />
                   <Area type="monotone" dataKey="revenue" stroke="#13ec80" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </motion.div>

          {/* Quick Actions / Recent Activity */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-4 flex flex-col gap-6"
          >
             <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-[#13ec80] to-[#0f8b50] text-[#050505] shadow-2xl group cursor-pointer relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                <h3 className="text-3xl font-black italic uppercase leading-none mb-2 relative z-10">System Audit</h3>
                <p className="text-[#050505]/60 text-xs font-bold uppercase tracking-widest relative z-10">Verify Platform Integrity</p>
                <div className="mt-8 flex justify-between items-center relative z-10">
                   <ShieldCheck className="w-8 h-8" />
                   <div className="p-3 bg-[#050505] rounded-full text-[#13ec80]">
                      <ArrowUpRight className="w-5 h-5" />
                   </div>
                </div>
             </div>

             <div className="p-8 rounded-[2.5rem] bg-[#161b2b]/40 border border-white/5 flex flex-col gap-6 grow">
                <h4 className="text-white text-sm font-bold uppercase tracking-widest flex items-center gap-3">
                   <Zap className="w-4 h-4 text-[#13ec80]" />
                   SaaS Pulse
                </h4>
                
                <div className="space-y-6">
                   {[
                     { label: "New Salon Onboarded", time: "2m ago", salon: "Velvet Glow" },
                     { label: "Subscription Upgrade", time: "1h ago", salon: "Elite Cuts" },
                     { label: "Invoicing Complete", time: "4h ago", salon: "38 Tenants" },
                   ].map((item, i) => (
                     <div key={i} className="flex gap-4 group">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#13ec80] mt-2 shadow-[0_0_10px_#13ec80]" />
                        <div>
                           <p className="text-xs font-bold text-white tracking-tight">{item.label}</p>
                           <p className="text-[0.65rem] font-medium text-[#4a4a4a] uppercase tracking-widest mt-1">{item.salon} • {item.time}</p>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
       </div>
    </div>
  )
}
