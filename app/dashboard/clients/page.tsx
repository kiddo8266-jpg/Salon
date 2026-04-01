"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, User, Phone, CalendarDays, Database, Loader2, X, Mail, Tag } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function ClientsPage() {
  const router = useRouter()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  })

  useEffect(() => {
    fetchClients()
  }, [])

  async function fetchClients() {
    setLoading(true)
    try {
      const res = await fetch("/api/clients")
      const data = await res.json()
      if (Array.isArray(data)) {
        setClients(data)
      }
    } catch (err) {
      console.error("Failed to fetch clients:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    try {
      const res = await fetch("/api/clients", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setIsModalOpen(false)
        fetchClients()
        setFormData({ fullName: '', email: '', phone: '', notes: '' })
      } else {
        setError(data.error || "Something went wrong")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const filteredClients = clients.filter(c => 
    c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone?.includes(searchQuery)
  )

  const getLoyaltyColor = (tier: string) => {
    switch(tier) {
      case 'Platinum': return 'bg-[#d2bbff]/20 text-[#d2bbff]'
      case 'Gold': return 'bg-[#dcaa2e]/20 text-[#dcaa2e]'
      case 'Silver': return 'bg-[#ccc3d8]/20 text-[#ccc3d8]'
      default: return 'bg-[#13ec80]/10 text-[#13ec80]'
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full h-full pb-24">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-none">
            Clients.
          </h1>
          <p className="text-[#ccc3d8] text-lg font-light mt-2">
            The lifeblood of your wellness space.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search directory..."
              className="w-full bg-[#161b2b]/95 text-white rounded-[1rem] border border-[#4a4455]/15 focus:border-[#7c3aed]/50 placeholder:text-[#4a4455] py-3 pl-11 pr-4 transition-all duration-300 outline-none text-sm font-medium"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-medium px-6 py-3 rounded-[1rem] transition-all duration-300 shadow-xl shadow-[#7c3aed]/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Client</span>
          </button>
        </div>
      </section>

      {/* Client List */}
      <section className="mt-8">
        <div className="grid grid-cols-12 gap-4 px-6 pb-4 text-[0.75rem] font-medium tracking-[0.05em] uppercase text-[#958da1]">
           <div className="col-span-5 md:col-span-4">Client Name</div>
           <div className="col-span-4 md:col-span-3 hidden md:block">Contact</div>
           <div className="col-span-2 hidden lg:block">Last Visit</div>
           <div className="col-span-3 md:col-span-2">Loyalty</div>
           <div className="col-span-4 md:col-span-3 text-right">Actions</div>
        </div>

        <div className="flex flex-col gap-4">
          {loading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
             </div>
          ) : filteredClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#161b2b]/20 rounded-[2rem] border border-dashed border-[#4a4455]/30">
              <Database className="w-12 h-12 text-[#4a4455] mb-4" />
              <h3 className="text-white font-medium text-xl">No clients found</h3>
              <p className="text-[#958da1]">Start by adding your first client to the directory.</p>
            </div>
          ) : (
            filteredClients.map((client) => {
              const lastAppointment = client.appointments?.[0]
              const lastVisitLabel = lastAppointment 
                ? formatDistanceToNow(new Date(lastAppointment.startTime)) + " ago"
                : "Never"

              return (
                <Link 
                  key={client.id}
                  href={`/dashboard/clients/${client.id}`}
                  className="group grid grid-cols-12 gap-4 items-center bg-[#161b2b]/40 hover:bg-[#161b2b] px-6 py-5 rounded-[1.5rem] transition-all duration-300 cursor-pointer border border-transparent hover:border-[#4a4455]/10"
                >
                  <div className="col-span-8 md:col-span-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#2f3445] border border-[#4a4455]/15 flex items-center justify-center text-[#d2bbff] shrink-0 font-semibold uppercase text-sm group-hover:bg-[#2f3445]/80 transition-colors">
                      {client.fullName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-medium tracking-tight text-[1rem]">{client.fullName}</h3>
                      <p className="text-[#958da1] text-xs font-medium md:hidden mt-0.5">{client.phone || "No phone"}</p>
                    </div>
                  </div>

                  <div className="col-span-3 hidden md:flex items-center gap-2 text-[#ccc3d8] text-sm">
                    <Phone className="w-3.5 h-3.5 text-[#958da1]" />
                    {client.phone || "—"}
                  </div>

                  <div className="col-span-2 hidden lg:flex flex-col">
                    <span className="text-white text-sm font-medium">{lastVisitLabel}</span>
                    <span className="text-[#958da1] text-xs font-medium">{client.totalVisits} visits</span>
                  </div>

                  <div className="col-span-4 md:col-span-2 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-[0.7rem] font-bold tracking-widest uppercase ${getLoyaltyColor(client.loyaltyTier)}`}>
                      {client.loyaltyTier}
                    </span>
                  </div>

                  <div className="col-span-12 md:col-span-3 flex justify-end gap-3 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-[#2f3445]/40 hover:bg-[#2f3445] text-white p-2.5 rounded-xl transition-colors">
                      <CalendarDays className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div className="bg-[#2f3445]/40 hover:bg-[#2f3445] text-white p-2.5 rounded-xl transition-colors hidden md:block">
                      <User className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div className="text-[#958da1] hover:text-white p-2 transition-colors">
                      <MoreHorizontal className="w-5 h-5 stroke-[1.5]" />
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </section>

      {/* New Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-[#1c2237] border border-[#4a4455]/30 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-[#4a4455]/20 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">New Client</h3>
                <p className="text-[#958da1] text-sm mt-1">Add a new member to your wellness family.</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#2f3445] text-[#958da1] transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-medium">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all text-[#dee1f7]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> Email Address
                    </label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="client@example.com"
                      className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all text-[#dee1f7]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </label>
                    <input 
                      type="tel" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all text-[#dee1f7]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                     Wellness Notes / Medical History
                  </label>
                  <textarea 
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Enter any medical history or session preferences..."
                    className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all h-24 resize-none text-[#dee1f7]"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold py-3.5 rounded-xl hover:saturate-150 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#7c3aed]/20"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Registering Client...</span>
                  </div>
                ) : (
                  <span>Add Client to Space</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
