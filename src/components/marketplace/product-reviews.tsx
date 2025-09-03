"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, ThumbsUp, MessageCircle, Flag } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"

const reviews = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
      verified: true,
    },
    rating: 5,
    title: "Outstanding quality and design",
    comment: "This UI kit exceeded my expectations! The components are beautifully crafted and the documentation is excellent. Saved me weeks of work on my SaaS project.",
    helpful: 12,
    createdAt: "2024-01-18T10:30:00Z",
    verified: true,
  },
  {
    id: "2",
    user: {
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      verified: false,
    },
    rating: 5,
    title: "Perfect for my admin dashboard",
    comment: "Clean, modern design with great attention to detail. The React components are well-structured and easy to customize. Definitely worth the price!",
    helpful: 8,
    createdAt: "2024-01-16T15:45:00Z",
    verified: false,
  },
  {
    id: "3",
    user: {
      name: "Elena Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      verified: true,
    },
    rating: 4,
    title: "Great components, minor issues",
    comment: "Really solid UI kit with comprehensive components. Had a small issue with the dark mode variants but the support team was quick to help. Overall very satisfied.",
    helpful: 5,
    createdAt: "2024-01-14T09:20:00Z",
    verified: true,
  },
  {
    id: "4",
    user: {
      name: "Alex Thompson",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      verified: false,
    },
    rating: 5,
    title: "Exceptional value",
    comment: "The quality of this kit is amazing for the price. Everything is pixel perfect and the Figma files are well organized. My go-to resource for UI components now.",
    helpful: 15,
    createdAt: "2024-01-12T14:10:00Z",
    verified: false,
  },
]

const ratingDistribution = [
  { stars: 5, count: 89, percentage: 70 },
  { stars: 4, count: 25, percentage: 20 },
  { stars: 3, count: 8, percentage: 6 },
  { stars: 2, count: 3, percentage: 2 },
  { stars: 1, count: 2, percentage: 2 },
]

interface ProductReviewsProps {
  productId: string
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
        <Button variant="outline">Write a Review</Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Rating Summary */}
        <div className="lg:col-span-1">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-center">Overall Rating</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-4xl font-bold">4.9</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on 127 reviews
                </p>
              </div>

              <div className="space-y-3">
                {ratingDistribution.map((rating) => (
                  <div key={rating.stars} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-12">
                      <span>{rating.stars}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <Progress value={rating.percentage} className="flex-1 h-2" />
                    <span className="text-muted-foreground w-8 text-right">
                      {rating.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-6 lg:col-span-2">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Review Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={review.user.avatar} />
                          <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{review.user.name}</h4>
                            {review.user.verified && (
                              <Badge variant="secondary" className="text-xs">
                                Verified
                              </Badge>
                            )}
                            {review.verified && (
                              <Badge variant="outline" className="text-xs">
                                Verified Purchase
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {formatRelativeTime(review.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Review Content */}
                    <div className="space-y-2">
                      <h5 className="font-medium">{review.title}</h5>
                      <p className="text-muted-foreground">{review.comment}</p>
                    </div>

                    {/* Review Actions */}
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({review.helpful})
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Reply
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Load More */}
          <div className="text-center">
            <Button variant="outline" className="glass-card">
              Load More Reviews
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}