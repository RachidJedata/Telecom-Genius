"use client"


import { Wifi, Radio, Cpu, Network, Server, Smartphone, Zap, Database } from "lucide-react"
import Link from "next/link"
import { Button } from "./button"
import { cn } from "@/app/lib/utils"

const chapters = [
  {
    id: "wireless-fundamentals",
    title: "Wireless Fundamentals",
    icon: Wifi,
  },
  {
    id: "radio-networks",
    title: "Radio Networks",
    icon: Radio,
  },
  {
    id: "digital-signal-processing",
    title: "Digital Signal Processing",
    icon: Cpu,
  },
  {
    id: "network-protocols",
    title: "Network Protocols",
    icon: Network,
  },
  {
    id: "cloud-infrastructure",
    title: "Cloud Infrastructure",
    icon: Server,
  },
  {
    id: "mobile-communications",
    title: "Mobile Communications",
    icon: Smartphone,
  },
  {
    id: "optical-networks",
    title: "Optical Networks",
    icon: Zap,
  },
  {
    id: "data-networks",
    title: "Data Networks",
    icon: Database,
  },
]

export function ChapterNavigation({ currentChapterId }: { currentChapterId: string }) {
  return (
    <nav className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 px-2 text-gray-800 dark:text-gray-200">Chapters</h2>
      <ul className="space-y-1">
        {chapters.map((chapter) => {
          const Icon = chapter.icon
          const isActive = chapter.id === currentChapterId

          return (
            <li key={chapter.id}>
              <Button
                variant="ghost"
                className={cn("w-full justify-start gap-2", isActive && "bg-primary/10 text-primary font-medium")}
                asChild
              >
                <Link href={`/chapters/${chapter.id}`}>
                  <Icon className="h-4 w-4" />
                  <span>{chapter.title}</span>
                </Link>
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

