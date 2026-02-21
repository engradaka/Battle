"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

/*************  ✨ Windsurf Command ⭐  *************/
/*******  c63cce74-76c8-4aae-94f2-08b74391db0c  *******/  const handleStartChallenge = () => {
    router.push("/team-setup")
  }

  if (!isMounted) {
    return (
      <div className="h-screen bg-white flex items-center justify-center overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-white relative overflow-hidden">
      {/* Background pattern for mobile */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, #1e40af 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div 
        className="hidden md:block absolute left-0 top-0 h-full w-1/3"
        style={{ 
          backgroundImage: 'url(/nbk-building.png)',
          backgroundSize: 'contain',
          backgroundPosition: 'left center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      
      <div className="absolute top-4 right-4 md:top-6 md:right-6 z-20">
        <Image
          src="/nbk-logo.png"
          alt="NBK Logo"
          width={150}
          height={60}
          priority
          className="w-20 md:w-28 lg:w-36 h-auto"
        />
      </div>
      
      <div className="relative z-10 h-full flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4 md:p-6">
          <div className="flex flex-col items-center w-full max-w-md mx-auto">
            <div className="mb-4">
              <Image
                src="/diamond.webp"
                alt="Diamond"
                width={300}
                height={300}
                priority
                className="w-48 md:w-64 lg:w-80 h-auto mx-auto"
              />
            </div>
            
            <Card className="w-full shadow-2xl border-0">
              <CardContent className="p-6 text-center">
                <h1 className="text-3xl font-bold text-blue-900 mb-2">{t("welcome")}</h1>
                <p className="text-sm text-blue-600 font-semibold mb-4">{t("tagline")}</p>
                <p className="text-gray-600 mb-6">{t("description")}</p>
                <Button
                  onClick={handleStartChallenge}
                  className="w-full h-14 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-500 text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:scale-105"
                >
                  {t("start_challenge")}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <footer className="relative z-10 py-4 text-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} NBK. Digital Channel. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  )
}