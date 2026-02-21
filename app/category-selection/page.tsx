"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarProvider } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import { sanitizeHTML } from "@/lib/sanitize"
import { ArrowLeft, Check, ArrowRight, Play, Users } from "lucide-react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface Category {
  id: string
  name_ar: string
  name_en: string
  image_url: string | null
  icon: string
  description_en?: string
  description_ar?: string
}

export default function CategorySelectionPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [team1Categories, setTeam1Categories] = useState<string[]>([])
  const [team2Categories, setTeam2Categories] = useState<string[]>([])
  const [currentTeam, setCurrentTeam] = useState(1)
  const [team1Name, setTeam1Name] = useState("")
  const [team2Name, setTeam2Name] = useState("")
  const router = useRouter()
  const { language, t } = useLanguage()

  useEffect(() => {
    const t1Name = localStorage.getItem("team1Name") || "Team 1"
    const t2Name = localStorage.getItem("team2Name") || "Team 2"
    setTeam1Name(sanitizeHTML(t1Name))
    setTeam2Name(sanitizeHTML(t2Name))
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase.from("categories").select("*").order("created_at")
    if (error) {
      console.error("Error fetching categories:", error)
    } else {
      setCategories(data || [])
    }
  }

  // Helper functions for current team
  const getCurrentTeamCategories = () => currentTeam === 1 ? team1Categories : team2Categories
  const setCurrentTeamCategories = (categories: string[]) => {
    if (currentTeam === 1) setTeam1Categories(categories)
    else setTeam2Categories(categories)
  }

  // Alternating selection logic - Draft style
  const handleCategorySelect = (categoryId: string) => {
    const currentCategories = getCurrentTeamCategories()
    const otherCategories = currentTeam === 1 ? team2Categories : team1Categories

    // Prevent picking categories chosen by the other team
    if (otherCategories.includes(categoryId)) return

    // Deselect if already picked (only current team can deselect their own)
    if (currentCategories.includes(categoryId)) {
      setCurrentTeamCategories(currentCategories.filter((id) => id !== categoryId))
      // Don't switch turns when deselecting
      return
    }

    // Add category and switch turns
    if (currentCategories.length < 3) {
      const newCategories = [...currentCategories, categoryId]
      setCurrentTeamCategories(newCategories)
      
      // Auto-switch turns after selection (unless game is complete)
      const totalSelections = newCategories.length + otherCategories.length
      if (totalSelections < 6) { // Not all 6 categories selected yet
        // Switch to other team
        setCurrentTeam(currentTeam === 1 ? 2 : 1)
      }
    }
  }

  // No longer needed - teams switch automatically
  const handleNextTeam = () => {
    // This function is no longer used in alternating selection
  }

  const handleStartGame = () => {
    if (team1Categories.length === 3 && team2Categories.length === 3) {
      localStorage.setItem("team1Categories", JSON.stringify(team1Categories))
      localStorage.setItem("team2Categories", JSON.stringify(team2Categories))
      router.push("/game")
    }
  }

  // UI helpers
  const currentTeamName = currentTeam === 1 ? team1Name : team2Name
  const currentCategories = getCurrentTeamCategories()
  const isTeam1Complete = team1Categories.length === 3
  const isTeam2Complete = team2Categories.length === 3
  const allTeamsComplete = isTeam1Complete && isTeam2Complete
  const getCategoryName = (category: Category) => {
  return language === "ar" ? category.name_ar : category.name_en
}
  const handleBack = () => {
  router.push("/team-setup")
}
  return (
    <div className="flex min-h-screen bg-white">
      <SidebarProvider>
        <main className="flex-1 p-4 sm:p-8 md:ml-16">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
              <h1 className="responsive-title font-bold text-gray-900 text-center mb-6 sm:mb-8">{t("select_categories")}</h1>
              
              {/* Teams Display - Side by Side with VS */}
              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
                  {/* Team 1 Card */}
                  <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
                    currentTeam === 1 ? 'scale-105' : 'scale-100'
                  } ${
                    isTeam1Complete 
                      ? "bg-gradient-to-br from-green-500 to-green-700 shadow-2xl" 
                      : currentTeam === 1
                        ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl"
                        : "bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg"
                  }`}>
                    <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                        <Users className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
                        <span className="text-sm sm:text-lg font-bold text-white truncate">{team1Name}</span>
                        {isTeam1Complete && <span className="text-xl sm:text-2xl flex-shrink-0">🏆</span>}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className={`w-3 sm:w-4 h-3 sm:h-4 rounded-full transition-all ${
                              i < team1Categories.length ? "bg-white scale-110" : "bg-white/30"
                            }`}></div>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white">{team1Categories.length}/3</span>
                      </div>
                    </div>
                  </div>

                  {/* VS Divider */}
                  <div className="flex items-center justify-center flex-shrink-0">
                    <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-full p-3 sm:p-4 shadow-lg">
                      <span className="text-white font-bold text-base sm:text-xl">VS</span>
                    </div>
                  </div>

                  {/* Team 2 Card */}
                  <div className={`relative overflow-hidden rounded-2xl p-4 sm:p-6 transition-all duration-300 ${
                    currentTeam === 2 ? 'scale-105' : 'scale-100'
                  } ${
                    isTeam2Complete 
                      ? "bg-gradient-to-br from-green-500 to-green-700 shadow-2xl" 
                      : currentTeam === 2
                        ? "bg-gradient-to-br from-blue-500 to-blue-700 shadow-2xl"
                        : "bg-gradient-to-br from-gray-400 to-gray-600 shadow-lg"
                  }`}>
                    <div className="absolute top-0 right-0 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full -translate-y-8 sm:-translate-y-10 translate-x-8 sm:translate-x-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center gap-1 sm:gap-2 mb-2 sm:mb-3">
                        <Users className="w-4 sm:w-5 h-4 sm:h-5 text-white flex-shrink-0" />
                        <span className="text-sm sm:text-lg font-bold text-white truncate">{team2Name}</span>
                        {isTeam2Complete && <span className="text-xl sm:text-2xl flex-shrink-0">🏆</span>}
                      </div>
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex gap-1">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className={`w-3 sm:w-4 h-3 sm:h-4 rounded-full transition-all ${
                              i < team2Categories.length ? "bg-white scale-110" : "bg-white/30"
                            }`}></div>
                          ))}
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white">{team2Categories.length}/3</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Current Turn Indicator */}
              {!allTeamsComplete && (
                <div className="flex justify-center mt-6">
                  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg px-4 py-2 sm:px-6 sm:py-3 shadow-lg">
                    <p className="text-blue-800 font-bold text-sm sm:text-base text-center">
                      {t("select_categories_remaining", { count: 3 - currentCategories.length })}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
{categories.map((category) => {
  const isSelectedByTeam1 = team1Categories.includes(category.id)
  const isSelectedByTeam2 = team2Categories.includes(category.id)
  const isSelectedByCurrentTeam = currentCategories.includes(category.id)
  const isSelectedByOtherTeam = currentTeam === 1 ? isSelectedByTeam2 : isSelectedByTeam1
  
  const isDisabled =
    isSelectedByOtherTeam ||
    allTeamsComplete ||
    (!isSelectedByCurrentTeam && currentCategories.length >= 3)

  // Allow clicking if:
  // - The category is selected by team 1 and we want to allow team 1 to deselect it
  // - The category is selected by team 2 and we want to allow team 2 to deselect it
  // - OR the current team has less than 3 picks and the category is not picked by anyone
  const canClick =
    (isSelectedByTeam1 && currentTeam === 1) ||
    (isSelectedByTeam2 && currentTeam === 2) ||
    (!isSelectedByTeam1 && !isSelectedByTeam2 && currentCategories.length < 3 && !allTeamsComplete)

  return (
    <Card
      key={category.id}
      className={`category-card cursor-pointer relative flex flex-col overflow-hidden transition-all duration-300 ${
        isSelectedByCurrentTeam
          ? "category-card-selected ring-4 ring-blue-500 shadow-2xl scale-105"
          : isSelectedByOtherTeam
            ? "ring-2 ring-gray-400 opacity-60 pointer-events-none"
            : isDisabled
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-2xl hover:scale-105"
      }`}
      onClick={() => canClick ? handleCategorySelect(category.id) : null}
    >
      {isSelectedByCurrentTeam && (
        <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center z-20 shadow-lg animate-pulse">
          <Check className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      )}
      {/* Full-width image with gradient overlay */}
      {category.image_url ? (
        <div className="w-full h-32 sm:h-48 overflow-hidden rounded-t-lg relative group">
          <Image
            src={category.image_url || "/placeholder.svg"}
            alt={getCategoryName(category)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            priority
          />
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
        </div>
      ) : (
        <div className="w-full h-32 sm:h-48 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 rounded-t-lg relative group">
          <span className="text-4xl sm:text-6xl transition-transform duration-300 group-hover:scale-110">{category.icon}</span>
        </div>
      )}
      
      <div className="flex flex-col flex-1 bg-white">
        <CardHeader className="pb-1 sm:pb-2 pt-3 sm:pt-4 flex-shrink-0">
          <CardTitle className="text-xs sm:text-base font-semibold text-gray-900 text-center line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] flex items-center justify-center">
            {getCategoryName(category)}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-3 sm:pb-4 mt-auto px-3 sm:px-4">
          <div className="bg-gray-50 rounded-lg p-2 sm:p-3 min-h-[2.5rem] flex items-center justify-center">
            <p className="text-xs sm:text-sm text-gray-600 text-center line-clamp-2">
              {language === "ar" 
                ? (category.description_ar || "وصف هذه الفئة")
                : (category.description_en || "Category description")}
            </p>
          </div>
        </CardContent>
      </div>
    </Card>
  )
})}
            </div>

            {/* Action Buttons - Only show Start Challenge when complete */}
            {allTeamsComplete && (
              <div className="flex justify-center">
                <Button
                  onClick={handleStartGame}
                  className="w-full sm:w-auto px-6 sm:px-8 h-10 sm:h-12 gradient-blue hover:opacity-90 transition-opacity rounded-xl font-semibold touch-button"
                >
                  <span className="text-sm sm:text-base">{t("start_challenge")}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Warning Message */}
            {!allTeamsComplete && currentCategories.length !== 3 && (
              <div className="mt-4 sm:mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center max-w-md mx-auto">
                <p className="text-orange-600 font-medium">
                  {currentTeamName} {t("select_categories")}
                </p>
              </div>
            )}
          </div>

          {/* Floating Back Button */}
          <div className="fixed bottom-6 left-16 z-50">
            <Button
              onClick={handleBack}
              variant="outline"
              size="lg"
              className="h-14 px-6 bg-white hover:bg-gray-50 border-2 border-gray-300 shadow-2xl rounded-full font-bold text-base flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              {t("back")}
            </Button>
          </div>

          {/* Floating Start Challenge Button */}
          {allTeamsComplete && (
            <div className="fixed bottom-6 right-6 z-50 animate-bounce">
              <Button
                onClick={handleStartGame}
                size="lg"
                className="h-14 px-6 gradient-blue hover:opacity-90 transition-all shadow-2xl rounded-full font-bold text-base flex items-center gap-2"
              >
                <Play className="w-5 h-5" fill="currentColor" />
                {t("start_challenge")}
              </Button>
            </div>
          )}
        </main>
      </SidebarProvider>
    </div>
  )
}
