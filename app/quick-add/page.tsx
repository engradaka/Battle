"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Plus, CheckCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { logActivity } from "@/lib/activity-logger"

interface Category {
  id: string
  name_ar: string
  name_en: string
}

export default function QuickAddPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [formData, setFormData] = useState({
    category_id: "",
    question_ar: "",
    question_en: "",
    answer_ar: "",
    answer_en: "",
    diamonds: "",
    question_type: "text" as 'text' | 'video' | 'image' | 'audio',
    media_url: "",
    media_duration: 5,
    answer_type: "text" as 'text' | 'video' | 'image' | 'audio',
    answer_media_url: "",
    answer_media_duration: 5
  })
  const [selectedQuestionMedia, setSelectedQuestionMedia] = useState<File | null>(null)
  const [questionMediaPreview, setQuestionMediaPreview] = useState<string>("")
  const [selectedAnswerMedia, setSelectedAnswerMedia] = useState<File | null>(null)
  const [answerMediaPreview, setAnswerMediaPreview] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        router.push("/login")
        return
      }

      if (session.user.email !== process.env.NEXT_PUBLIC_MASTER_ADMIN_EMAIL) {
        router.push("/dashboard")
        return
      }

      setUser(session.user)
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name_ar, name_en")
        .order("name_en", { ascending: true })

      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const handleQuestionMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedQuestionMedia(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setQuestionMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleAnswerMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedAnswerMedia(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAnswerMediaPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.category_id || !formData.question_ar || !formData.question_en || 
        !formData.answer_ar || !formData.answer_en || !formData.diamonds) {
      alert('Please fill in all required fields')
      return
    }
    
    setSubmitting(true)

    try {
      let mediaUrl = formData.media_url
      let answerMediaUrl = formData.answer_media_url

      // Upload question media if selected
      if (selectedQuestionMedia && formData.question_type !== 'text') {
        const fileExt = selectedQuestionMedia.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `question-media/${fileName}`

        const { error: uploadError } = await supabase.storage.from("images").upload(filePath, selectedQuestionMedia)

        if (uploadError) {
          console.error("Error uploading media:", uploadError)
          alert(`Error uploading media: ${uploadError.message}`)
          return
        }

        const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(filePath)
        mediaUrl = publicUrl
      }

      // Upload answer media if selected
      if (selectedAnswerMedia && formData.answer_type !== 'text') {
        const fileExt = selectedAnswerMedia.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `answer-media/${fileName}`

        const { error: uploadError } = await supabase.storage.from("images").upload(filePath, selectedAnswerMedia)

        if (uploadError) {
          console.error("Error uploading answer media:", uploadError)
          alert(`Error uploading answer media: ${uploadError.message}`)
          return
        }

        const { data: { publicUrl } } = supabase.storage.from("images").getPublicUrl(filePath)
        answerMediaUrl = publicUrl
      }

      const questionData = {
        category_id: formData.category_id,
        question_ar: formData.question_ar.trim(),
        question_en: formData.question_en.trim(),
        answer_ar: formData.answer_ar.trim(),
        answer_en: formData.answer_en.trim(),
        diamonds: parseInt(formData.diamonds),
        question_type: formData.question_type,
        answer_type: formData.answer_type,
        media_url: mediaUrl,
        answer_media_url: answerMediaUrl,
        media_duration: formData.media_duration,
        answer_media_duration: formData.answer_media_duration
      }

      const { data, error } = await supabase
        .from("diamond_questions")
        .insert([questionData])
        .select()
        .single()

      if (error) throw error

      // Log activity
      await logActivity(
        user?.email || '',
        'create',
        'question',
        data.id,
        formData.question_en || formData.question_ar,
        questionData
      )

      // Reset form
      setFormData({
        category_id: formData.category_id, // Keep category selected for faster entry
        question_ar: "",
        question_en: "",
        answer_ar: "",
        answer_en: "",
        diamonds: "",
        question_type: "text",
        media_url: "",
        media_duration: 5,
        answer_type: "text",
        answer_media_url: "",
        answer_media_duration: 5
      })
      setSelectedQuestionMedia(null)
      setQuestionMediaPreview("")
      setSelectedAnswerMedia(null)
      setAnswerMediaPreview("")

      alert("✅ Question added successfully!")

    } catch (error) {
      console.error('Error creating question:', error)
      alert("❌ Error creating question. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryName = (category: Category) => {
    return `${category.name_en} (${category.name_ar})`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button - Aligned with menu */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => router.push('/master-dashboard')}
            variant="outline"
            size="sm"
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            <span className="text-xs">Back</span>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">Quick Add Question</h1>
          <p className="text-xs sm:text-base text-gray-600">Add new question fast</p>
        </div>

        {/* Quick Add Form */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Plus className="w-4 h-4 mr-2 text-green-600" />
              Add New Question
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[70vh] overflow-y-auto p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Category Selection */}
              <div className="space-y-1">
                <Label htmlFor="category" className="text-xs sm:text-sm">Category *</Label>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryName(category)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="question_ar" className="text-xs sm:text-sm">Arabic Question *</Label>
                  <textarea
                    id="question_ar"
                    value={formData.question_ar}
                    onChange={(e) => setFormData({ ...formData, question_ar: e.target.value })}
                    placeholder="أدخل السؤال"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="question_en" className="text-xs sm:text-sm">English Question *</Label>
                  <textarea
                    id="question_en"
                    value={formData.question_en}
                    onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                    placeholder="Enter question"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Answers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="answer_ar" className="text-xs sm:text-sm">Arabic Answer *</Label>
                  <textarea
                    id="answer_ar"
                    value={formData.answer_ar}
                    onChange={(e) => setFormData({ ...formData, answer_ar: e.target.value })}
                    placeholder="أدخل الإجابة"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="answer_en" className="text-xs sm:text-sm">English Answer *</Label>
                  <textarea
                    id="answer_en"
                    value={formData.answer_en}
                    onChange={(e) => setFormData({ ...formData, answer_en: e.target.value })}
                    placeholder="Enter answer"
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg h-20 resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Diamond Value */}
              <div className="space-y-1">
                <Label htmlFor="diamonds" className="text-xs sm:text-sm">Diamond Value *</Label>
                <select
                  id="diamonds"
                  value={formData.diamonds}
                  onChange={(e) => setFormData({ ...formData, diamonds: e.target.value })}
                  className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                >
                  <option value="">Select diamonds</option>
                  <option value="10">💎 10 Diamonds (Easy)</option>
                  <option value="25">💎 25 Diamonds (Medium)</option>
                  <option value="50">💎 50 Diamonds (Hard)</option>
                  <option value="75">💎 75 Diamonds (Very Hard)</option>
                  <option value="100">💎 100 Diamonds (Expert)</option>
                </select>
              </div>

              {/* Media Types */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="question_type" className="text-xs sm:text-sm">Question Type</Label>
                  <select
                    id="question_type"
                    value={formData.question_type}
                    onChange={(e) => setFormData({ ...formData, question_type: e.target.value as 'text' | 'video' | 'image' | 'audio' })}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="text">📝 Text</option>
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎥 Video</option>
                    <option value="audio">🎵 Audio</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="answer_type" className="text-xs sm:text-sm">Answer Type</Label>
                  <select
                    id="answer_type"
                    value={formData.answer_type}
                    onChange={(e) => setFormData({ ...formData, answer_type: e.target.value as 'text' | 'video' | 'image' | 'audio' })}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="text">📝 Text</option>
                    <option value="image">🖼️ Image</option>
                    <option value="video">🎥 Video</option>
                    <option value="audio">🎵 Audio</option>
                  </select>
                </div>
              </div>

              {/* Question Media Upload */}
              {formData.question_type !== 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="question_media" className="text-xs sm:text-sm">Upload Question {formData.question_type}</Label>
                  <input
                    id="question_media"
                    type="file"
                    accept={formData.question_type === 'image' ? 'image/*' : formData.question_type === 'video' ? 'video/*' : 'audio/*'}
                    onChange={handleQuestionMediaChange}
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {questionMediaPreview && formData.question_type === 'image' && (
                    <div className="mt-2">
                      <img src={questionMediaPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                    </div>
                  )}
                  {formData.question_type === 'video' && (
                    <div className="space-y-1">
                      <Label htmlFor="media_duration" className="text-xs">Duration (sec)</Label>
                      <input
                        id="media_duration"
                        type="number"
                        min="1"
                        max="300"
                        value={formData.media_duration}
                        onChange={(e) => setFormData({ ...formData, media_duration: parseInt(e.target.value) })}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Upload {formData.question_type} file
                  </p>
                </div>
              )}

              {/* Answer Media Upload */}
              {formData.answer_type !== 'text' && (
                <div className="space-y-2">
                  <Label htmlFor="answer_media" className="text-xs sm:text-sm">Upload Answer {formData.answer_type}</Label>
                  <input
                    id="answer_media"
                    type="file"
                    accept={formData.answer_type === 'image' ? 'image/*' : formData.answer_type === 'video' ? 'video/*' : 'audio/*'}
                    onChange={handleAnswerMediaChange}
                    className="w-full p-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  {answerMediaPreview && formData.answer_type === 'image' && (
                    <div className="mt-2">
                      <img src={answerMediaPreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                    </div>
                  )}
                  {formData.answer_type === 'video' && (
                    <div className="space-y-1">
                      <Label htmlFor="answer_media_duration" className="text-xs">Duration (sec)</Label>
                      <input
                        id="answer_media_duration"
                        type="number"
                        min="1"
                        max="300"
                        value={formData.answer_media_duration}
                        onChange={(e) => setFormData({ ...formData, answer_media_duration: parseInt(e.target.value) })}
                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Upload answer {formData.answer_type} file
                  </p>
                </div>
              )}

            </form>
          </CardContent>
          
          {/* Submit Button - Fixed at bottom */}
          <div className="border-t bg-gray-50 px-4 py-3">
            <div className="flex justify-end">
              <Button 
                onClick={handleSubmit}
                disabled={submitting}
                size="sm"
                className="bg-green-600 hover:bg-green-700 px-6 text-sm"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Add Question
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}