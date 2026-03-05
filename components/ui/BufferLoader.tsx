"use client"

import dynamic from "next/dynamic"
import dogWalk from "@/public/animations/dog-walk.json"

// Load Lottie only on the client to prevent SSR hydration errors or crashes
const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export default function BufferLoader() {
  // Defensive check for the animation data integrity
  // Lottie-web crashes if 'layers' is missing (TypeError: Cannot read properties of undefined (reading 'length'))
  const isValidAnimation = dogWalk && (dogWalk as any).layers && Array.isArray((dogWalk as any).layers);

  if (!isValidAnimation) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <div className="w-48 h-48 flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-gray-500 text-sm font-medium">
          Loading student dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
      <div className="w-48">
        <Lottie animationData={dogWalk} loop />
      </div>

      <p className="text-gray-500 text-sm font-medium">
        Loading student dashboard...
      </p>
    </div>
  )
}