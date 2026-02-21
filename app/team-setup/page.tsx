"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/lib/language-context"
import { Users, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function TeamSetupPage() {
  const [team1Name, setTeam1Name] = useState("")
  const [team2Name, setTeam2Name] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const { toast } = useToast()
  const maxLength = 30

  const handleNext = async () => {
    if (team1Name.trim() && team2Name.trim()) {
      setIsLoading(true)

      // Store team names in localStorage
      localStorage.setItem("team1Name", team1Name.trim())
      localStorage.setItem("team2Name", team2Name.trim())

      // Show success toast
      toast({
        title: "Teams Created! 🎉",
        description: `${team1Name} vs ${team2Name} - Let's select categories!`,
        variant: "success",
      })

      // Simulate loading for better UX
      setTimeout(() => {
        router.push("/category-selection")
      }, 1000)
    }
  }

  const handleBack = () => {
    router.push("/")
  }

  const isFormValid = team1Name.trim() && team2Name.trim()

  return (
      <div className="min-h-screen p-2 sm:p-0">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-full max-w-2xl px-2 sm:px-0">
          <Card className="shadow-2xl border-0 bg-white/80">
            <CardHeader className="text-center pb-3 sm:pb-4 pt-4 sm:pt-6">
              {/* Teams Icon */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-800 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>

              <div>
                <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900">{t("team_setup_description")}</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 px-3 sm:px-6 pb-4 sm:pb-6">
              {/* Team 1 Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg hover:scale-110 transition-transform">
                    1
                  </div>
                  <label className="text-lg sm:text-xl font-semibold text-gray-900">{t("team_one")}</label>
                  {team1Name.trim() && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  )}
                </div>
                <Input
                  value={team1Name}
                  onChange={(e) => setTeam1Name(e.target.value.slice(0, maxLength))}
                  placeholder={t("enter_team_one_name")}
                  className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl transition-all duration-300"
                  maxLength={maxLength}
                />
                <p className="text-xs text-gray-500 text-right">{team1Name.length}/{maxLength}</p>
              </div>

              {/* Team 2 Input */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg hover:scale-110 transition-transform">
                    2
                  </div>
                  <label className="text-lg sm:text-xl font-semibold text-gray-900">{t("team_two")}</label>
                  {team2Name.trim() && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  )}
                </div>
                <Input
                  value={team2Name}
                  onChange={(e) => setTeam2Name(e.target.value.slice(0, maxLength))}
                  placeholder={t("enter_team_two_name")}
                  className="h-12 sm:h-14 text-base sm:text-lg border-2 border-gray-200 focus:border-blue-600 focus:ring-blue-600 rounded-xl transition-all duration-300"
                  maxLength={maxLength}
                />
                <p className="text-xs text-gray-500 text-right">{team2Name.length}/{maxLength}</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 sm:gap-4 pt-3">
                <div className="flex-1">
                  <Button
                    onClick={handleBack}
                    variant="outline"
                    className="w-full h-12 sm:h-14 border-2 border-gray-200 hover:bg-gray-50 bg-transparent rounded-xl text-base sm:text-lg hover:scale-105 transition-transform"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    {t("back")}
                  </Button>
                </div>

                <div className="flex-1">
                  <Button
                    onClick={handleNext}
                    disabled={!isFormValid || isLoading}
                    className="w-full h-12 sm:h-14 bg-gradient-to-r from-blue-800 to-blue-600 hover:from-blue-700 hover:to-blue-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-base sm:text-lg transition-all duration-300 hover:scale-105"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full mr-2 animate-spin" />
                    ) : (
                      <>
                        {t("next")}
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Validation Message */}
              {!isFormValid && (team1Name || team2Name) && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-4 text-center">
                  <p className="text-yellow-800 font-medium text-sm sm:text-base">{t("enter_both_team_names")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}