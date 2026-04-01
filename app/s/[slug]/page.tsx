import React from "react"
import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { 
  Clock, 
  MapPin, 
  Phone, 
  Globe, 
  Instagram, 
  Facebook, 
  Twitter, 
  Star, 
  CheckCircle2, 
  ChevronRight, 
  Tag
} from "lucide-react"
import Link from "next/link"

export default async function PublicSalonPage({
  params
}: {
  params: { slug: string }
}) {
  const { slug } = params

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      services: {
        where: { isActive: true },
        orderBy: { category: 'asc' }
      },
      media: {
        where: { isCover: true },
        take: 1
      }
    }
  })

  if (!tenant) {
    notFound()
  }

  const coverImage = tenant.media[0]?.url || tenant.coverImageUrl

  return (
    <div className="flex flex-col gap-12 w-full max-w-6xl mx-auto px-6 py-12">
      {/* Hero Section */}
      <section className="relative h-[25rem] md:h-[35rem] rounded-[3rem] overflow-hidden group shadow-2xl">
        {coverImage ? (
          <img src={coverImage} alt={tenant.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1c2237] to-[#0e1322] flex items-center justify-center">
            <h2 className="text-4xl font-bold text-[#4a4455] tracking-tight">{tenant.name}</h2>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-12">
          <div className="flex items-center gap-4 mb-4">
            <span className="bg-[#7c3aed] text-white px-3 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
              <Star className="w-3 h-3 fill-white" />
              Verified Space
            </span>
            <span className="text-white/60 text-sm font-medium">{tenant.category}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-none mb-4">{tenant.name}</h1>
          <p className="text-[#ccc3d8] text-lg max-w-2xl font-light line-clamp-2">{tenant.description || "Transforming wellness, one appointment at a time."}</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Side: Services & About */}
        <div className="lg:col-span-8 flex flex-col gap-16">
          {/* About Section */}
          {tenant.description && (
            <section className="bg-[#161b2b]/40 border border-[#4a4455]/10 p-10 rounded-[2.5rem]">
              <h2 className="text-3xl font-bold text-white mb-6">About Us</h2>
              <p className="text-[#ccc3d8] leading-relaxed text-lg font-light">{tenant.description}</p>
            </section>
          )}

          {/* Services Menu */}
          <section className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-white">Our Services</h2>
              <Link 
                href={`/s/${slug}/book`}
                className="text-[#7c3aed] font-bold flex items-center gap-2 hover:translate-x-1 transition-transform"
              >
                Book all <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tenant.services.map((service) => (
                <Link 
                  key={service.id}
                  href={`/s/${slug}/book?serviceId=${service.id}`}
                  className="group bg-[#161b2b]/40 hover:bg-[#161b2b] border border-[#4a4455]/10 hover:border-[#7c3aed]/30 p-8 rounded-[2.5rem] transition-all duration-300 flex flex-col gap-4 shadow-xl hover:shadow-[#7c3aed]/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#7c3aed]/10 to-transparent rounded-bl-[5rem]" />
                  
                  <div className="flex justify-between items-start relative">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center text-[#d2bbff]">
                        <Tag className="w-5 h-5" />
                      </div>
                      <span className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest group-hover:text-[#958da1] transition-colors">{service.category}</span>
                    </div>
                    <span className="text-2xl font-bold text-white tracking-tight">${service.price}</span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">{service.name}</h3>
                    <p className="text-[#958da1] text-sm font-medium line-clamp-1">{service.description || `Luxury ${service.name} treatment session.`}</p>
                  </div>

                  <div className="flex items-center gap-4 mt-auto text-sm text-[#4a4455] group-hover:text-[#958da1] transition-colors">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {service.duration} mins
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right Side: Contact & Info */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* Action Card */}
          <div className="bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] p-10 rounded-[2.5rem] shadow-2xl flex flex-col gap-8 text-center text-[#25005a] sticky top-32 group">
             <h3 className="text-3xl font-black tracking-tight leading-none uppercase italic">Experience Excellence</h3>
             <p className="font-bold opacity-80 leading-relaxed uppercase tracking-widest text-xs">Transform your routine into a ritual. Book your escape today.</p>
             <Link 
              href={`/s/${slug}/book`}
              className="bg-[#25005a] text-white py-5 rounded-2xl text-lg font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
             >
               Start Journey <ChevronRight className="w-5 h-5" />
             </Link>
          </div>

          {/* Contact Details */}
          <div className="bg-[#161b2b]/40 border border-[#4a4455]/10 p-8 rounded-[2.5rem] flex flex-col gap-8">
            <h3 className="text-xl font-bold text-white tracking-tight">Contact Information</h3>
            
            <div className="flex flex-col gap-6">
              {tenant.address && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2f3445] flex items-center justify-center text-[#d2bbff] shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest mb-0.5">Address</p>
                    <p className="text-white text-sm font-medium">{tenant.address}</p>
                  </div>
                </div>
              )}

              {tenant.phone && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2f3445] flex items-center justify-center text-[#d2bbff] shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest mb-0.5">Phone</p>
                    <p className="text-white text-sm font-medium">{tenant.phone}</p>
                  </div>
                </div>
              )}

              {tenant.email && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2f3445] flex items-center justify-center text-[#d2bbff] shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[0.65rem] font-bold text-[#4a4455] uppercase tracking-widest mb-0.5">Email</p>
                    <p className="text-white text-sm font-medium">{tenant.email}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="pt-6 border-t border-[#4a4455]/10 flex justify-center gap-6">
              <Link href="#" className="p-3 bg-[#2f3445]/40 rounded-xl text-[#958da1] hover:text-[#7c3aed] transition-colors"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="p-3 bg-[#2f3445]/40 rounded-xl text-[#958da1] hover:text-[#7c3aed] transition-colors"><Facebook className="w-5 h-5" /></Link>
              <Link href="#" className="p-3 bg-[#2f3445]/40 rounded-xl text-[#958da1] hover:text-[#7c3aed] transition-colors"><Twitter className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
