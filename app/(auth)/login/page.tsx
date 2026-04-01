"use client"
import React, { useState } from "react"
import { ArrowRight, Mail, Lock } from "lucide-react"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password
      })
      
      if (res?.error) {
        setError("Invalid credentials")
        setLoading(false)
      } else {
        // Fetch session to determine role for proper redirection
        const sessionRes = await fetch("/api/auth/session")
        const session = await sessionRes.json()
        
        if (session?.user?.role === "SUPER_ADMIN") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
      }
    } catch (err) {
      setError("An error occurred")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="text-center md:text-left">
        <h1 className="text-4xl md:text-[3.5rem] font-semibold tracking-[-0.04em] text-white leading-tight">
          Welcome back.
        </h1>
        <p className="text-[#ccc3d8] text-lg mt-2 font-light">
          Sign in to your Wellness workspace.
        </p>
      </div>

      <div className="bg-[#161b2b]/80 backdrop-blur-[24px] p-1 rounded-3xl shadow-[0_64px_64px_-12px_rgba(124,58,237,0.08)]">
        <form onSubmit={handleLogin} className="bg-[#2f3445]/40 p-8 rounded-[1.3rem] border border-[#4a4455]/15 flex flex-col gap-6">
          
          {error && (
            <div className="bg-[#93000a]/20 text-[#ffb4ab] border border-[#93000a]/50 px-4 py-3 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
              <Mail className="w-5 h-5 stroke-[1.5]" />
            </div>
            <input 
              type="email" 
              placeholder="Email alias@studio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#2f3445]/30 text-white rounded-2xl border border-transparent focus:border-[#7c3aed]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] placeholder:text-[#4a4455] py-4 pl-12 pr-4 transition-all duration-300 outline-none"
              required
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-[#958da1]">
              <Lock className="w-5 h-5 stroke-[1.5]" />
            </div>
            <input 
              type="password" 
              placeholder="Your secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#2f3445]/30 text-white rounded-2xl border border-transparent focus:border-[#7c3aed]/50 focus:shadow-[0_0_12px_rgba(124,58,237,0.2)] placeholder:text-[#4a4455] py-4 pl-12 pr-4 transition-all duration-300 outline-none"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group relative w-full flex justify-between items-center bg-gradient-to-br from-[#d2bbff] to-[#7c3aed] text-[#25005a] font-medium text-lg py-4 px-6 rounded-[1rem] hover:saturate-150 hover:brightness-110 transition-all duration-300 disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Authenticating..." : "Sign in securely"}</span>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>

          <div className="flex items-center justify-center my-2 gap-4">
            <div className="h-[1px] w-full bg-[#4a4455]/20" />
            <span className="text-xs uppercase text-[#958da1] tracking-widest font-medium">Or</span>
            <div className="h-[1px] w-full bg-[#4a4455]/20" />
          </div>

          <button 
            type="button" 
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="w-full flex justify-center items-center gap-3 bg-[#2f3445]/30 text-white font-medium py-4 px-6 rounded-2xl border border-[#4a4455]/15 hover:bg-[#2f3445]/50 transition-all duration-300"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l2.85-2.22.83-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </form>
      </div>

      <div className="text-center text-[#ccc3d8] text-sm">
        New to WellnessOS?{" "}
        <Link href="/register" className="text-[#d2bbff] hover:text-white transition-colors underline-offset-4 hover:underline">
          Create business account
        </Link>
      </div>
    </div>
  )
}
