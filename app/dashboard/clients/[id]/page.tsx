import React from "react"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect, notFound } from "next/navigation"
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  DollarSign, 
  FileText, 
  TrendingUp, 
  History,
  User as UserIcon,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  const { id } = await params

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      appointments: {
        orderBy: { startTime: 'desc' },
        include: {
          service: true,
          staff: {
            include: {
              user: { select: { name: true } }
            }
          }
        }
      }
    }
  })

  if (!client || client.tenantId !== session.user.tenantId) {
    notFound()
  }

  const stats = [
    { label: "Total Visits", value: client.totalVisits, icon: History, color: "text-[#d2bbff]" },
    { label: "Total Spent", value: `$${client.totalSpent.toFixed(2)}`, icon: DollarSign, color: "text-[#13ec80]" },
    { label: "Loyalty Tier", value: client.loyaltyTier, icon: TrendingUp, color: "text-[#dcaa2e]" },
  ]

  return (
    <div className="flex flex-col gap-8 w-full h-full pb-24">
      {/* Back button & Header */}
      <section className="flex flex-col gap-6">
        <Link 
          href="/dashboard/clients" 
          className="flex items-center gap-2 text-[#958da1] hover:text-white transition-colors w-fit group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase tracking-widest">Back to Directory</span>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-[2rem] bg-[#2f3445] border border-[#4a4455]/20 flex items-center justify-center text-[#d2bbff] text-4xl font-bold uppercase shadow-2xl">
              {client.fullName.charAt(0)}
            </div>
            <div>
              <h1 className="text-[3rem] font-semibold tracking-tight text-white leading-tight">
                {client.fullName}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-widest uppercase bg-[#d2bbff]/10 text-[#d2bbff] border border-[#d2bbff]/20`}>
                  {client.loyaltyTier} Member
                </span>
                <span className="text-[#958da1] text-sm flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {format(client.createdAt, "MMMM yyyy")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Stats & Info */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-3xl p-6 flex items-center gap-6">
                <div className={`p-4 rounded-2xl bg-[#0e1322] ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[#958da1] text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[2.5rem] p-8 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-3">
               <UserIcon className="w-5 h-5 text-[#7c3aed]" />
               Contact Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#0e1322] flex items-center justify-center text-[#958da1] group-hover:text-[#d2bbff] transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">Email Address</p>
                  <p className="text-sm text-[#dee1f7]">{client.email || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-[#0e1322] flex items-center justify-center text-[#958da1] group-hover:text-[#13ec80] transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm text-[#dee1f7]">{client.phone || "Not provided"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Clinical Notes Summary */}
          <div className="bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[2.5rem] p-8">
             <h3 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
               <FileText className="w-5 h-5 text-[#7c3aed]" />
               Wellness Notes
            </h3>
            <div className="bg-[#0e1322]/50 rounded-2xl p-6 italic text-[#ccc3d8] text-sm leading-relaxed border border-dashed border-[#4a4455]/20">
              "{client.notes || "No wellness notes recorded for this client yet. Start an appointment to begin tracking their progress."}"
            </div>
          </div>
        </div>

        {/* Right Column: Appointment History */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3">
              Appointment History
              <span className="px-3 py-1 rounded-full bg-[#161b2b] text-[#958da1] text-xs font-bold border border-[#4a4455]/10">
                {client.appointments.length}
              </span>
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {client.appointments.length === 0 ? (
              <div className="py-20 bg-[#161b2b]/20 rounded-[2rem] border border-dashed border-[#4a4455]/30 flex flex-col items-center">
                <Clock className="w-12 h-12 text-[#4a4455] mb-4" />
                <p className="text-[#958da1]">No appointment history found.</p>
              </div>
            ) : (
              client.appointments.map((appt) => (
                <div 
                  key={appt.id}
                  className="group bg-[#161b2b]/40 hover:bg-[#161b2b] border border-[#4a4455]/10 rounded-[2rem] p-6 transition-all duration-300 flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#0e1322] flex items-center justify-center text-[#7c3aed] border border-[#7c3aed]/10 group-hover:scale-105 transition-transform">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-lg">{appt.service.name}</h4>
                      <div className="flex items-center gap-4 mt-1 text-[#958da1] text-xs font-medium uppercase tracking-wider">
                        <span>{format(new Date(appt.startTime), "MMM dd, yyyy")}</span>
                        <span className="w-1 h-1 rounded-full bg-[#4a4455]" />
                        <span>{format(new Date(appt.startTime), "p")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest mb-1">With Expert</p>
                      <p className="text-white font-bold text-sm">{appt.staff?.user?.name || "Professional"}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-4 py-1.5 rounded-full text-[0.65rem] font-bold uppercase tracking-widest ${
                        appt.status === 'COMPLETED' ? 'bg-[#13ec80]/10 text-[#13ec80]' : 
                        appt.status === 'CANCELLED' ? 'bg-red-500/10 text-red-500' : 
                        'bg-[#7c3aed]/10 text-[#7c3aed]'
                      }`}>
                        {appt.status}
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-[#4a4455] group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
