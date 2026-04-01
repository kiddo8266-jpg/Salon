"use client"

import React, { useState, useEffect } from "react"
import { 
  Plus, 
  Trash2, 
  Star, 
  CheckCircle2, 
  Loader2, 
  ImageIcon, 
  Maximize2, 
  X, 
  Database,
  CloudUpload
} from "lucide-react"
import { UploadButton } from "@/lib/uploadthing"
import { formatDistanceToNow } from "date-fns"

export default function GalleryPage() {
  const [loading, setLoading] = useState(true)
  const [media, setMedia] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  async function fetchMedia() {
    setLoading(true)
    try {
      const res = await fetch("/api/media")
      const data = await res.json()
      if (Array.isArray(data)) {
        setMedia(data)
      }
    } catch (err) {
      console.error("Failed to fetch media:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm("Are you sure you want to delete this media asset? This cannot be undone.")) return
    
    setIsDeleting(id)
    try {
      const res = await fetch(`/api/media/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setMedia(prev => prev.filter(m => m.id !== id))
      }
    } catch (err) {
      console.error("Delete failed:", err)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSetCover = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCover: true })
      })
      if (res.ok) {
        setMedia(prev => prev.map(m => ({
          ...m,
          isCover: m.id === id
        })))
      }
    } catch (err) {
      console.error("Set cover failed:", err)
    }
  }

  return (
    <div className="flex flex-col gap-8 w-full h-full pb-24 relative">
      {/* Editorial Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-none">
            Gallery.
          </h1>
          <p className="text-[#ccc3d8] text-lg font-light mt-2">
            Visual Storytelling for your WellnessOS space.
          </p>
        </div>

        <div className="flex items-center gap-4">
           {/* Uploadthing Button Integration */}
           <div className="bg-[#161b2b]/95 border border-[#4a4455]/20 p-2 rounded-2xl shadow-xl">
             <UploadButton
                endpoint="galleryImage"
                onClientUploadComplete={(res) => {
                  console.log("Files: ", res);
                  fetchMedia();
                }}
                onUploadError={(error: Error) => {
                  alert(`Upload failed: ${error.message}`);
                }}
                appearance={{
                  button: "bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-bold text-sm px-6 h-10 rounded-xl hover:saturate-150 transition-all after:bg-none",
                  allowedContent: "hidden"
                }}
                content={{
                  button({ isUploading }) {
                    if (isUploading) return "Uploading...";
                    return (
                      <div className="flex items-center gap-2">
                        <CloudUpload className="w-4 h-4" />
                        <span>Add Media</span>
                      </div>
                    );
                  }
                }}
              />
           </div>
        </div>
      </section>

      {/* Media Grid */}
      <section className="mt-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#7c3aed] animate-spin" />
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-[#161b2b]/20 rounded-[3rem] border border-dashed border-[#4a4455]/30 group">
             <div className="w-20 h-20 rounded-[2.5rem] bg-[#161b2b] flex items-center justify-center text-[#4a4455] mb-6 group-hover:scale-110 transition-transform duration-500">
               <ImageIcon className="w-10 h-10" />
             </div>
             <h3 className="text-white font-medium text-2xl mb-2">No media assets yet.</h3>
             <p className="text-[#958da1] max-w-xs text-center leading-relaxed">Your gallery is currently empty. Start by uploading high-quality photos of your space.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {media.map((item) => (
              <div 
                key={item.id}
                onClick={() => setSelectedImage(item.url)}
                className="group relative h-80 rounded-[2rem] overflow-hidden bg-[#161b2b] border border-[#4a4455]/10 cursor-pointer shadow-xl transition-all duration-700 hover:shadow-2xl hover:shadow-[#7c3aed]/10"
              >
                <img 
                  src={item.url} 
                  alt={item.filename || "Gallery item"} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {item.isCover && (
                    <div className="px-3 py-1 rounded-full bg-[#7c3aed] text-white text-[0.65rem] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-lg border border-white/20">
                      <Star className="w-3 h-3 fill-white" />
                      Cover Image
                    </div>
                  )}
                </div>

                {/* Hover Actions */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                   <div className="flex gap-2">
                      {!item.isCover && (
                        <button 
                          onClick={(e) => handleSetCover(item.id, e)}
                          className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white p-2.5 rounded-xl border border-white/20 transition-all"
                          title="Set as Cover"
                        >
                          <Star className="w-5 h-5" />
                        </button>
                      )}
                      <button 
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={isDeleting === item.id}
                        className="bg-white/10 backdrop-blur-md hover:bg-red-500/80 text-white p-2.5 rounded-xl border border-white/20 transition-all"
                        title="Delete Media"
                      >
                        {isDeleting === item.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      </button>
                   </div>

                   <button 
                    className="bg-white text-[#25005a] p-2.5 rounded-xl transition-all hover:scale-110"
                    onClick={() => setSelectedImage(item.url)}
                   >
                     <Maximize2 className="w-5 h-5" />
                   </button>
                </div>

                {/* Metadata Overlay */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[0.6rem] text-white/60 font-medium px-2 py-1 rounded-lg bg-black/40 backdrop-blur-sm border border-white/5">
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fullscreen Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button className="absolute top-8 right-8 text-[#958da1] hover:text-white transition-colors p-3 bg-white/5 rounded-full backdrop-blur-md border border-white/10">
            <X className="w-8 h-8" />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Fullscreen Preview" 
            className="max-w-full max-h-full rounded-3xl object-contain shadow-2xl scale-in duration-300 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
