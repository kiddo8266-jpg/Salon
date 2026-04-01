import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { TrendingUp, Users, Calendar, DollarSign } from "lucide-react"

export default async function DashboardOverview() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const tenantId = session.user.tenantId

  // Fetch real-time statistics
  const [clientCount, upcomingAppointments, payments] = await Promise.all([
    prisma.client.count({ where: { tenantId } }),
    prisma.appointment.count({ 
      where: { 
        tenantId,
        startTime: { gte: new Date() },
        status: 'CONFIRMED'
      } 
    }),
    prisma.payment.aggregate({
      where: { tenantId, status: 'PAID' },
      _sum: { amount: true }
    })
  ])

  const totalRevenue = payments._sum.amount || 0

  const stats = [
    { name: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, trend: 'Gross' },
    { name: 'Active Clients', value: clientCount.toString(), icon: Users, trend: 'Lifetime' },
    { name: 'Upcoming Bookings', value: upcomingAppointments.toString(), icon: Calendar, trend: 'Active' },
    { name: 'Service Capacity', value: '85%', icon: TrendingUp, trend: 'Target' },
  ]

  return (
    <div className="flex flex-col gap-12 w-full h-full pb-24">
      
      {/* Hero Welcome Segment */}
      <section className="col-span-12 flex flex-col gap-2">
        <h1 className="text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-none">
          Good morning, {session.user.name?.split(' ')[0] || "Director"}
        </h1>
        <p className="text-[#ccc3d8] text-lg font-light">
          Here is your venue's pulse for this week.
        </p>
      </section>

      {/* Tonal Stacking KPIs */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div 
            key={stat.name}
            className="group relative bg-[#161b2b] p-6 rounded-[1.5rem] border border-[#2f3445]/30 hover:bg-[#1a1f2f] transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-[1rem] bg-[#2f3445] flex items-center justify-center text-[#d2bbff] shadow-[0_8px_16px_-6px_rgba(124,58,237,0.15)] group-hover:scale-105 transition-transform duration-300">
                <stat.icon className="w-5 h-5 stroke-[1.5]" />
              </div>
              <span className="text-[#13ec80] bg-[#13ec80]/10 px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
                {stat.trend}
              </span>
            </div>
            
            <h3 className="text-[#ccc3d8] text-sm font-medium mb-1">{stat.name}</h3>
            <p className="text-4xl font-bold tracking-tight text-white">{stat.value}</p>
          </div>
        ))}
      </section>

      {/* Grid Canvas For Extended Content */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        
        {/* Main Chart Card Space */}
        <div className="lg:col-span-2 bg-[#161b2b] rounded-[1.5rem] border border-[#2f3445]/30 p-8 min-h-[400px] flex flex-col justify-center items-center">
           <p className="text-[#6d758c] font-medium tracking-widest text-sm uppercase">Revenue Analytics (Incoming Data)</p>
           {/* Recharts Area gradient goes here in the future */}
        </div>

        {/* Action Sidebar Space */}
        <div className="bg-[#1a1f2f]/60 rounded-[1.5rem] border border-[#2f3445]/50 p-8 backdrop-blur-3xl">
           <h3 className="text-xl font-semibold tracking-tight text-white mb-6">Immediate Actions</h3>
           
           <div className="space-y-4">
             <div className="bg-[#2f3445]/30 p-4 rounded-xl border border-[#4a4455]/20 flex justify-between items-center cursor-pointer hover:bg-[#2f3445]/60 transition-colors">
               <div>
                 <p className="text-white font-medium text-sm">Approve Pending</p>
                 <p className="text-xs text-[#958da1]">3 new booking requests</p>
               </div>
               <div className="w-2 h-2 rounded-full bg-[#dcaa2e]" />
             </div>
             
             <div className="bg-[#2f3445]/30 p-4 rounded-xl border border-[#4a4455]/20 flex justify-between items-center cursor-pointer hover:bg-[#2f3445]/60 transition-colors">
               <div>
                 <p className="text-white font-medium text-sm">Staff Availability</p>
                 <p className="text-xs text-[#958da1]">Update this week's hours</p>
               </div>
             </div>
           </div>
        </div>
      </section>

    </div>
  )
}
