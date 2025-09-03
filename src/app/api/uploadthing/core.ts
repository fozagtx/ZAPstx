import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const f = createUploadthing()

export const ourFileRouter = {
  // Product images
  productImageUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 5 }
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) throw new Error("Unauthorized")
      
      return { userId: (session.user as any).id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Product image upload completed for userId:", metadata.userId)
      console.log("File URL:", file.url)
      
      return { uploadedBy: metadata.userId }
    }),

  // Product files (digital products)
  productFileUploader: f({
    "application/zip": { maxFileSize: "32MB", maxFileCount: 1 },
    "application/pdf": { maxFileSize: "16MB", maxFileCount: 1 },
    "image/png": { maxFileSize: "8MB", maxFileCount: 1 },
    "image/jpeg": { maxFileSize: "8MB", maxFileCount: 1 },
    "image/svg+xml": { maxFileSize: "2MB", maxFileCount: 1 },
    "text/plain": { maxFileSize: "1MB", maxFileCount: 1 },
    "application/json": { maxFileSize: "1MB", maxFileCount: 1 },
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) throw new Error("Unauthorized")
      
      return { userId: (session.user as any).id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Product file upload completed for userId:", metadata.userId)
      console.log("File URL:", file.url)
      
      return { uploadedBy: metadata.userId }
    }),

  // Avatar uploader
  avatarUploader: f({
    image: { maxFileSize: "2MB", maxFileCount: 1 }
  })
    .middleware(async () => {
      const session = await getServerSession(authOptions)
      
      if (!session?.user) throw new Error("Unauthorized")
      
      return { userId: (session.user as any).id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Avatar upload completed for userId:", metadata.userId)
      console.log("File URL:", file.url)
      
      return { uploadedBy: metadata.userId }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter