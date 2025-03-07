"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"
import { Wifi, Radio, Cpu, Network, Server, Smartphone, Zap, Database } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

const chapters = [
  {
    id: "wireless-fundamentals",
    title: "Wireless Fundamentals",
    description: "Learn about electromagnetic waves, frequency bands, and modulation techniques.",
    icon: Wifi,
  },
  {
    id: "radio-networks",
    title: "Radio Networks",
    description: "Explore cellular networks, radio resource management, and signal propagation.",
    icon: Radio,
  },
  {
    id: "digital-signal-processing",
    title: "Digital Signal Processing",
    description: "Understand sampling, filtering, and digital modulation techniques.",
    icon: Cpu,
  },
  {
    id: "network-protocols",
    title: "Network Protocols",
    description: "Study TCP/IP, routing protocols, and network architecture.",
    icon: Network,
  },
  {
    id: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    description: "Learn about virtualization, cloud computing, and distributed systems.",
    icon: Server,
  },
  {
    id: "mobile-communications",
    title: "Mobile Communications",
    description: "Explore 4G, 5G technologies, and mobile network architecture.",
    icon: Smartphone,
  },
  {
    id: "optical-networks",
    title: "Optical Networks",
    description: "Study fiber optics, WDM technology, and optical transmission systems.",
    icon: Zap,
  },
  {
    id: "data-networks",
    title: "Data Networks",
    description: "Learn about data centers, storage networks, and network security.",
    icon: Database,
  },
]

export function ChapterGrid() {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const handleCardClick = (id: string) => {
    router.push(`/chapters/${id}`)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {chapters.map((chapter) => {
        const Icon = chapter.icon
        const isHovered = hoveredId === chapter.id

        return (
          <Card
            key={chapter.id}
            className={`cursor-pointer transition-all duration-300 ${
              isHovered ? "transform scale-105 shadow-lg border-primary" : "hover:border-primary/50"
            }`}
            onClick={() => handleCardClick(chapter.id)}
            onMouseEnter={() => setHoveredId(chapter.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <CardHeader className="pb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary transition-all duration-300 ${
                  isHovered ? "bg-primary/20" : ""
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <CardTitle className="mt-4">{chapter.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{chapter.description}</CardDescription>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

