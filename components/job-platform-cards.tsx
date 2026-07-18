'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface Platform {
  id: 'greenhouse' | 'lever' | 'workable'
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
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src="/platform/greenhouse.jpeg" 
          alt="Greenhouse logo" 
          className="w-10 h-10 object-contain rounded-lg border border-zinc-800 bg-zinc-950 p-1 flex-shrink-0"
        />
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
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src="/platform/lever.png" 
          alt="Lever logo" 
          className="w-10 h-10 object-contain rounded-lg border border-zinc-800 bg-zinc-950 p-1 flex-shrink-0"
        />
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
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src="/platform/workable.png" 
          alt="Workable logo" 
          className="w-10 h-10 object-contain rounded-lg border border-zinc-800 bg-zinc-950 p-1 flex-shrink-0"
        />
      )
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              <div className="absolute top-[-50%] right-[-10%] h-[150px] w-[150px] rounded-full opacity-20 blur-[50px] pointer-events-none bg-purple-500" />
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
