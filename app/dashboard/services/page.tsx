"use client"

import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Clock, 
  DollarSign, 
  Tag, 
  Edit3, 
  Trash2, 
  Loader2, 
  X,
  Database,
  Palette,
  CheckCircle2
} from "lucide-react"

export default function ServicesPage() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    duration: '30',
    category: 'General',
    color: '#7c3aed'
  })

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    setLoading(true)
    try {
      const res = await fetch("/api/services")
      const data = await res.json()
      if (Array.isArray(data)) setServices(data)
    } catch (err) {
      console.error("Failed to fetch services:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    try {
      const url = modalMode === 'create' ? '/api/services' : `/api/services/${formData.id}`
      const method = modalMode === 'create' ? 'POST' : 'PATCH'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setIsModalOpen(false)
        fetchServices()
      } else {
        const data = await res.json()
        setError(data.error || "Internal Error")
      }
    } catch (err) {
      setError("Network error")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will hide the service from further bookings.")) return
    try {
      const res = await fetch(`/api/services/${id}`, { method: 'DELETE' })
      if (res.ok) fetchServices()
    } catch (err) {}
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const colors = [
    '#7c3aed', '#ec4899', '#f97316', '#10b981', '#3b82f6', '#f43f5e', '#a855f7', '#14b8a6', '#6366f1'
  ]

  return (
    <div className="flex flex-col gap-8 w-full h-full pb-24">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-none">
            Services.
          </h1>
          <p className="text-[#ccc3d8] text-lg font-light mt-2">
            Define your treatments, pricing, and timing.
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
              placeholder="Search services..."
              className="w-full bg-[#161b2b]/95 text-white rounded-[1rem] border border-[#4a4455]/15 focus:border-[#7c3aed]/50 placeholder:text-[#4a4455] py-3 pl-11 pr-4 transition-all duration-300 outline-none text-sm font-medium"
            />
          </div>

          <button 
            onClick={() => {
              setModalMode('create')
              setFormData({ id: '', name: '', description: '', price: '', duration: '60', category: 'General', color: '#7c3aed' })
              setIsModalOpen(true)
            }}
            className="flex items-center gap-2 bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold px-6 py-3 rounded-[1rem] transition-all duration-300 shadow-xl shadow-[#7c3aed]/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service</span>
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mt-8">
        {loading ? (
             <div className="flex justify-center py-20">
               <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
             </div>
          ) : filteredServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[#161b2b]/20 rounded-[3rem] border border-dashed border-[#4a4455]/30">
              <Database className="w-12 h-12 text-[#4a4455] mb-4" />
              <h3 className="text-white font-medium text-xl">No services found</h3>
              <p className="text-[#958da1]">Add your first treatment to start taking bookings.</p>
            </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {filteredServices.map((service) => (
                 <div 
                   key={service.id}
                   className="group relative bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[2.5rem] p-8 shadow-xl transition-all duration-500 hover:bg-[#161b2b] hover:border-[#7c3aed]/20 hover:shadow-[#7c3aed]/5"
                 >
                   <div 
                     className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity rounded-bl-[10rem]"
                     style={{ background: `linear-gradient(135deg, ${service.color}, transparent)` }}
                   />
                   
                   <div className="flex justify-between items-start mb-6 relative">
                     <div 
                       className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
                       style={{ backgroundColor: service.color }}
                     >
                       <Tag className="w-6 h-6" />
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            setModalMode('edit')
                            setFormData({
                              id: service.id,
                              name: service.name,
                              description: service.description || '',
                              price: service.price.toString(),
                              duration: service.duration.toString(),
                              category: service.category,
                              color: service.color
                            })
                            setIsModalOpen(true)
                          }}
                          className="bg-[#2f3445]/40 hover:bg-[#2f3445] text-white p-2 rounded-xl transition-all"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(service.id)}
                          className="bg-[#2f3445]/40 hover:bg-red-500/20 text-red-400 p-2 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   </div>

                   <div className="space-y-4">
                     <div>
                       <span className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest block mb-1">{service.category}</span>
                       <h3 className="text-2xl font-bold text-white tracking-tight">{service.name}</h3>
                     </div>

                     <p className="text-[#958da1] text-sm line-clamp-2 leading-relaxed">
                       {service.description || "Unwind and rejuvenate with our signature treatment sessions."}
                     </p>

                     <div className="pt-4 flex items-center justify-between border-t border-[#4a4455]/10 mt-auto">
                        <div className="flex items-center gap-2 text-white font-bold">
                           <DollarSign className="w-4 h-4 text-[#13ec80]" />
                           <span className="text-xl">{service.price}</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#958da1] text-sm font-medium">
                           <Clock className="w-4 h-4" />
                           {service.duration} mins
                        </div>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
      </section>

      {/* Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-[#1c2237] border border-[#4a4455]/30 rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
             <div className="p-10 border-b border-[#4a4455]/20 flex justify-between items-center bg-[#161b2b]/30">
               <div>
                 <h3 className="text-3xl font-bold text-white tracking-tight">{modalMode === 'create' ? 'New Service' : 'Edit Treatment'}</h3>
                 <p className="text-[#958da1] text-sm mt-1">Configure your wellness offering.</p>
               </div>
               <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-full hover:bg-[#2f3445] text-[#958da1] transition-colors">
                 <X className="w-7 h-7" />
               </button>
             </div>

             <form onSubmit={handleSubmit} className="p-10 space-y-8">
               {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-5 py-4 rounded-2xl text-sm italic">{error}</div>}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                      <Tag className="w-3.5 h-3.5" /> Service Name
                    </label>
                    <input 
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Deep Tissue Massage"
                      className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-2xl px-6 py-4 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none text-white font-medium transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                       Category
                    </label>
                    <input 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      placeholder="e.g. Skin Care"
                      className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-2xl px-6 py-4 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none text-white font-medium transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                      <DollarSign className="w-3.5 h-3.5" /> Price ($)
                    </label>
                    <input 
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      placeholder="85.00"
                      className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-2xl px-6 py-4 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none text-white font-medium transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                      <Clock className="w-3.5 h-3.5" /> Duration (mins)
                    </label>
                    <input 
                      type="number"
                      required
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                      placeholder="60"
                      className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-2xl px-6 py-4 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none text-white font-medium transition-all"
                    />
                  </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                   Description
                 </label>
                 <textarea 
                   value={formData.description}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Briefly describe the treatment..."
                   className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-2xl px-6 py-4 focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none text-white font-medium h-24 resize-none transition-all"
                 />
               </div>

               <div className="space-y-4">
                 <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                   <Palette className="w-3.5 h-3.5" /> Booking Tag Color
                 </label>
                 <div className="flex flex-wrap gap-3">
                   {colors.map((c) => (
                     <button
                       key={c}
                       type="button"
                       onClick={() => setFormData({...formData, color: c})}
                       className={`w-10 h-10 rounded-xl transition-all duration-300 ${formData.color === c ? 'ring-4 ring-white/30 scale-125' : 'hover:scale-110'}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                 </div>
               </div>

               <button 
                 type="submit"
                 disabled={isSaving}
                 className="w-full bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold py-5 rounded-2xl hover:saturate-150 transition-all duration-300 shadow-2xl shadow-[#7c3aed]/30 flex items-center justify-center gap-3"
               >
                 {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                 <span className="text-lg">{modalMode === 'create' ? 'Launch Treatment' : 'Save Changes'}</span>
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
