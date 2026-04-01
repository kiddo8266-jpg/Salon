"use client"

import React, { useState, useEffect } from "react"
import { 
  ChevronRight, 
  ChevronLeft, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  Tag, 
  Mail, 
  Phone, 
  FileText,
  Loader2,
  X,
  CreditCard,
  ShoppingBag
} from "lucide-react"
import { format, addHours, startOfToday, isBefore, addDays } from "date-fns"
import { useRouter, useSearchParams } from "next/navigation"

export default function PublicBookingWizard({
  params
}: {
  params: { slug: string }
}) {
  const { slug } = params
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialServiceId = searchParams.get('serviceId')

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [salon, setSalon] = useState<any>(null)
  
  // Selection State
  const [selectedService, setSelectedService] = useState<any>(null)
  const [selectedStaff, setSelectedStaff] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), "yyyy-MM-dd"))
  const [selectedTime, setSelectedTime] = useState<string>("")
  
  // Guest Info State
  const [guestInfo, setGuestInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    notes: ""
  })

  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetchSalonData()
  }, [])

  async function fetchSalonData() {
    setLoading(true)
    try {
      const res = await fetch(`/api/public/tenant/${slug}`)
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setSalon(data)
        if (initialServiceId && data.services) {
          const service = data.services.find((s: any) => s.id === initialServiceId)
          if (service) setSelectedService(service)
        }
      }
    } catch (err) {
      setError("Failed to load salon information.")
    } finally {
      setLoading(false)
    }
  }

  const handleBooking = async () => {
    setSubmitting(true)
    setError(null)
    
    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: salon.id,
          serviceId: selectedService.id,
          staffId: selectedStaff.id,
          startTime: `${selectedDate}T${selectedTime}`,
          ...guestInfo
        })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setSuccess(true)
        setStep(4)
      } else {
        setError(data.error || "Booking failed. Please try again.")
      }
    } catch (err) {
      setError("Connection error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin" /></div>
  if (error && step !== 4) return <div className="text-center py-20"><p className="text-red-400 font-bold mb-4">{error}</p><button onClick={() => router.push(`/s/${slug}`)} className="text-[#ccc3d8] hover:text-white underline">Return home</button></div>

  const progress = (step / 4) * 100

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
      {/* Progress Bar */}
      <div className="w-full h-1.5 bg-[#161b2b] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#d2bbff] to-[#7c3aed] transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-12">
        {/* Main Content */}
        <div className="flex-1">
          {step === 1 && (
            <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <header>
                <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Select Treatment</h2>
                <p className="text-[#958da1] font-medium uppercase tracking-widest text-xs">Choose your desired wellness service.</p>
              </header>

              <div className="grid grid-cols-1 gap-4">
                {salon.services.map((service: any) => (
                  <button 
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service)
                      setStep(2)
                    }}
                    className={`group flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 text-left ${
                      selectedService?.id === service.id 
                      ? 'bg-[#7c3aed]/10 border-[#7c3aed] shadow-lg shadow-[#7c3aed]/10' 
                      : 'bg-[#161b2b]/40 border-[#4a4455]/10 hover:border-[#7c3aed]/30'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        selectedService?.id === service.id ? 'bg-[#7c3aed] text-white' : 'bg-[#2f3445] text-[#ccc3d8] group-hover:bg-[#7c3aed]/20 group-hover:text-[#7c3aed]'
                      }`}>
                        <Tag className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg tracking-tight">{service.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest">{service.category}</span>
                          <span className="w-1 h-1 rounded-full bg-[#4a4455]" />
                          <span className="text-[#958da1] text-xs font-medium flex items-center gap-1"><Clock className="w-3 h-3" /> {service.duration} mins</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform">${service.price}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="flex items-center gap-4">
                <button onClick={() => setStep(1)} className="p-3 bg-[#161b2b] rounded-2xl text-[#958da1] hover:text-white transition-colors border border-[#4a4455]/10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">Expert & Date</h2>
                  <p className="text-[#958da1] text-[0.65rem] font-bold uppercase tracking-widest italic leading-tight">Choose your professional and timing.</p>
                </div>
              </header>

              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <h4 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4 text-[#7c3aed]" /> Which Professional?</h4>
                  <div className="flex flex-wrap gap-4">
                    {salon.staff.map((s: any) => (
                      <button 
                        key={s.id}
                        onClick={() => setSelectedStaff(s)}
                        className={`flex flex-col items-center gap-4 p-6 rounded-[2.5rem] border transition-all duration-300 w-32 ${
                          selectedStaff?.id === s.id 
                          ? 'bg-[#7c3aed] border-transparent shadow-xl shadow-[#7c3aed]/20 scale-105' 
                          : 'bg-[#161b2b]/40 border-[#4a4455]/10 hover:border-[#7c3aed]/20'
                        }`}
                      >
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 p-0.5 transition-colors ${
                          selectedStaff?.id === s.id ? 'border-white/50' : 'border-[#4a4455]/20'
                        }`}>
                          <div className="w-full h-full rounded-full bg-[#2f3445] flex items-center justify-center font-bold text-white">
                             {s.user.avatarUrl ? <img src={s.user.avatarUrl} className="w-full h-full object-cover" /> : s.user.name.charAt(0)}
                          </div>
                        </div>
                        <span className={`text-xs font-bold text-center tracking-tight truncate w-full ${selectedStaff?.id === s.id ? 'text-white' : 'text-[#ccc3d8]'}`}>
                          {s.user.name.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedStaff && (
                  <div className="flex flex-col gap-6 animate-in fade-in duration-500">
                    <h4 className="text-white text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Calendar className="w-4 h-4 text-[#7c3aed]" /> Session Timing</h4>
                    
                    <div className="flex flex-col gap-6">
                      <input 
                        type="date" 
                        min={format(new Date(), "yyyy-MM-dd")}
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="bg-[#0e1322] border border-[#4a4455]/20 rounded-2xl px-6 py-4 text-white hover:border-[#7c3aed]/30 focus:border-[#7c3aed] outline-none transition-all shadow-xl font-medium"
                      />

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                        {['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map((time) => (
                           <button
                             key={time}
                             onClick={() => {
                               setSelectedTime(time)
                               setStep(3)
                             }}
                             className={`py-3 rounded-xl border text-xs font-bold transition-all ${
                               selectedTime === time 
                               ? 'bg-[#d2bbff] border-transparent text-[#25005a] shadow-lg shadow-[#7c3aed]/20 scale-105' 
                               : 'bg-[#161b2b]/40 border-[#4a4455]/10 text-[#958da1] hover:text-white hover:border-[#7c3aed]/20'
                             }`}
                           >
                             {time}
                           </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="flex items-center gap-4">
                <button onClick={() => setStep(2)} className="p-3 bg-[#161b2b] rounded-2xl text-[#958da1] hover:text-white transition-colors border border-[#4a4455]/10">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight leading-none mb-1">Your Details</h2>
                  <p className="text-[#958da1] text-[0.65rem] font-bold uppercase tracking-widest italic leading-tight">Complete your reservation.</p>
                </div>
              </header>

              <div className="flex flex-col gap-8">
                {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-2xl text-sm italic">{error}</div>}
                
                <div className="space-y-4">
                   <div className="space-y-2">
                     <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                        Full Name
                     </label>
                     <input 
                      type="text" 
                      required
                      value={guestInfo.fullName}
                      onChange={(e) => setGuestInfo({...guestInfo, fullName: e.target.value})}
                      placeholder="Enter your name"
                      className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-[1.5rem] px-6 py-4 focus:border-[#7c3aed] text-white outline-none transition-all shadow-xl font-medium"
                     />
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                           <Mail className="w-3.5 h-3.5" /> Email
                        </label>
                        <input 
                          type="email" 
                          required
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo({...guestInfo, email: e.target.value})}
                          placeholder="your@email.com"
                          className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-[1.5rem] px-6 py-4 focus:border-[#7c3aed] text-white outline-none transition-all shadow-xl font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                           <Phone className="w-3.5 h-3.5" /> Phone
                        </label>
                        <input 
                          type="tel" 
                          required
                          value={guestInfo.phone}
                          onChange={(e) => setGuestInfo({...guestInfo, phone: e.target.value})}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-[1.5rem] px-6 py-4 focus:border-[#7c3aed] text-white outline-none transition-all shadow-xl font-medium"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest flex items-center gap-2 px-1">
                         Preferences / Allergy Info
                      </label>
                      <textarea 
                        value={guestInfo.notes}
                        onChange={(e) => setGuestInfo({...guestInfo, notes: e.target.value})}
                        placeholder="Anything we should know?"
                        className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-[1.5rem] px-6 py-4 h-32 resize-none focus:border-[#7c3aed] text-white outline-none transition-all shadow-xl font-medium"
                      />
                   </div>
                </div>

                <div className="bg-[#7c3aed]/5 border border-[#7c3aed]/10 p-6 rounded-[2rem] flex items-start gap-4 italic text-sm text-[#d2bbff] leading-relaxed">
                   <div className="w-10 h-10 rounded-full bg-[#7c3aed]/20 flex items-center justify-center shrink-0 text-[#7c3aed]"><CheckCircle2 className="w-6 h-6" /></div>
                   <p>By clicking "Confirm Journey", you agree to our salon policies and will receive a confirmation receipt to your email address.</p>
                </div>

                <button 
                  onClick={handleBooking}
                  disabled={submitting || !guestInfo.fullName || !guestInfo.email || !guestInfo.phone}
                  className="w-full bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] py-6 rounded-[1.5rem] font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
                >
                  {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShoppingBag className="w-6 h-6" />}
                  CONFIRM JOURNEY
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col items-center justify-center py-20 gap-8 animate-in zoom-in duration-500 text-center">
               <div className="relative">
                  <div className="absolute inset-0 bg-[#13ec80] blur-3xl opacity-20 animate-pulse" />
                  <div className="w-24 h-24 rounded-[2.5rem] bg-[#13ec80]/10 border border-[#13ec80]/20 flex items-center justify-center text-[#13ec80] relative">
                    <CheckCircle2 className="w-12 h-12" />
                  </div>
               </div>

               <div className="space-y-4">
                 <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase">Ritual Secured.</h2>
                 <p className="text-[#958da1] text-lg font-medium max-w-sm">We've reserved your spot. Look out for a confirmation email with all details soon.</p>
               </div>

               <div className="bg-[#161b2b]/40 border border-[#4a4455]/10 p-10 rounded-[3rem] w-full max-w-md flex flex-col gap-6 text-left">
                  <div className="flex justify-between border-b border-[#4a4455]/10 pb-4">
                     <span className="text-[#958da1] text-xs font-bold uppercase tracking-widest italic">Service</span>
                     <span className="text-white font-bold">{selectedService?.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#4a4455]/10 pb-4">
                     <span className="text-[#958da1] text-xs font-bold uppercase tracking-widest italic">Expert</span>
                     <span className="text-white font-bold">{selectedStaff?.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                     <span className="text-[#958da1] text-xs font-bold uppercase tracking-widest italic">When</span>
                     <span className="text-white font-bold">{format(new Date(selectedDate), "MMM dd")} @ {selectedTime}</span>
                  </div>
               </div>

               <button 
                onClick={() => router.push(`/s/${slug}`)}
                className="bg-[#2f3445]/40 hover:bg-[#2f3445] text-white px-10 py-5 rounded-2xl font-bold transition-all border border-[#4a4455]/10"
               >
                 Explore More Treatments
               </button>
            </div>
          )}
        </div>

        {/* Floating Summary Bar (Right Side) */}
        {step < 4 && (
          <aside className="w-full md:w-80 flex flex-col gap-6">
            <div className="bg-[#1c2237] border border-[#4a4455]/20 p-8 rounded-[2.5rem] shadow-2xl flex flex-col gap-8 sticky top-32">
               <h3 className="text-xl font-bold text-white tracking-tight leading-none mb-2">Reservation</h3>
               
               <div className="flex flex-col gap-6">
                 {selectedService && (
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] shrink-0"><Tag className="w-5 h-5" /></div>
                       <div>
                          <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase mb-0.5">Service</p>
                          <p className="text-white font-bold text-sm tracking-tight">{selectedService.name}</p>
                          <p className="text-[#13ec80] text-xs font-black italic mt-0.5">${selectedService.price}</p>
                       </div>
                    </div>
                 )}

                 {selectedStaff && (
                    <div className="flex gap-4 animate-in slide-in-from-left duration-300">
                       <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] shrink-0"><User className="w-5 h-5" /></div>
                       <div>
                          <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase mb-0.5">Expert</p>
                          <p className="text-white font-bold text-sm tracking-tight">{selectedStaff.user.name}</p>
                       </div>
                    </div>
                 )}

                 {selectedTime && (
                    <div className="flex gap-4 animate-in slide-in-from-left duration-300">
                       <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#7c3aed] shrink-0"><Calendar className="w-5 h-5" /></div>
                       <div>
                          <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase mb-0.5">Time</p>
                          <p className="text-white font-bold text-sm tracking-tight">{format(new Date(selectedDate), "MMM dd")} @ {selectedTime}</p>
                       </div>
                    </div>
                 )}

                 {!selectedService && !selectedStaff && !selectedTime && (
                   <div className="py-6 text-center border border-dashed border-[#4a4455]/20 rounded-2xl">
                     <p className="text-[#4a4455] text-xs font-bold uppercase">Booking Empty</p>
                   </div>
                 )}
               </div>
            </div>

            <div className="bg-[#161b2b]/40 p-10 border border-white/5 rounded-[2.5rem] flex flex-col gap-6 group">
               <div className="flex items-center gap-3">
                 <CreditCard className="w-5 h-5 text-[#ccc3d8] group-hover:text-[#7c3aed] transition-colors" />
                 <span className="text-white font-bold text-sm">Pay In-Person</span>
               </div>
               <p className="text-[#958da1] text-xs font-medium leading-relaxed">Payments are handled at the salon after your treatment. Please arrive 5 minutes early.</p>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
