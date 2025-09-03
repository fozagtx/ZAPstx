"use client"

import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Palette, 
  Code, 
  Megaphone, 
  Briefcase, 
  Camera, 
  Headphones, 
  Video, 
  Box,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

const categories = [
  { name: "All", slug: "all", icon: Box, count: 2450, color: "bg-gray-500" },
  { name: "Design", slug: "design", icon: Palette, count: 450, color: "bg-pink-500" },
  { name: "Development", slug: "development", icon: Code, count: 380, color: "bg-blue-500" },
  { name: "Marketing", slug: "marketing", icon: Megaphone, count: 220, color: "bg-green-500" },
  { name: "Business", slug: "business", icon: Briefcase, count: 180, color: "bg-purple-500" },
  { name: "Photography", slug: "photography", icon: Camera, count: 150, color: "bg-red-500" },
  { name: "Audio", slug: "audio", icon: Headphones, count: 120, color: "bg-yellow-500" },
  { name: "Video", slug: "video", icon: Video, count: 95, color: "bg-indigo-500" },
]

export function CategoryNav() {
  const [selectedCategory, setSelectedCategory] = useState("all")

  return (
    <section>
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Browse by Category</h2>
        <p className="text-sm text-muted-foreground">Find exactly what you're looking for</p>
      </div>

      <div className="relative">
        <ScrollArea className="w-full">
          <div className="flex gap-3 pb-4">
            {categories.map((category, index) => {
              const Icon = category.icon
              const isActive = selectedCategory === category.slug

              return (
                <motion.div
                  key={category.slug}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Button
                    variant={isActive ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`
                      relative flex-shrink-0 gap-2 glass-card hover:shadow-lg transition-all duration-200
                      ${isActive 
                        ? "bg-gradient-to-r from-brand-500 to-purple-500 text-white border-transparent shadow-lg" 
                        : "hover:bg-accent"
                      }
                    `}
                  >
                    <div className={`flex items-center justify-center w-5 h-5 rounded-full ${category.color} ${isActive ? 'text-white' : 'text-white'}`}>
                      <Icon className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                    <Badge 
                      variant={isActive ? "secondary" : "outline"}
                      className={`ml-1 ${isActive ? 'bg-white/20 text-white border-white/20' : ''}`}
                    >
                      {category.count.toLocaleString()}
                    </Badge>
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </ScrollArea>

        {/* Scroll indicators */}
        <div className="absolute left-0 top-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>

      {/* Quick filters for selected category */}
      {selectedCategory !== "all" && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-4 pt-4 border-t"
        >
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground">Popular in {categories.find(c => c.slug === selectedCategory)?.name}:</span>
            {selectedCategory === "design" && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">UI Kits</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Icons</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Templates</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Fonts</Badge>
              </>
            )}
            {selectedCategory === "development" && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">React</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Vue.js</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">API Tools</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Themes</Badge>
              </>
            )}
            {selectedCategory === "marketing" && (
              <>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Email Templates</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Social Media</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">Analytics</Badge>
                <Badge variant="outline" className="cursor-pointer hover:bg-accent">SEO Tools</Badge>
              </>
            )}
          </div>
        </motion.div>
      )}
    </section>
  )
}