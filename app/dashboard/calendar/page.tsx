"use client"

import React, { useState, useEffect } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import { Database, Loader2, Plus, X, Calendar as CalendarIcon, User, Briefcase, Clock, FileText, Trash2, CheckCircle2, DollarSign, Wallet, ShieldAlert } from "lucide-react"
import { format } from "date-fns"
import { useSession } from "next-auth/react"

export default function CalendarPage() {
  const { data: session } = useSession()
  const isOwner = session?.user?.role === 'OWNER'

  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Data for selects
  const [clients, setClients] = useState<any[]>([])
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    id: '',
    clientId: '',
    serviceId: '',
    staffId: '',
    startTime: '',
    notes: ''
  })

  // Payment Form State
  const [payData, setPayData] = useState({ amount: 0, method: 'CASH', note: '' })

  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
    setLoading(true)
    try {
      const [apptRes, clientRes, serviceRes, staffRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/clients"),
        fetch("/api/services"),
        fetch("/api/staff")
      ])
      const appts = await apptRes.json()
      const clientsData = await clientRes.json()
      const servicesData = await serviceRes.json()
      const staffData = await staffRes.json()
      if (Array.isArray(appts)) setEvents(formatEvents(appts))
      setClients(clientsData || [])
      setServices(servicesData || [])
      setStaff(staffData || [])
    } catch (err) {} finally { setLoading(false) }
  }

  function formatEvents(appts: any[]) {
    return appts.map((apt: any) => ({
      id: apt.id,
      title: `${apt.client.fullName} - ${apt.service.name}`,
      start: apt.startTime,
      end: apt.endTime,
      backgroundColor: apt.status === 'COMPLETED' ? '#13ec8099' : apt.service.color || '#7c3aed',
      borderColor: 'transparent',
      extendedProps: {
        clientId: apt.clientId,
        serviceId: apt.serviceId,
        staffId: apt.staffId,
        notes: apt.notes,
        status: apt.status,
        price: apt.service.price
      }
    }))
  }

  const handleDateSelect = (selectInfo: any) => {
    setModalMode('create')
    setFormData({ id: '', clientId: '', serviceId: '', staffId: '', startTime: selectInfo.startStr.slice(0, 16), notes: '' })
    setError(null)
    setIsModalOpen(true)
  }

  const handleEventClick = (clickInfo: any) => {
    setModalMode('edit')
    const event = clickInfo.event
    setFormData({
      id: event.id,
      clientId: event.extendedProps.clientId,
      serviceId: event.extendedProps.serviceId,
      staffId: event.extendedProps.staffId,
      startTime: format(new Date(event.start), "yyyy-MM-dd'T'HH:mm"),
      notes: event.extendedProps.notes || ''
    })
    setPayData({ amount: event.extendedProps.price || 0, method: 'CASH', note: '' })
    setError(null)
    setIsModalOpen(true)
  }

  const handleEventChange = async (changeInfo: any) => {
    if (!isOwner) { changeInfo.revert(); return }
    try {
      const res = await fetch(`/api/appointments/${changeInfo.event.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime: changeInfo.event.startStr })
      })
      if (!res.ok) changeInfo.revert()
    } catch (err) { changeInfo.revert() }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (modalMode === 'edit' && !isOwner) return
    setIsSaving(true)
    setError(null)
    try {
      const url = modalMode === 'create' ? '/api/appointments' : `/api/appointments/${formData.id}`
      const method = modalMode === 'create' ? 'POST' : 'PATCH'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (res.ok) { setIsModalOpen(false); fetchInitialData() } else { const data = await res.json(); setError(data.error || "Internal Error") }
    } catch (err) { setError("Network error.") } finally { setIsSaving(false) }
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isOwner) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/payments", { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ appointmentId: formData.id, ...payData }) })
      if (res.ok) { setIsPayModalOpen(false); setIsModalOpen(false); fetchInitialData() }
    } catch (err) {} finally { setIsSaving(false) }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-[2.5rem] font-semibold text-white leading-none">Schedule</h2>
          <p className="text-[#ccc3d8] mt-2 font-medium">Manage your venue's upcoming bookings.</p>
        </div>
        <button onClick={() => { setModalMode('create'); setFormData({ id: '', clientId: '', serviceId: '', staffId: '', startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"), notes: '' }); setIsModalOpen(true) }} className="bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-medium px-6 py-3 rounded-xl shadow-lg shadow-[#7c3aed]/20 flex items-center gap-2 transition-all hover:saturate-150">
          <Plus className="w-4 h-4" /> <span>New Booking</span>
        </button>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .fc-theme-standard .fc-scrollgrid { border-color: rgba(74, 68, 85, 0.15); }
        .fc-theme-standard td, .fc-theme-standard th { border-color: rgba(74, 68, 85, 0.15); }
        .fc .fc-toolbar-title { color: #ffffff; font-weight: 600; font-size: 1.5rem; }
        .fc .fc-button-primary { background-color: #2f3445; border-color: transparent; border-radius: 0.75rem; padding: 0.5rem 1rem; }
        .fc .fc-event { border-radius: 6px; padding: 4px 8px; font-size: 0.75rem; font-weight: 600; border: none; cursor: pointer; }
      `}} />

      <div className="flex-1 bg-[#161b2b]/95 backdrop-blur-xl rounded-[1.5rem] border border-[#4a4455]/15 p-6 shadow-2xl overflow-hidden relative">
        {loading && <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#161b2b]/80"><Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" /></div>}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' }}
          events={events}
          editable={isOwner}
          selectable={true}
          dayMaxEvents={true}
          height="100%"
          slotMinTime="07:00:00"
          slotMaxTime="21:00:00"
          allDaySlot={false}
          nowIndicator={true}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={handleEventChange}
          eventResize={handleEventChange}
        />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-xl bg-[#1c2237] border border-[#4a4455]/30 rounded-[2rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-[#4a4455]/20 flex justify-between items-center bg-[#161b2b]/50">
              <h3 className="text-2xl font-bold text-white">{modalMode === 'create' ? 'Schedule' : 'Details'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#958da1]"><X className="w-6 h-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-xl text-sm italic">{error}</div>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-xs font-bold text-[#958da1] uppercase">Client</label>
                  <select required disabled={!isOwner && modalMode === 'edit'} value={formData.clientId} onChange={(e) => setFormData({...formData, clientId: e.target.value})} className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 outline-none text-[#dee1f7] disabled:opacity-50">
                    <option value="">Select Client</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.fullName}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#958da1] uppercase">Expert</label>
                  <select required disabled={!isOwner && modalMode === 'edit'} value={formData.staffId} onChange={(e) => setFormData({...formData, staffId: e.target.value})} className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 outline-none text-[#dee1f7] disabled:opacity-50">
                    <option value="">Select Staff</option>
                    {staff.map(s => <option key={s.id} value={s.id}>{s.user?.name}</option>)}
                  </select>
                </div>
              </div>

              {!isOwner && modalMode === 'edit' && (
                <div className="bg-[#7c3aed]/10 border border-[#7c3aed]/20 p-4 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-[#d2bbff] shrink-0" />
                  <p className="text-xs text-[#d2bbff]">Read-only mode. Changes currently restricted to Wellness Managers.</p>
                </div>
              )}

              <div className="pt-4 flex gap-3">
                {isOwner && modalMode === 'edit' && events.find(e => e.id === formData.id)?.extendedProps.status !== 'COMPLETED' && (
                   <button type="button" onClick={() => setIsPayModalOpen(true)} className="px-6 py-3.5 rounded-xl bg-[#13ec80] text-[#00391d] font-bold">Checkout</button>
                )}
                {isOwner && modalMode === 'edit' && (
                  <button type="button" onClick={handleDelete} className="p-3.5 rounded-xl border border-red-500/20 text-red-400"><Trash2 className="w-5 h-5" /></button>
                )}
                {(isOwner || modalMode === 'create') && (
                  <button type="submit" disabled={isSaving} className="flex-1 bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold py-3.5 rounded-xl">
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirm Booking'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {isPayModalOpen && isOwner && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsPayModalOpen(false)} />
          <div className="relative w-full max-w-md bg-[#1c2237] border border-[#13ec80]/30 rounded-[2.5rem] p-10 text-center">
             <h3 className="text-3xl font-bold text-white mb-2">Checkout</h3>
             <form onSubmit={handlePayment} className="mt-8 space-y-6">
                <input type="number" readOnly value={payData.amount} className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-4 text-3xl font-bold text-white outline-none text-center" />
                <button type="submit" disabled={isSaving} className="w-full bg-[#13ec80] text-[#00391d] font-bold py-4 rounded-2xl">Confirm Payment</button>
             </form>
          </div>
        </div>
      )}
    </div>
  )
}
