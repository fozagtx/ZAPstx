"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  X, 
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react"
import { toast } from "sonner"
import { formatFileSize } from "@/lib/utils"
import Image from "next/image"

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedFileTypes?: string[]
  uploadType: "productImage" | "productFile" | "avatar"
}

interface UploadedFile {
  url: string
  name: string
  size: number
  type: string
  key: string
}

interface FileWithPreview extends File {
  preview?: string
}

export function FileUpload({
  onUpload,
  maxFiles = 1,
  maxSize = 4 * 1024 * 1024, // 4MB default
  acceptedFileTypes,
  uploadType,
}: FileUploadProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

  const getAcceptedTypes = () => {
    if (acceptedFileTypes) {
      return acceptedFileTypes.reduce((acc, type) => {
        acc[type] = []
        return acc
      }, {} as Record<string, string[]>)
    }

    switch (uploadType) {
      case "productImage":
        return {
          "image/*": [".png", ".jpg", ".jpeg", ".webp"]
        }
      case "productFile":
        return {
          "application/zip": [".zip"],
          "application/pdf": [".pdf"],
          "image/*": [".png", ".jpg", ".jpeg", ".svg"],
          "text/*": [".txt", ".md"],
          "application/json": [".json"]
        }
      case "avatar":
        return {
          "image/*": [".png", ".jpg", ".jpeg"]
        }
      default:
        return {}
    }
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        toast.error(`File ${file.file.name} was rejected: ${file.errors[0]?.message}`)
      })
      return
    }

    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      })
    )

    setFiles(prev => [...prev, ...newFiles].slice(0, maxFiles))
  }, [maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: getAcceptedTypes(),
    maxSize,
    maxFiles,
    multiple: maxFiles > 1,
  })

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev]
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview!)
      }
      newFiles.splice(index, 1)
      return newFiles
    })
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // TODO: Implement actual UploadThing upload
      // For now, simulate upload
      await new Promise(resolve => setTimeout(resolve, 2000))

      const uploadedFiles: UploadedFile[] = files.map((file, index) => ({
        url: file.preview || `https://example.com/uploads/${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        key: `upload_${Date.now()}_${index}`,
      }))

      setUploadProgress(100)
      setUploadedFiles(uploadedFiles)
      onUpload(uploadedFiles)
      
      toast.success(`${files.length} file(s) uploaded successfully!`)
      
      // Clean up
      files.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview)
        }
      })
      setFiles([])
    } catch (error) {
      toast.error("Upload failed. Please try again.")
      console.error("Upload error:", error)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon
    return File
  }

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card className="glass-card">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? "border-brand-500 bg-brand-50 dark:bg-brand-950/20" 
                : "border-muted-foreground/25 hover:border-brand-500"
              }
            `}
          >
            <input {...getInputProps()} />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? "Drop files here" : "Drag & drop files here"}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline">
                  Max {maxFiles} file{maxFiles > 1 ? "s" : ""}
                </Badge>
                <Badge variant="outline">
                  Up to {formatFileSize(maxSize)}
                </Badge>
                {uploadType === "productImage" && (
                  <Badge variant="outline">Images only</Badge>
                )}
                {uploadType === "productFile" && (
                  <Badge variant="outline">ZIP, PDF, Images</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Preview */}
      {files.length > 0 && (
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Files to upload</h3>
            <div className="space-y-3">
              {files.map((file, index) => {
                const FileIcon = getFileIcon(file.type)
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      {file.preview ? (
                        <Image
                          src={file.preview}
                          alt={file.name}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                          <FileIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </motion.div>
                )
              })}
            </div>
            
            {/* Upload Progress */}
            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            {/* Upload Button */}
            <div className="mt-4 flex gap-2">
              <Button
                onClick={uploadFiles}
                disabled={uploading}
                className="bg-gradient-to-r from-brand-500 to-purple-500 hover:from-brand-600 hover:to-purple-600"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {files.length} file{files.length > 1 ? "s" : ""}
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  files.forEach(file => {
                    if (file.preview) {
                      URL.revokeObjectURL(file.preview)
                    }
                  })
                  setFiles([])
                }}
                disabled={uploading}
              >
                Clear All
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadedFiles.length > 0 && (
        <Card className="glass-card border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-green-700 dark:text-green-400">
                Upload Complete
              </h3>
            </div>
            
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{file.name}</span>
                  <Badge variant="outline" className="text-green-600">
                    Uploaded
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}