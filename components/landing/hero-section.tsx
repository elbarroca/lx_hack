"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

interface HeroSectionProps {
  isLoggedIn: boolean
}

export default function HeroSection({ isLoggedIn }: HeroSectionProps) {
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 md:px-8 py-20">
      <div className="absolute inset-0 bg-gradient-to-b from-black to-black/90 z-0"></div>

      <div className="container mx-auto relative z-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            >
              Your Single Source of Truth for Every Meeting.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg md:text-xl text-gray-300"
            >
              Veritas AI deploys an autonomous AI agent into your meetings to create a verifiable, intelligent record of
              every commitment. Turn conversations into concrete actions and unbreakable accountability.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link href="/auth/login">
                <Button
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-6 text-lg"
                >
                  {isLoggedIn ? "Get Started" : "Start Your Free Trial"}
                </Button>
              </Link>
            </motion.div>
          </div>

          <div className="relative h-[400px] lg:h-[500px]">
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatedHeroVisual animationComplete={animationComplete} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AnimatedHeroVisual({ animationComplete }: { animationComplete: boolean }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Meeting UI Element */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[180px] h-[240px] bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
      >
        <div className="h-10 bg-gray-700 flex items-center px-3">
          <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="p-3">
          <div className="grid grid-cols-2 gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full h-16 bg-gray-700 rounded-md flex items-center justify-center">
                <div className="w-8 h-8 rounded-full bg-gray-600"></div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Central Brain Icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative w-32 h-32 rounded-full bg-black border-2 border-green-500 flex items-center justify-center z-10"
      >
        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-pulse"></div>
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M12 3C7.58172 3 4 6.58172 4 11C4 13.7547 5.33945 16.1901 7.39309 17.6573C7.68414 17.8701 8 17.6529 8 17.2828V15.5351C8 15.3051 7.83589 15.1078 7.61442 15.0406C6.64206 14.7543 6.23978 14.2948 6.09242 13.9312C5.9574 13.5926 6.00165 13.3757 6.1757 13.1402C6.34298 12.9138 6.64822 12.8735 6.9007 12.9979C7.82151 13.4661 8.14882 14.1007 8.62956 14.1007C9.1103 14.1007 9.23912 14.0355 9.23912 13.7703C9.23912 13.1134 9.22087 12.4249 9.77313 11.9999C7.96768 11.9999 6.5 10.9199 6.5 8.94787C6.5 8.10487 6.77711 7.32131 7.29454 6.70563C7.16204 6.17246 7.10409 5.31161 7.64416 4.47186C8.92691 4.47186 9.60462 5.20968 9.77892 5.41454C10.3906 5.20218 11.0736 5.08334 11.7995 5.08334C12.5255 5.08334 13.2085 5.20218 13.8201 5.41454C13.9944 5.20968 14.6721 4.47186 15.9549 4.47186C16.495 5.31161 16.437 6.17246 16.3045 6.70563C16.822 7.32131 17.0991 8.10487 17.0991 8.94787C17.0991 10.9199 15.6314 11.9999 13.826 11.9999C14.5 12.5 14.5 13.5 14.5 14C14.5 14.5 14.5 15.5351 14.5 15.5351C14.5 15.9052 14.8159 16.1224 15.1069 15.9096C17.1606 14.4424 18.5 12.0071 18.5 9.25236C18.5 4.83408 14.9183 1.25236 10.5 1.25236"
            stroke="#10b981"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>

      {/* Sound Wave Animation */}
      {animationComplete ? (
        <>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5 }}
            className="absolute left-[180px] top-1/2 h-0.5 w-[80px] bg-green-500 origin-left"
          ></motion.div>
          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="absolute right-[180px] top-1/2 h-0.5 w-[80px] bg-green-500 origin-right"
          ></motion.div>
        </>
      ) : (
        <>
          <motion.div
            animate={{
              opacity: [0.2, 1, 0.2],
              height: [10, 30, 10],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1,
              ease: "easeInOut",
            }}
            className="absolute left-[200px] top-1/2 -translate-y-1/2 w-1 h-5 bg-green-500 rounded-full"
          ></motion.div>
          <motion.div
            animate={{
              opacity: [0.2, 1, 0.2],
              height: [15, 40, 15],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1,
              delay: 0.2,
              ease: "easeInOut",
            }}
            className="absolute left-[210px] top-1/2 -translate-y-1/2 w-1 h-5 bg-green-500 rounded-full"
          ></motion.div>
          <motion.div
            animate={{
              opacity: [0.2, 1, 0.2],
              height: [20, 50, 20],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1,
              delay: 0.4,
              ease: "easeInOut",
            }}
            className="absolute left-[220px] top-1/2 -translate-y-1/2 w-1 h-5 bg-green-500 rounded-full"
          ></motion.div>
        </>
      )}

      {/* Output Data Blocks */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: animationComplete ? 1 : 0, x: animationComplete ? 0 : 50 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[180px] space-y-4"
      >
        <div className="w-full h-[100px] bg-gray-800 rounded-lg border border-green-500/30 p-3">
          <div className="h-4 w-3/4 bg-green-500/20 rounded mb-2"></div>
          <div className="h-3 w-full bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-full bg-gray-700 rounded mb-2"></div>
          <div className="h-3 w-2/3 bg-gray-700 rounded"></div>
        </div>
        <div className="w-full h-[100px] bg-gray-800 rounded-lg border border-green-500/30 p-3">
          <div className="h-4 w-1/2 bg-green-500/20 rounded mb-2"></div>
          <div className="flex items-center mb-2">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <div className="h-3 w-3/4 bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center mb-2">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <div className="h-3 w-2/3 bg-gray-700 rounded"></div>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500 rounded-full mr-2"></div>
            <div className="h-3 w-1/2 bg-gray-700 rounded"></div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
