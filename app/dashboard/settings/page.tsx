"use client"

import React, { useState, useEffect } from "react"
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  Save, 
  Loader2, 
  CheckCircle2, 
  Palette,
  ShieldCheck
} from "lucide-react"

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    brandColor: '#7c3aed',
    socialLinks: { instagram: '', facebook: '', twitter: '' },
    businessHours: {
      Monday: { open: '09:00', close: '17:00', closed: false },
      Tuesday: { open: '09:00', close: '17:00', closed: false },
      Wednesday: { open: '09:00', close: '17:00', closed: false },
      Thursday: { open: '09:00', close: '17:00', closed: false },
      Friday: { open: '09:00', close: '17:00', closed: false },
      Saturday: { open: '10:00', close: '14:00', closed: false },
      Sunday: { open: '00:00', close: '00:00', closed: true },
    }
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    setLoading(true)
    try {
      const res = await fetch("/api/tenants/me")
      const data = await res.json()
      if (data) {
        setFormData({
          ...formData, // Fallback for hours
          ...data,
          socialLinks: data.socialLinks || formData.socialLinks,
          businessHours: data.businessHours || formData.businessHours
        })
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSuccess(false)
    try {
      const res = await fetch("/api/tenants/me", {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      }
    } catch (err) {
      console.error("Save error:", err)
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <div className="flex justify-center items-center h-full py-40"><Loader2 className="w-12 h-12 text-[#7c3aed] animate-spin" /></div>

  return (
    <div className="flex flex-col gap-10 w-full h-full pb-32">
       {/* Editorial Header */}
       <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-none">
            Settings.
          </h1>
          <p className="text-[#ccc3d8] text-lg font-light mt-2">
            Fine-tune your brand and operational DNA.
          </p>
        </div>

        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold px-8 py-4 rounded-[1.25rem] transition-all duration-300 shadow-2xl shadow-[#7c3aed]/30 hover:saturate-150 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (success ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
          <span>{success ? 'Success!' : 'Save Profile'}</span>
        </button>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
         {/* Left Column: Basic Info */}
         <div className="xl:col-span-2 space-y-8">
            {/* Salon Profile Container */}
            <div className="bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[3rem] p-10 space-y-10">
               <div className="flex items-center gap-4 border-b border-[#4a4455]/10 pb-6">
                 <Building2 className="w-8 h-8 text-[#7c3aed]" />
                 <h2 className="text-2xl font-bold text-white tracking-tight">Identity & Reach</h2>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest px-1">Business Name</label>
                    <div className="relative">
                       <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a4455]" />
                       <input 
                         value={formData.name}
                         onChange={(e) => setFormData({...formData, name: e.target.value})}
                         className="w-full bg-[#0e1322]/80 border border-[#4a4455]/20 rounded-2xl pl-12 pr-6 py-4 focus:border-[#7c3aed] outline-none text-white font-medium transition-all"
                       />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest px-1">Brand Main Color</label>
                    <div className="flex gap-4 items-center">
                       <input 
                         type="color"
                         value={formData.brandColor}
                         onChange={(e) => setFormData({...formData, brandColor: e.target.value})}
                         className="w-14 h-14 bg-transparent border-none outline-none cursor-pointer"
                       />
                       <span className="text-white font-mono text-sm uppercase">{formData.brandColor}</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-3">
                 <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest px-1">Business Description</label>
                 <textarea 
                   value={formData.description || ''}
                   onChange={(e) => setFormData({...formData, description: e.target.value})}
                   placeholder="Tell clients about your space..."
                   className="w-full bg-[#0e1322]/80 border border-[#4a4455]/20 rounded-3xl px-6 py-5 focus:border-[#7c3aed] outline-none text-white font-medium h-32 resize-none transition-all"
                 />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest px-1 flex items-center gap-2"><MapPin className="w-3 h-3"/> Address</label>
                    <input 
                      value={formData.address || ''}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full bg-[#0e1322]/80 border border-[#4a4455]/20 rounded-2xl px-5 py-3.5 focus:border-[#7c3aed] outline-none text-white text-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest px-1 flex items-center gap-2"><Phone className="w-3 h-3"/> Phone</label>
                    <input 
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-[#0e1322]/80 border border-[#4a4455]/20 rounded-2xl px-5 py-3.5 focus:border-[#7c3aed] outline-none text-white text-sm"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-bold text-[#958da1] uppercase tracking-widest px-1 flex items-center gap-2"><Globe className="w-3 h-3"/> Website</label>
                    <input 
                      value={formData.website || ''}
                      onChange={(e) => setFormData({...formData, website: e.target.value})}
                      className="w-full bg-[#0e1322]/80 border border-[#4a4455]/20 rounded-2xl px-5 py-3.5 focus:border-[#7c3aed] outline-none text-white text-sm"
                    />
                  </div>
               </div>
            </div>

            {/* Social Connect Container */}
            <div className="bg-[#161b2b]/40 border border-[#4a4455]/10 rounded-[3rem] p-10 space-y-8">
               <div className="flex items-center gap-4">
                 <ShieldCheck className="w-8 h-8 text-[#13ec80]" />
                 <h2 className="text-2xl font-bold text-white tracking-tight">Social Connect</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative border border-[#4a4455]/20 bg-[#0e1322]/50 rounded-2xl p-6 transition-all hover:border-[#7c3aed]/40 group">
                    <Instagram className="w-6 h-6 text-[#ccc3d8] mb-4 group-hover:text-pink-400 transition-colors" />
                    <input 
                      value={formData.socialLinks.instagram}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, instagram: e.target.value}})}
                      placeholder="@username"
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium"
                    />
                  </div>
                  <div className="relative border border-[#4a4455]/20 bg-[#0e1322]/50 rounded-2xl p-6 transition-all hover:border-[#7c3aed]/40 group">
                    <Facebook className="w-6 h-6 text-[#ccc3d8] mb-4 group-hover:text-blue-400 transition-colors" />
                    <input 
                      value={formData.socialLinks.facebook}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, facebook: e.target.value}})}
                      placeholder="/salonpage"
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium"
                    />
                  </div>
                  <div className="relative border border-[#4a4455]/20 bg-[#0e1322]/50 rounded-2xl p-6 transition-all hover:border-[#7c3aed]/40 group">
                    <Twitter className="w-6 h-6 text-[#ccc3d8] mb-4 group-hover:text-sky-400 transition-colors" />
                    <input 
                      value={formData.socialLinks.twitter}
                      onChange={(e) => setFormData({...formData, socialLinks: {...formData.socialLinks, twitter: e.target.value}})}
                      placeholder="@handle"
                      className="w-full bg-transparent border-none outline-none text-white text-sm font-medium"
                    />
                  </div>
               </div>
            </div>
         </div>

         {/* Right Column: Business Hours */}
         <div className="space-y-8">
            <div className="bg-[#1c2237] border border-[#4a4455]/20 rounded-[3rem] p-10 h-full">
               <div className="flex items-center gap-4 mb-8">
                 <Clock className="w-8 h-8 text-[#7c3aed]" />
                 <h2 className="text-2xl font-bold text-white tracking-tight">Hours</h2>
               </div>

               <div className="space-y-6">
                 {DAYS.map((day) => {
                    const hours = (formData.businessHours as any)[day]
                    return (
                      <div key={day} className="flex flex-col gap-4 p-4 rounded-3xl bg-[#0e1322]/40 border border-[#4a4455]/10 hover:border-[#7c3aed]/20 transition-all group">
                         <div className="flex justify-between items-center">
                            <span className="font-bold text-white group-hover:text-[#d2bbff] shrink-0">{day}</span>
                            <button 
                              onClick={() => {
                                const newHours = { ...formData.businessHours }
                                (newHours as any)[day].closed = !hours.closed
                                setFormData({...formData, businessHours: newHours})
                              }}
                              className={`px-3 py-1 rounded-full text-[0.6rem] font-bold tracking-widest uppercase transition-all ${hours.closed ? 'bg-[#93000a]/20 text-[#ffb4ab]' : 'bg-[#13ec80]/10 text-[#13ec80]'}`}
                            >
                              {hours.closed ? 'Closed' : 'Open'}
                            </button>
                         </div>

                         {!hours.closed && (
                           <div className="flex items-center gap-3">
                              <input 
                                type="time"
                                value={hours.open}
                                onChange={(e) => {
                                  const newHours = { ...formData.businessHours }
                                  (newHours as any)[day].open = e.target.value
                                  setFormData({...formData, businessHours: newHours})
                                }}
                                className="bg-[#161b2b] border border-[#4a4455]/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none w-full"
                              />
                              <span className="text-[#4a4455] text-xs font-bold">TO</span>
                              <input 
                                type="time"
                                value={hours.close}
                                onChange={(e) => {
                                  const newHours = { ...formData.businessHours }
                                  (newHours as any)[day].close = e.target.value
                                  setFormData({...formData, businessHours: newHours})
                                }}
                                className="bg-[#161b2b] border border-[#4a4455]/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none w-full"
                              />
                           </div>
                         )}
                      </div>
                    )
                 })}
               </div>

               <div className="mt-10 p-6 rounded-3xl bg-[#7c3aed]/5 border border-[#7c3aed]/10 text-center">
                  <Palette className="w-8 h-8 text-[#7c3aed] mx-auto mb-3" />
                  <p className="text-xs text-[#958da1] leading-relaxed">Changes here will be reflected on your public booking profile instantly.</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
