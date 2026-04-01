"use client"

import React, { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Clock, 
  Instagram, 
  Facebook, 
  Twitter, 
  ChevronRight, 
  Star,
  ShieldCheck,
  Zap,
  ArrowRight,
  Globe
} from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function PublicSalonProfile() {
  const { slug } = useParams()
  const [salon, setSalon] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSalon()
  }, [slug])

  async function fetchSalon() {
    try {
      const res = await fetch(`/api/public/tenant/${slug}`)
      const data = await res.json()
      setSalon(data)
    } catch (err) {
      console.error("Failed to fetch salon:", err)
    } finally {
      setLoading(false)
    }
  }

  const isStoreOpen = () => {
    if (!salon?.businessHours) return false
    const now = new Date()
    const day = now.toLocaleDateString('en-US', { weekday: 'long' })
    const hours = salon.businessHours.find((h: any) => h.day === day)
    
    if (!hours || !hours.isOpen) return false
    
    const [openH, openM] = hours.openTime.split(':').map(Number)
    const [closeH, closeM] = hours.closeTime.split(':').map(Number)
    
    const openDate = new Date(now)
    openDate.setHours(openH, openM, 0)
    
    const closeDate = new Date(now)
    closeDate.setHours(closeH, closeM, 0)
    
    return now >= openDate && now <= closeDate
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-[#7c3aed]/20 border-t-[#7c3aed] rounded-full animate-spin" />
    </div>
  )

  if (!salon) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6 text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4 text-[#7c3aed]">Salon Not Found</h1>
        <p className="text-[#958da1] mb-8">The wellness space you're looking for doesn't exist or has moved.</p>
        <Link href="/" className="bg-[#7c3aed] px-8 py-3 rounded-full font-bold">Back to WellnessOS</Link>
      </div>
    </div>
  )

  const isOpen = isStoreOpen()

  return (
    <div className="min-h-screen bg-[#050505] text-white pb-32">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-[60vh] w-full overflow-hidden"
      >
        <div className="absolute inset-0">
          <img 
            src={salon.coverImage || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000"} 
            className="w-full h-full object-cover scale-105"
            alt={salon.name}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
        </div>

        <div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
            <motion.div 
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex-1"
            >
              <div className="flex items-center gap-3 mb-4">
                 <span className={`px-4 py-1.5 rounded-full text-[0.7rem] font-bold uppercase tracking-widest border transition-all duration-500 ${
                   isOpen 
                   ? 'bg-[#13ec80]/10 text-[#13ec80] border-[#13ec80]/20 shadow-[0_0_20px_rgba(19,236,128,0.1)]' 
                   : 'bg-red-500/10 text-red-500 border-red-500/20'
                 }`}>
                   {isOpen ? '● Open Now' : '○ Closed'}
                 </span>
                 <div className="flex items-center gap-1 text-[#fbbf24] bg-[#fbbf24]/10 px-3 py-1.5 rounded-full border border-[#fbbf24]/10">
                   <Star className="w-3 h-3 fill-current" />
                   <span className="text-[0.65rem] font-bold">5.0 (42 Reviews)</span>
                 </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">{salon.name}</h1>
              <div className="flex flex-wrap items-center gap-6 text-[#958da1]">
                {salon.address && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#7c3aed]" />
                    <span className="text-sm font-medium">{salon.address}</span>
                  </div>
                )}
                {salon.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-[#7c3aed]" />
                    <span className="text-sm font-medium">{salon.phone}</span>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Link 
                href={`/s/${slug}/book`}
                className="group relative inline-flex items-center gap-3 bg-[#7c3aed] hover:bg-[#6d28d9] text-white px-10 py-5 rounded-[2rem] font-bold text-lg transition-all duration-300 shadow-[0_10px_40px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_50px_rgba(124,58,237,0.5)] overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <span>Reserve Appointment</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Content Grid */}
      <section className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 mt-16">
        {/* Left Column: Services */}
        <div className="lg:col-span-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
              Service Menu
              <div className="h-[2px] flex-1 bg-gradient-to-r from-[#7c3aed]/50 to-transparent" />
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {salon.services.map((service: any, i: number) => (
                <motion.div 
                  key={service.id}
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative p-6 rounded-[2rem] bg-[#1a1a1a]/40 border border-white/5 hover:border-[#7c3aed]/40 transition-all duration-500 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Zap className="w-4 h-4 text-[#7c3aed]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-[#d2bbff] transition-colors">{service.name}</h3>
                  <p className="text-[#958da1] text-sm mb-6 line-clamp-2 leading-relaxed font-light">
                    {service.description || "A signature wellness experience tailored to your unique ritual."}
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                       <span className="text-2xl font-bold text-white tracking-tight">${service.price}</span>
                       <span className="text-[#4a4a4a] text-[0.65rem] font-bold uppercase tracking-widest">{service.duration} mins</span>
                    </div>
                    <Link 
                      href={`/s/${slug}/book?service=${service.id}`}
                      className="bg-white/5 group-hover:bg-[#7c3aed] p-3 rounded-2xl transition-all duration-300"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-8">
           {/* About Card */}
           <motion.div 
             initial={{ x: 20, opacity: 0 }}
             whileInView={{ x: 0, opacity: 1 }}
             viewport={{ once: true }}
             className="p-8 rounded-[2.5rem] bg-[#1a1a1a]/40 border border-white/5 shadow-xl"
           >
              <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
                 <ShieldCheck className="w-5 h-5 text-[#7c3aed]" />
                 Expertise
              </h3>
              <p className="text-[#958da1] text-sm leading-relaxed font-light mb-8 italic">
                "{salon.description || "Experience the pinnacle of wellness craftsmanship. We combine ancestral wisdom with modern techniques for an unparalleled sensory ritual."}"
              </p>
              
              <div className="flex flex-col gap-6">
                 <div>
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#4a4a4a] mb-4">Operational Rituals</h4>
                    <div className="flex flex-col gap-3">
                      {salon.businessHours.map((h: any) => (
                        <div key={h.id} className="flex justify-between items-center text-sm">
                          <span className={`transition-colors duration-500 ${h.isOpen ? 'text-[#958da1]' : 'text-[#4a4a4a]'}`}>{h.day}</span>
                          <span className={`font-medium transition-colors duration-500 ${h.isOpen ? 'text-white' : 'text-[#4a4a4a]'}`}>
                            {h.isOpen ? `${h.openTime} - ${h.closeTime}` : "Closed"}
                          </span>
                        </div>
                      ))}
                    </div>
                 </div>

                 <div className="pt-6 border-t border-white/5">
                    <h4 className="text-[0.7rem] font-bold uppercase tracking-widest text-[#4a4a4a] mb-4">Connect</h4>
                    <div className="flex gap-4">
                      {salon.email && (
                        <Link href={`mailto:${salon.email}`} className="p-3 bg-white/5 rounded-2xl hover:bg-[#7c3aed]/20 transition-colors">
                          <Globe className="w-5 h-5" />
                        </Link>
                      )}
                      <Link href="#" className="p-3 bg-white/5 rounded-2xl hover:bg-[#7c3aed]/20 transition-colors">
                        <Instagram className="w-5 h-5" />
                      </Link>
                      <Link href="#" className="p-3 bg-white/5 rounded-2xl hover:bg-[#7c3aed]/20 transition-colors">
                        <Facebook className="w-5 h-5" />
                      </Link>
                    </div>
                 </div>
              </div>
           </motion.div>
        </div>
      </section>
    </div>
  )
}
