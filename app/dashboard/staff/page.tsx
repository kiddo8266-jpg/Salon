"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, MoreHorizontal, User, Mail, Briefcase, Star, Loader2, X, Lock } from "lucide-react"
import { format } from "date-fns"

export default function StaffPage() {
  const [loading, setLoading] = useState(true)
  const [staff, setStaff] = useState<any[]>([])
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    specialization: '',
    bio: ''
  })

  useEffect(() => {
    fetchStaff()
  }, [])

  async function fetchStaff() {
    setLoading(true)
    try {
      const res = await fetch("/api/staff")
      const data = await res.json()
      if (Array.isArray(data)) {
        setStaff(data)
      }
    } catch (err) {
      console.error("Failed to fetch staff:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    
    try {
      const res = await fetch("/api/staff", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const data = await res.json()
      
      if (res.ok) {
        setIsModalOpen(false)
        fetchStaff()
        setFormData({ name: '', email: '', password: '', specialization: '', bio: '' })
      } else {
        setError(data.error || "Something went wrong")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full h-full pb-24">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-none">
            Team.
          </h1>
          <p className="text-[#ccc3d8] text-lg font-light mt-2">
            The experts behind the WellnessOS experience.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group w-full md:w-64">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
              <Search className="w-4 h-4 stroke-[1.5]" />
            </div>
            <input 
              type="text" 
              placeholder="Search team..."
              className="w-full bg-[#161b2b]/95 text-white rounded-[1rem] border border-[#4a4455]/15 focus:border-[#7c3aed]/50 placeholder:text-[#4a4455] py-3 pl-11 pr-4 transition-all duration-300 outline-none text-sm font-medium"
            />
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-medium px-6 py-3 rounded-[1rem] transition-all duration-300 shadow-xl shadow-[#7c3aed]/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Join Team</span>
          </button>
        </div>
      </section>

      {/* Staff Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
          </div>
        ) : staff.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#161b2b]/20 rounded-[2rem] border border-dashed border-[#4a4455]/30">
            <User className="w-12 h-12 text-[#4a4455] mb-4" />
            <h3 className="text-white font-medium text-xl">No team members yet</h3>
            <p className="text-[#958da1]">Start by adding your first professional expert.</p>
          </div>
        ) : (
          staff.map((member) => (
            <div 
              key={member.id}
              className="group relative bg-[#161b2b]/40 hover:bg-[#161b2b] border border-[#4a4455]/10 rounded-[2rem] p-6 transition-all duration-500 overflow-hidden"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#2f3445] border border-[#4a4455]/20 flex items-center justify-center text-[#d2bbff] text-2xl font-bold uppercase overflow-hidden">
                  {member.user?.avatarUrl ? (
                    <img src={member.user.avatarUrl} alt={member.user.name} className="w-full h-full object-cover" />
                  ) : (
                    member.user?.name?.charAt(0)
                  )}
                </div>
                <div className="flex items-center gap-1 bg-[#2f3445]/50 px-3 py-1 rounded-full border border-[#4a4455]/15">
                  <Star className="w-3 h-3 text-[#dcaa2e] fill-[#dcaa2e]" />
                  <span className="text-white text-xs font-bold">{member.rating ? member.rating.toFixed(1) : "5.0"}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">{member.user?.name}</h3>
                <p className="text-[#7c3aed] font-medium text-sm mt-0.5">{member.specialization || "Professional"}</p>
                
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-[#958da1] text-xs font-medium">
                    <Mail className="w-3.5 h-3.5" />
                    {member.user?.email}
                  </div>
                  <div className="flex items-center gap-2 text-[#958da1] text-xs font-medium">
                    <Briefcase className="w-3.5 h-3.5" />
                    Active status
                  </div>
                </div>

                {member.bio && (
                  <p className="text-[#ccc3d8]/60 text-xs mt-4 line-clamp-2 leading-relaxed">
                    {member.bio}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-[#4a4455]/10 pt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="text-xs font-bold text-[#d2bbff] hover:underline uppercase tracking-widest">
                  View Schedule
                </button>
                <button className="text-[#958da1] hover:text-white p-2">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {/* Add Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-[#1c2237] border border-[#4a4455]/30 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-[#4a4455]/20 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-white">Join the Team</h3>
                <p className="text-[#958da1] text-sm mt-1">Create a new professional profile and user account.</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Full Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all text-[#dee1f7]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5" /> Official Email
                  </label>
                  <input 
                    type="email" 
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="name@wellnessos.com"
                    className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all text-[#dee1f7]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5" /> Temp Password
                  </label>
                  <input 
                    type="password" 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all text-[#dee1f7]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5" /> Specialization
                  </label>
                  <input 
                    type="text" 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="e.g. Physiotherapist"
                    className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all text-[#dee1f7]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-[#958da1] uppercase tracking-wider flex items-center gap-2">
                  About / Bio
                </label>
                <textarea 
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about their background..."
                  className="w-full bg-[#0e1322] border border-[#4a4455]/20 rounded-xl px-4 py-3.5 focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] outline-none transition-all h-24 resize-none text-[#dee1f7]"
                />
              </div>

              <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold py-3.5 rounded-xl hover:saturate-150 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#7c3aed]/20"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Onboarding Professional...</span>
                  </div>
                ) : (
                  <span>Add Team Member</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
