import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(
  price: number | string,
  currency: string = "USD",
  notation: Intl.NumberFormatOptions["notation"] = "standard"
) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "SBTC" ? "BTC" : currency,
    notation,
    maximumFractionDigits: currency === "SBTC" ? 8 : 2,
  }).format(typeof price === "string" ? parseFloat(price) : price)
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date))
}

export function formatRelativeTime(date: Date | string) {
  const now = new Date()
  const target = new Date(date)
  const diffInSeconds = (now.getTime() - target.getTime()) / 1000

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  if (diffInSeconds < 60) {
    return rtf.format(-Math.floor(diffInSeconds), "second")
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute")
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour")
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day")
  }
}

export function truncateString(str: string, length: number) {
  if (str.length <= length) return str
  return str.slice(0, length) + "..."
}

export function generateSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatFileSize(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Byte"
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export async function copyToClipboard(text: string) {
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }
  return false
}