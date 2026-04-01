"use client"
import React, { useState } from "react"
import { ArrowRight, Mail, Lock, Building, User, Globe, Store } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form State
  const [businessName, setBusinessName] = useState("")
  const [businessSlug, setBusinessSlug] = useState("")
  const [adminName, setAdminName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) setStep(2)
    else handleSubmit()
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, businessSlug, adminName, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      // Automatically sign the user in after successful creation
      const signinRes = await signIn("credentials", {
        redirect: false,
        email,
        password
      })

      if (signinRes?.error) {
        setError("Account created, but failed to automatically sign in. Please log in.")
        setLoading(false)
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setError("An unexpected error occurred.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-tight">
          Create space.
        </h1>
        <p className="text-[#ccc3d8] text-lg mt-2 font-light">
          {step === 1 ? "Start your new business workspace." : "Configure your admin credentials."}
        </p>
      </div>

      <div className="bg-[#161b2b]/80 backdrop-blur-[24px] p-1 rounded-3xl shadow-[0_64px_64px_-12px_rgba(124,58,237,0.08)]">
        <form onSubmit={handleNextStep} className="bg-[#2f3445]/40 p-8 rounded-[1.3rem] border border-[#4a4455]/15 flex flex-col gap-6 transition-all duration-500 relative overflow-hidden">
          
          {error && (
            <div className="bg-[#93000a]/20 text-[#ffb4ab] border border-[#93000a]/50 px-4 py-3 rounded-xl text-sm font-medium z-10 relative">
              {error}
            </div>
          )}

          {/* Step Indicator */}
          <div className="flex gap-2 mb-2">
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= 1 ? 'bg-[#7c3aed]' : 'bg-[#4a4455]/30'}`} />
            <div className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${step >= 2 ? 'bg-[#7c3aed]' : 'bg-[#4a4455]/30'}`} />
          </div>

          <div 
            className={`flex flex-col gap-6 transition-all duration-500 w-full ${step === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute pointer-events-none'}`}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
                <Store className="w-5 h-5 stroke-[1.5]" />
              </div>
              <input 
                type="text" 
                placeholder="Business Name (e.g., Lumen Spa)"
                value={businessName}
                onChange={(e) => {
                  setBusinessName(e.target.value)
                  setBusinessSlug(generateSlug(e.target.value))
                }}
                className="w-full bg-[#2f3445]/30 text-white rounded-2xl border border-transparent focus:border-[#7c3aed]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] placeholder:text-[#4a4455] py-4 pl-12 pr-4 outline-none"
                required={step === 1}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
                <Globe className="w-5 h-5 stroke-[1.5]" />
              </div>
              <input 
                type="text" 
                placeholder="Workspace Slug (lumen-spa)"
                value={businessSlug}
                onChange={(e) => setBusinessSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                className="w-full bg-[#2f3445]/30 text-white rounded-2xl border border-transparent focus:border-[#7c3aed]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] placeholder:text-[#4a4455] py-4 pl-12 pr-4 outline-none"
                required={step === 1}
              />
            </div>
          </div>

          <div 
            className={`flex flex-col gap-6 transition-all duration-500 w-full ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full absolute pointer-events-none'}`}
          >
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
                <User className="w-5 h-5 stroke-[1.5]" />
              </div>
              <input 
                type="text" 
                placeholder="Your Full Name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full bg-[#2f3445]/30 text-white rounded-2xl border border-transparent focus:border-[#7c3aed]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] placeholder:text-[#4a4455] py-4 pl-12 pr-4 outline-none"
                required={step === 2}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
                <Mail className="w-5 h-5 stroke-[1.5]" />
              </div>
              <input 
                type="email" 
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2f3445]/30 text-white rounded-2xl border border-transparent focus:border-[#7c3aed]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] placeholder:text-[#4a4455] py-4 pl-12 pr-4 outline-none"
                required={step === 2}
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
                <Lock className="w-5 h-5 stroke-[1.5]" />
              </div>
              <input 
                type="password" 
                placeholder="Secure Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#2f3445]/30 text-white rounded-2xl border border-transparent focus:border-[#7c3aed]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] placeholder:text-[#4a4455] py-4 pl-12 pr-4 outline-none"
                required={step === 2}
                minLength={8}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-2">
            {step === 2 && (
               <button 
                 type="button" 
                 onClick={() => setStep(1)}
                 className="px-6 py-4 rounded-[1rem] bg-[#2f3445]/30 text-white hover:bg-[#2f3445]/60 transition-colors border border-[#4a4455]/15"
               >
                 Back
               </button>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="group relative flex-1 flex justify-between items-center bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-medium text-lg py-4 px-6 rounded-[1rem] hover:saturate-150 hover:brightness-110 transition-all duration-300 disabled:opacity-50"
            >
              <span>{loading ? "Building Workspace..." : step === 1 ? "Continue" : "Launch Workspace"}</span>
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </form>
      </div>

      <div className="text-center text-[#ccc3d8] text-sm">
        Already have a workspace?{" "}
        <Link href="/login" className="text-[#d2bbff] hover:text-white transition-colors underline-offset-4 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  )
}
