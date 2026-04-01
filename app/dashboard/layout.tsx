import React from "react"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  Image as ImageIcon, 
  Settings, 
  LogOut,
  CreditCard,
  UserSquare
} from "lucide-react"
import Link from "next/link"

const allNavigation = [
  { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['OWNER', 'STAFF', 'VIEWER'] },
  { name: 'Calendar', href: '/dashboard/calendar', icon: CalendarIcon, roles: ['OWNER', 'STAFF'] },
  { name: 'Clients', href: '/dashboard/clients', icon: Users, roles: ['OWNER', 'STAFF'] },
  { name: 'Staff', href: '/dashboard/staff', icon: UserSquare, roles: ['OWNER'] },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard, roles: ['OWNER'] },
  { name: 'Gallery', href: '/dashboard/gallery', icon: ImageIcon, roles: ['OWNER', 'STAFF'] },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['OWNER'] },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const role = session.user.role as string
  const navigation = allNavigation.filter(item => item.roles.includes(role))

  return (
    <div className="min-h-screen bg-[#0e1322] text-[#dee1f7] flex overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#161b2b] hidden md:flex flex-col h-screen fixed sticky top-0 border-r border-[#4a4455]/10">
        <div className="h-24 flex items-center px-8">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] text-sm">
              W
            </span>
            WellnessOS
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-6 flex flex-col gap-2 overflow-y-auto">
          {navigation.map((item) => {
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className="group flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 hover:bg-[#2f3445]/50 hover:text-white text-[#ccc3d8]"
              >
                <item.icon className="w-5 h-5 stroke-[1.5] group-hover:text-[#d2bbff] transition-colors" />
                <span className="font-medium text-[0.95rem]">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto">
          <Link 
            href="/api/auth/signout"
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl hover:bg-[#93000a]/20 text-[#ffb4ab] transition-all duration-300"
          >
             <LogOut className="w-5 h-5 stroke-[1.5]" />
             <span className="font-medium">Sign out</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-24 flex shrink-0 items-center justify-between px-8 bg-[#0e1322]/80 backdrop-blur-xl z-20">
           <h2 className="text-xl font-semibold opacity-0 md:opacity-100 transition-opacity">
             Management Terminal
           </h2>

           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-sm font-medium text-white">{session.user.name}</p>
               <p className="text-xs text-[#958da1] uppercase tracking-wider">{session.user.role}</p>
             </div>
             <div className="w-12 h-12 rounded-full bg-[#2f3445] flex items-center justify-center text-[#d2bbff] border border-[#4a4455]/20 uppercase font-semibold">
               {session.user.name?.charAt(0) || "U"}
             </div>
           </div>
        </header>
        
        {/* Scrollable Page Canvas */}
        <div className="flex-1 overflow-x-hidden overflow-y-auto w-full p-4 md:p-8">
           <div className="max-w-7xl mx-auto h-full space-y-8">
             {children}
           </div>
        </div>
      </main>
    </div>
  )
}
