'use client'

import React from 'react'
import { Check, Layers, Briefcase, Globe, HelpCircle } from 'lucide-react'

interface Platform {
  id: 'greenhouse' | 'lever' | 'workable' | 'wellfound'
  name: string
  url: string
  color: string
  borderColor: string
  bgColor: string
  description: string
  icon: React.ReactNode
}

interface JobPlatformCardsProps {
  selectedPlatforms: string[]
  onTogglePlatform: (platform: string) => void
}

export function JobPlatformCards({ selectedPlatforms, onTogglePlatform }: JobPlatformCardsProps) {
  const platforms: Platform[] = [
    {
      id: 'greenhouse',
      name: 'Greenhouse',
      url: 'greenhouse.io',
      color: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      bgColor: 'bg-emerald-500/10',
      description: 'Popular for mid-size to enterprise tech companies.',
      icon: (
        <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      )
    },
    {
      id: 'lever',
      name: 'Lever',
      url: 'lever.co',
      color: 'text-orange-400',
      borderColor: 'border-orange-500/30',
      bgColor: 'bg-orange-500/10',
      description: 'Widely used by startups and high-growth scale-ups.',
      icon: (
        <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
          <line x1="4" y1="22" x2="4" y2="15" />
        </svg>
      )
    },
    {
      id: 'workable',
      name: 'Workable',
      url: 'workable.com',
      color: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      description: 'Global recruiting platform with varied opportunities.',
      icon: (
        <svg className="w-6 h-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      )
    },
    {
      id: 'wellfound',
      name: 'Wellfound',
      url: 'wellfound.com',
      color: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      bgColor: 'bg-purple-500/10',
      description: 'Formerly AngelList, best for startup & remote jobs.',
      icon: (
        <svg className="w-6 h-6 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      )
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {platforms.map((platform) => {
        const isSelected = selectedPlatforms.includes(platform.id)
        return (
          <button
            key={platform.id}
            onClick={() => onTogglePlatform(platform.id)}
            className={`text-left flex flex-col p-5 rounded-2xl border transition-all duration-300 relative group overflow-hidden bg-zinc-950 shadow-lg hover:shadow-xl ${
              isSelected
                ? `border-zinc-700 bg-zinc-900/60 ring-2 ring-purple-500/20`
                : 'border-zinc-900 bg-zinc-950/40 hover:border-zinc-800 hover:bg-zinc-900/20'
            }`}
          >
            {/* Background Glow */}
            {isSelected && (
              <div className="absolute top-[-50%] right-[-10%] h-[150px] w-[150px] rounded-full opacity-20 blur-[50px] pointer-events-none"
                   style={{ backgroundColor: isSelected ? 'var(--purple-500)' : 'transparent' }} />
            )}

            {/* Selection Checkmark */}
            <div className={`absolute top-4 right-4 h-5 w-5 rounded-full flex items-center justify-center border transition-all duration-300 ${
              isSelected
                ? 'bg-purple-500 border-purple-500 text-white scale-100'
                : 'border-zinc-800 text-transparent scale-90 group-hover:border-zinc-700'
            }`}>
              <Check className="h-3 w-3 stroke-[3]" />
            </div>

            {/* Platform Icon */}
            <div className={`p-3 rounded-xl mb-4 max-w-max transition-transform duration-300 group-hover:scale-110 ${
              isSelected ? platform.bgColor : 'bg-zinc-900/80 text-zinc-400'
            }`}>
              {platform.icon}
            </div>

            {/* Content */}
            <div className="space-y-1">
              <h3 className="font-bold text-white text-base tracking-tight flex items-center gap-1.5">
                {platform.name}
              </h3>
              <p className="text-zinc-500 text-[11px] font-medium tracking-wide uppercase">
                {platform.url}
              </p>
              <p className="text-zinc-400 text-xs mt-2 leading-relaxed font-normal">
                {platform.description}
              </p>
            </div>
          </button>
        )
      })}
    </div>
  )
}
