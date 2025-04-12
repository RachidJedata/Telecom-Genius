"use client"

import Link from "next/link"
import { Button } from "../UI/button"
import { cn } from "@/app/lib/utils"
import { Chapters } from "@prisma/client"
import IconDisplay from "../UI/iconDisplay"

export function ChapterNavigation({ chapters, currentChapterId }: { chapters: Chapters[], currentChapterId: string }) {
  return (
    <nav className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4">
      <h2 className="text-lg font-semibold mb-4 px-2 text-gray-800 dark:text-gray-200">Chapitres</h2>
      <ul className="space-y-1">
        {chapters.map((chapter) => {
          const isActive = chapter.chapterId === currentChapterId

          return (
            <li key={chapter.chapterId}>
              <Button
                variant="ghost"
                className={cn("w-full dark:hover:bg-gray-700 justify-start gap-2", isActive && "bg-primary/10 text-primary font-medium")}
                asChild
              >
                <Link href={`/chapters/${chapter.courseId}?chapterId=${chapter.chapterId}`}>
                  <IconDisplay iconName={chapter.icon} className="h-4 w-4" />
                  <span>{chapter.name}</span>
                </Link>
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

