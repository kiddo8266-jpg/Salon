"use client"

import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  MoreHorizontal, 
  ChevronRight, 
  ArrowUpRight, 
  Search, 
  Filter, 
  Loader2,
  Database,
  Banknote,
  Globe,
  ArrowDownLeft,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from "lucide-react"
import { format } from "date-fns"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts"

export default function PaymentsPage() {
  const [loading, setLoading] = useState(true)
  const [payments, setPayments] = useState<any[]>([])
  const [popularServices, setPopularServices] = useState<any[]>([])
  const [sourceData, setSourceData] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    todayRevenue: 0,
    transactionCount: 0
  })

  useEffect(() => {
    fetchPayments()
  }, [])

  async function fetchPayments() {
    setLoading(true)
    try {
      const res = await fetch("/api/payments")
      const data = await res.json()
      if (Array.isArray(data)) {
        setPayments(data)
        calculateStats(data)
        processAnalytics(data)
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err)
    } finally {
      setLoading(false)
    }
  }

  const processAnalytics = (data: any[]) => {
    // 1. Service Popularity
    const serviceMap: Record<string, { name: string, value: number, count: number }> = {}
    const sources = { "Public": 0, "Walk-in": 0 }

    data.forEach(p => {
      const sName = p.appointment.service.name
      if (!serviceMap[sName]) {
        serviceMap[sName] = { name: sName, value: 0, count: 0 }
      }
      serviceMap[sName].value += p.amount
      serviceMap[sName].count += 1

      // Heuristic: ONLINE/CARD often implies public/pre-booked vs CASH for walk-in
      if (p.method === 'ONLINE') sources["Public"] += p.amount
      else sources["Walk-in"] += p.amount
    })

    const topServices = Object.values(serviceMap)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)

    setPopularServices(topServices)
    setSourceData([
      { name: 'Public', value: sources["Public"] },
      { name: 'Walk-in', value: sources["Walk-in"] }
    ])
  }

  const calculateStats = (data: any[]) => {
    const now = new Date()
    const today = format(now, "yyyy-MM-dd")
    const thisMonth = format(now, "yyyy-MM")

    let total = 0
    let monthly = 0
    let daily = 0

    data.forEach(p => {
      total += p.amount
      const pDate = new Date(p.createdAt)
      if (format(pDate, "yyyy-MM-dd") === today) {
        daily += p.amount
      }
      if (format(pDate, "yyyy-MM") === thisMonth) {
        monthly += p.amount
      }
    })

    setStats({
      totalRevenue: total,
      monthlyRevenue: monthly,
      todayRevenue: daily,
      transactionCount: data.length
    })
  }

  const getMethodIcon = (method: string) => {
    switch(method) {
      case 'CARD': return <CreditCard className="w-4 h-4" />
      case 'ONLINE': return <Globe className="w-4 h-4" />
      case 'BANK_TRANSFER': return <ArrowDownLeft className="w-4 h-4" />
      default: return <Banknote className="w-4 h-4" />
    }
  }

  const COLORS = ['#7c3aed', '#13ec80', '#d2bbff', '#f472b6', '#3b82f6']

  return (
    <div className="flex flex-col gap-8 w-full h-full pb-24">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-none">
            Revenue.
          </h1>
          <p className="text-[#ccc3d8] text-lg font-light mt-2">
            Track your wellness space's financial performance.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
            <input 
              type="text" 
              placeholder="Search transactions..."
              className="w-full bg-[#161b2b]/95 text-white rounded-[1rem] border border-[#4a4455]/15 focus:border-[#7c3aed]/50 placeholder:text-[#4a4455] py-3 pl-11 pr-4 transition-all duration-300 outline-none text-sm font-medium"
            />
          </div>

          <button className="flex items-center gap-2 bg-[#2f3445]/40 hover:bg-[#2f3445]/80 text-[#dee1f7] border border-[#4a4455]/15 font-medium px-5 py-3 rounded-[1rem] transition-all duration-300 shadow-sm shrink-0">
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
        </div>
      </section>

      {/* Revenue Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Revenue", value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, trend: "+12.5%", color: "text-[#13ec80]", bg: "bg-[#13ec80]/10" },
          { label: "This Month", value: `$${stats.monthlyRevenue.toFixed(2)}`, icon: TrendingUp, trend: "+8.2%", color: "text-[#d2bbff]", bg: "bg-[#d2bbff]/10" },
          { label: "Today's Gross", value: `$${stats.todayRevenue.toFixed(2)}`, icon: ArrowUpRight, trend: "+5.1%", color: "text-[#13ec80]", bg: "bg-[#13ec80]/10" },
          { label: "Total Invoices", value: stats.transactionCount, icon: Calendar, trend: "Stable", color: "text-[#dee1f7]", bg: "bg-[#2f3445]/50" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[2rem] p-6 hover:border-[#7c3aed]/20 transition-all duration-300 group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={`text-[0.65rem] font-bold uppercase tracking-wider ${stat.trend.startsWith('+') ? 'text-[#13ec80]' : 'text-[#958da1]'}`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-[#958da1] text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{stat.value}</h3>
          </div>
        ))}
      </section>

      {/* Advanced Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Service Performance (Bar Chart) */}
         <div className="lg:col-span-2 bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <BarChartIcon className="w-5 h-5 text-[#7c3aed]" />
                Top Services by Revenue
              </h3>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={popularServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4a4455/20" vertical={false} />
                  <XAxis dataKey="name" stroke="#958da1" fontSize={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#958da1" fontSize={10} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161b2b', borderRadius: '12px', border: '1px solid #4a4455/20' }}
                    itemStyle={{ color: '#d2bbff' }}
                  />
                  <Bar dataKey="value" fill="#7c3aed" radius={[6, 6, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
         </div>

         {/* Source Distribution (Pie Chart) */}
         <div className="bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                <PieChartIcon className="w-5 h-5 text-[#13ec80]" />
                Booking Source
              </h3>
            </div>
            <div className="h-[250px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-3 mt-4">
               {sourceData.map((s, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                       <span className="text-[#958da1] text-sm font-medium">{s.name}</span>
                    </div>
                    <span className="text-white font-bold text-sm">${s.value.toFixed(0)}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      {/* Transaction List */}
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">Recent Transactions</h2>
        
        <div className="flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#161b2b]/20 rounded-[2rem] border border-dashed border-[#4a4455]/30">
              <Database className="w-12 h-12 text-[#4a4455] mb-4" />
              <h3 className="text-white font-medium text-xl">No transactions yet</h3>
              <p className="text-[#958da1]">Payments will appear here once sessions are completed.</p>
            </div>
          ) : (
            payments.map((p) => (
              <div 
                key={p.id}
                className="grid grid-cols-12 gap-4 items-center bg-[#161b2b]/40 hover:bg-[#161b2b] px-8 py-6 rounded-[2.5rem] transition-all duration-300 border border-transparent hover:border-[#4a4455]/10 group"
              >
                <div className="col-span-12 md:col-span-4 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-[#0e1322] flex items-center justify-center text-[#d2bbff] border border-[#4a4455]/10 font-bold text-xl group-hover:scale-105 transition-transform">
                     {p.appointment.client.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-[1rem] tracking-tight">{p.appointment.client.fullName}</h4>
                    <p className="text-[#7c3aed] text-xs font-semibold mt-0.5">{p.appointment.service.name}</p>
                  </div>
                </div>

                <div className="col-span-6 md:col-span-3 flex flex-col items-start md:items-center">
                   <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest mb-1 group-hover:text-[#958da1] transition-colors">Date & Type</p>
                   <div className="flex items-center gap-2">
                     <span className="text-white text-sm font-medium">{format(new Date(p.createdAt), "MMM dd, yyyy")}</span>
                     <span className="w-1.5 h-1.5 rounded-full bg-[#4a4455]" />
                     <div className="flex items-center gap-1 text-[#958da1] text-xs font-bold uppercase tracking-wider">
                       {getMethodIcon(p.method)}
                       {p.method}
                     </div>
                   </div>
                </div>

                <div className="col-span-6 md:col-span-3 text-right md:text-center">
                   <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest mb-1 group-hover:text-[#958da1] transition-colors">Amount & Status</p>
                   <div className="flex flex-col items-end md:items-center">
                     <span className="text-white font-bold text-lg">${p.amount.toFixed(2)}</span>
                     <span className={`px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase mt-1 ${
                       p.status === 'PAID' ? 'bg-[#13ec80]/10 text-[#13ec80]' : 
                       'bg-red-500/10 text-red-500'
                     }`}>
                       {p.status}
                     </span>
                   </div>
                </div>

                <div className="col-span-12 md:col-span-2 flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="bg-[#2f3445]/40 hover:bg-[#2f3445] text-white p-2.5 rounded-xl transition-colors">
                    <ChevronRight className="w-5 h-5 stroke-[1.5]" />
                  </button>
                  <button className="text-[#4a4455] hover:text-white p-2 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
