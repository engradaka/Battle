"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Download, Database, FileText, Calendar, Shield } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { sanitizeHTML } from "@/lib/sanitize"

export default function BackupExportPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [stats, setStats] = useState({
    categories: 0,
    questions: 0,
    activities: 0,
    admins: 0
  })
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchStats()
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

  const fetchStats = async () => {
    try {
      const [categories, questions, activities, admins] = await Promise.all([
        supabase.from("categories").select("id"),
        supabase.from("diamond_questions").select("id"),
        supabase.from("activity_logs").select("id"),
        supabase.from("admins").select("id")
      ])

      setStats({
        categories: categories.data?.length || 0,
        questions: questions.data?.length || 0,
        activities: activities.data?.length || 0,
        admins: admins.data?.length || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return
    
    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header]
        // Escape commas and quotes in CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportCategories = async () => {
    setExporting(true)
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const timestamp = new Date().toISOString().split('T')[0]
      downloadJSON(data, `categories-backup-${timestamp}.json`)
      downloadCSV(data || [], `categories-backup-${timestamp}.csv`)
      
      alert(`✅ Categories exported successfully!\n📁 ${data?.length || 0} categories downloaded`)
    } catch (error) {
      console.error('Export error:', error)
      alert('❌ Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const exportQuestions = async () => {
    setExporting(true)
    try {
      const { data, error } = await supabase
        .from("diamond_questions")
        .select(`
          *,
          categories (
            name_ar,
            name_en
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const timestamp = new Date().toISOString().split('T')[0]
      downloadJSON(data, `questions-backup-${timestamp}.json`)
      downloadCSV(data || [], `questions-backup-${timestamp}.csv`)
      
      alert(`✅ Questions exported successfully!\n📁 ${data?.length || 0} questions downloaded`)
    } catch (error) {
      console.error('Export error:', error)
      alert('❌ Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const exportMediaFiles = async () => {
    setExporting(true)
    try {
      // Get all media files from storage
      const { data: files, error } = await supabase.storage
        .from('media')
        .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })

      if (error) throw error

      const mediaUrls = []
      for (const file of files || []) {
        const { data } = supabase.storage
          .from('media')
          .getPublicUrl(file.name)
        
        mediaUrls.push({
          filename: file.name,
          url: data.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at
        })
      }

      const timestamp = new Date().toISOString().split('T')[0]
      downloadJSON(mediaUrls, `media-urls-backup-${timestamp}.json`)
      
      alert(`✅ Media URLs exported successfully!\n📁 ${mediaUrls.length} media files listed\n\n⚠️ Note: Download the actual files manually from the URLs provided`)
    } catch (error) {
      console.error('Media export error:', error)
      alert('❌ Media export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  const exportComplete = async () => {
    setExporting(true)
    try {
      const [categories, questions, activities, admins, mediaFiles] = await Promise.all([
        supabase.from("categories").select("*").order("created_at", { ascending: false }),
        supabase.from("diamond_questions").select("*, categories(name_ar, name_en)").order("created_at", { ascending: false }),
        supabase.from("activity_logs").select("*").order("created_at", { ascending: false }),
        supabase.from("admins").select("*").order("created_at", { ascending: false }),
        supabase.storage.from('media').list('', { limit: 1000 })
      ])

      // Get media URLs
      const mediaUrls = []
      for (const file of mediaFiles.data || []) {
        const { data } = supabase.storage.from('media').getPublicUrl(file.name)
        mediaUrls.push({
          filename: file.name,
          url: data.publicUrl,
          size: file.metadata?.size || 0,
          created_at: file.created_at
        })
      }

      const completeBackup = {
        backup_info: {
          created_at: new Date().toISOString(),
          created_by: sanitizeHTML(user.email || ''),
          version: "2.0",
          includes_media_urls: true
        },
        categories: categories.data || [],
        questions: questions.data || [],
        activity_logs: activities.data || [],
        admins: admins.data || [],
        media_files: mediaUrls
      }

      const timestamp = new Date().toISOString().split('T')[0]
      downloadJSON(completeBackup, `complete-backup-${timestamp}.json`)
      
      alert(`✅ Complete backup created successfully!\n📁 All data + ${mediaUrls.length} media URLs exported\n\n⚠️ Note: Media URLs are included, download files manually if needed`)
    } catch (error) {
      console.error('Complete backup error:', error)
      alert('❌ Backup failed. Please try again.')
    } finally {
      setExporting(false)
    }
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
      <div className="max-w-6xl mx-auto">
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
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900 mb-1">Backup & Export</h1>
          <p className="text-xs sm:text-base text-gray-600">Download quiz data</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <Database className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.categories}</p>
              <p className="text-xs text-gray-600">Categories</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.questions}</p>
              <p className="text-xs text-gray-600">Questions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.activities}</p>
              <p className="text-xs text-gray-600">Activities</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3 text-center">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-1" />
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.admins}</p>
              <p className="text-xs text-gray-600">Admins</p>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3">
              <CardTitle className="flex items-center text-sm">
                <Database className="w-4 h-4 mr-1 text-blue-600" />
                Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-gray-600 mb-2">All categories with images</p>
              <Badge variant="outline" className="text-blue-600 border-blue-300 mb-2 text-xs">
                {stats.categories} items
              </Badge>
              <Button 
                onClick={exportCategories}
                disabled={exporting}
                size="sm"
                className="w-full bg-blue-600 hover:bg-blue-700 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3">
              <CardTitle className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-1 text-green-600" />
                Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-gray-600 mb-2">All questions with media</p>
              <Badge variant="outline" className="text-green-600 border-green-300 mb-2 text-xs">
                {stats.questions} items
              </Badge>
              <Button 
                onClick={exportQuestions}
                disabled={exporting}
                size="sm"
                className="w-full bg-green-600 hover:bg-green-700 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-3">
              <CardTitle className="flex items-center text-sm">
                <FileText className="w-4 h-4 mr-1 text-orange-600" />
                Media URLs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-gray-600 mb-2">All media file URLs</p>
              <Badge variant="outline" className="text-orange-600 border-orange-300 mb-2 text-xs">
                Media Files
              </Badge>
              <Button 
                onClick={exportMediaFiles}
                disabled={exporting}
                size="sm"
                className="w-full bg-orange-600 hover:bg-orange-700 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                {exporting ? 'Exporting...' : 'Export'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-2 border-purple-200">
            <CardHeader className="p-3">
              <CardTitle className="flex items-center text-sm">
                <Shield className="w-4 h-4 mr-1 text-purple-600" />
                Full Backup
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-gray-600 mb-2">Everything + media URLs</p>
              <Badge variant="outline" className="text-purple-600 border-purple-300 mb-2 text-xs">
                Full System
              </Badge>
              <Button 
                onClick={exportComplete}
                disabled={exporting}
                size="sm"
                className="w-full bg-purple-600 hover:bg-purple-700 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                {exporting ? 'Creating...' : 'Backup'}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Information */}
        <div className="space-y-3">
          <Alert className="p-3">
            <Shield className="h-3 w-3" />
            <AlertDescription className="text-xs">
              <strong>Backup:</strong> Files in JSON & CSV. Store safely!
            </AlertDescription>
          </Alert>
          
          <Alert className="p-3">
            <FileText className="h-3 w-3" />
            <AlertDescription className="text-xs">
              <strong>Media:</strong> URLs only. Download files manually from Supabase.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}