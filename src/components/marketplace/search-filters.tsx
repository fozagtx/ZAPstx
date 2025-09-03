"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Filter, X } from "lucide-react"
import { useState } from "react"

const priceRanges = [
  { label: "Free", min: 0, max: 0 },
  { label: "Under 0.01 sBTC", min: 0.001, max: 0.01 },
  { label: "0.01 - 0.05 sBTC", min: 0.01, max: 0.05 },
  { label: "0.05 - 0.1 sBTC", min: 0.05, max: 0.1 },
  { label: "Above 0.1 sBTC", min: 0.1, max: 1 },
]

const ratings = [5, 4, 3, 2, 1]

const tags = [
  "Modern", "Responsive", "Mobile-First", "Dark Mode", "Animation", 
  "TypeScript", "React", "Vue", "Premium", "Professional"
]

const fileTypes = [
  "Figma", "Sketch", "Adobe XD", "PSD", "AI", "SVG", "PNG", "JPG", "ZIP", "PDF"
]

export function SearchFilters() {
  const [priceRange, setPriceRange] = useState([0, 1])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const addFilter = (filter: string) => {
    if (!selectedFilters.includes(filter)) {
      setSelectedFilters([...selectedFilters, filter])
    }
  }

  const removeFilter = (filter: string) => {
    setSelectedFilters(selectedFilters.filter(f => f !== filter))
  }

  const clearAllFilters = () => {
    setSelectedFilters([])
    setPriceRange([0, 1])
  }

  return (
    <div className="space-y-6">
      {/* Active Filters */}
      {selectedFilters.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Active Filters
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedFilters.map((filter) => (
                <Badge
                  key={filter}
                  variant="secondary"
                  className="gap-1 glass-card"
                >
                  {filter}
                  <button
                    onClick={() => removeFilter(filter)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Range */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">Price Range</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={1}
              min={0}
              step={0.001}
              className="w-full"
            />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{priceRange[0].toFixed(3)} sBTC</span>
              <span>{priceRange[1].toFixed(3)} sBTC</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {priceRanges.map((range) => (
              <div key={range.label} className="flex items-center space-x-2">
                <Checkbox
                  id={range.label}
                  checked={selectedFilters.includes(range.label)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      addFilter(range.label)
                    } else {
                      removeFilter(range.label)
                    }
                  }}
                />
                <Label htmlFor={range.label} className="text-sm">
                  {range.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rating */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">Rating</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ratings.map((rating) => (
            <div key={rating} className="flex items-center space-x-2">
              <Checkbox
                id={`rating-${rating}`}
                checked={selectedFilters.includes(`${rating}+ stars`)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addFilter(`${rating}+ stars`)
                  } else {
                    removeFilter(`${rating}+ stars`)
                  }
                }}
              />
              <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 text-sm">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span>& Up</span>
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedFilters.includes(tag) ? "default" : "outline"}
                className="cursor-pointer hover:bg-accent transition-colors"
                onClick={() => {
                  if (selectedFilters.includes(tag)) {
                    removeFilter(tag)
                  } else {
                    addFilter(tag)
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* File Types */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm">File Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {fileTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${type}`}
                checked={selectedFilters.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    addFilter(type)
                  } else {
                    removeFilter(type)
                  }
                }}
              />
              <Label htmlFor={`type-${type}`} className="text-sm">
                {type}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}