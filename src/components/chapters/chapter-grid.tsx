"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../UI/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import IconDisplay from "../UI/iconDisplay"
import { Courses } from "@prisma/client"
import { turnToUrl } from "@/lib/utils"

export function ChapterGrid({ courses }: { courses: Courses[] }) {
  const router = useRouter()
  const [hoveredId, setHoveredId] = useState<number | undefined>(undefined)

  const handleCardClick = (title: string) => {
    const slug = turnToUrl(title);
    router.push(`/chapters/${slug}`);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => {

        const isHovered = hoveredId === course.courseId

        return (
          <Card
            key={course.courseId}
            className={`cursor-pointer transition-all duration-300 ${isHovered ? "transform scale-105 shadow-lg border-primary" : "hover:border-primary/50"
              }`}
            onClick={() => handleCardClick(course.title)}
            onMouseEnter={() => setHoveredId(course.courseId)}
            onMouseLeave={() => setHoveredId(undefined)}
          >
            <CardHeader className="pb-2">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center bg-primary/10 text-primary transition-all duration-300 ${isHovered ? "bg-primary/20" : ""
                  }`}
              >
                <IconDisplay className="w-6 h-6" iconName={course.icon} />
              </div>
              <CardTitle className="mt-4">{course.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="line-clamp-2">{course.description}</CardDescription>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

