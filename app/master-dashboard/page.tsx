"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthGuard from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { supabase } from "@/lib/supabase"
import { useLanguage } from "@/lib/language-context"
import { sessionManager } from "@/lib/session-manager"
import { toast } from "sonner"
import {
  Settings,
  ExternalLink,
  LogOut,
  Users,
  Activity,
  BookOpen,
  HelpCircle,
  Trophy,
  Shield,
  UserCheck,
  Clock,
  Upload,
  BarChart3,
  Download,
  Plus
} from "lucide-react"

function MasterDashboardPageContent() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalQuestions: 0,
    totalPoints: 0,
    pendingRequests: 0,
    totalAdmins: 0,
    recentActivities: 0,
    totalLogins: 0
  })
  const router = useRouter()
  const { language } = useLanguage()

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
      } else {
        setUser(session.user)
      }
    } catch (error) {
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const { data: categories } = await supabase
        .from("categories")
        .select("id")
      
      const { data: questions } = await supabase
        .from("diamond_questions")
        .select("diamonds")
      
      const { data: requests } = await supabase
        .from("admin_requests")
        .select("id")
        .eq("status", "pending")
      
      const { data: admins } = await supabase
        .from("admins")
        .select("id")
        .eq("status", "active")
      
      const { data: activities } = await supabase
        .from("activity_logs")
        .select("id")
        .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      
      const { data: logins } = await supabase
        .from("login_logs")
        .select("id")

      setStats({
        totalCategories: categories?.length || 0,
        totalQuestions: questions?.length || 0,
        totalPoints: questions?.reduce((sum, q) => sum + q.diamonds, 0) || 0,
        pendingRequests: requests?.length || 0,
        totalAdmins: admins?.length || 0,
        recentActivities: activities?.length || 0,
        totalLogins: logins?.length || 0
      })
    } catch (error) {
      toast.error('Failed to load statistics')
    }
  }

  const handleLogout = async () => {
    if (user?.email) {
      try {
        const { data: recentLogin } = await supabase
          .from('login_logs')
          .select('id, login_time')
          .eq('admin_email', user.email)
          .is('logout_time', null)
          .order('login_time', { ascending: false })
          .limit(1)
          .single()

        if (recentLogin) {
          const logoutTime = new Date()
          const loginTime = new Date(recentLogin.login_time)
          const durationMinutes = Math.round((logoutTime.getTime() - loginTime.getTime()) / (1000 * 60))
          
          await supabase
            .from('login_logs')
            .update({
              logout_time: logoutTime.toISOString(),
              session_duration: durationMinutes
            })
            .eq('id', recentLogin.id)
        }
      } catch (error) {
        // Silent fail for logout logging
      }
    }

    sessionManager.clearSession()
    localStorage.clear()
    setUser(null)
    router.push("/")
  }

  const handleViewQuiz = () => {
    router.push("/")
  }

  const handleRegularDashboard = () => {
    router.push("/dashboard")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="w-10 h-10 rounded-xl" />
              <div className="flex-1">
                <Skeleton className="h-6 w-48 mb-1" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 flex-1" />
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto p-4 sm:p-6">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Card key={i}>
                <CardContent className="p-3 sm:p-4">
                  <Skeleton className="h-5 w-5 mb-2" />
                  <Skeleton className="h-8 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Redirecting to login...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center sm:flex-row sm:items-center gap-3 mb-3 mt-4 sm:mt-0">
            <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Master Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">System administration</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleRegularDashboard}
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px] text-xs"
            >
              <Settings className="w-3 h-3 mr-1" />
              Admin Panel
            </Button>
            <Button
              onClick={handleViewQuiz}
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px] text-xs"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              View Quiz
            </Button>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="flex-1 min-w-[100px] text-xs"
            >
              <LogOut className="w-3 h-3 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, Master Admin! 👑
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Manage your quiz system and monitor activities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalCategories}</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Categories</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <HelpCircle className="w-5 h-5 text-green-600" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalQuestions}</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Questions</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">💎 {stats.totalPoints}</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Diamonds</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="w-5 h-5 text-purple-600" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalAdmins}</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Admins</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.recentActivities}</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Activities</p>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <UserCheck className="w-5 h-5 text-teal-600" />
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.totalLogins}</p>
                </div>
                <p className="text-xs sm:text-sm font-medium text-gray-600">Total Logins</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin-management')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Users className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0" />
                <span className="truncate">Manage Admins</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">Approve or reject admin access requests</p>
              <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                {stats.pendingRequests} pending
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/activity-logs')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Activity className="w-4 h-4 mr-2 text-indigo-600 flex-shrink-0" />
                <span className="truncate">Activity Logs</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">Monitor all admin actions</p>
              <Badge variant="outline" className="text-xs text-indigo-600 border-indigo-300">
                {stats.recentActivities} this week
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/master-dashboard/bulk-import')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Upload className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                <span className="truncate">Bulk Import</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">Upload multiple questions</p>
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                Fast upload
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/game-analytics')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <BarChart3 className="w-4 h-4 mr-2 text-orange-600 flex-shrink-0" />
                <span className="truncate">Game Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">View quiz performance</p>
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300">
                Insights
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/backup-export')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Download className="w-4 h-4 mr-2 text-teal-600 flex-shrink-0" />
                <span className="truncate">Backup & Export</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">Export and backup data</p>
              <Badge variant="outline" className="text-xs text-teal-600 border-teal-300">
                Secure
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/quick-add')}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Plus className="w-4 h-4 mr-2 text-green-600 flex-shrink-0" />
                <span className="truncate">Quick Add</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">Quickly add questions</p>
              <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                Fast entry
              </Badge>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleRegularDashboard}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Settings className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                <span className="truncate">Admin Panel</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2">Manage categories</p>
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                {stats.totalCategories} categories
              </Badge>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function MasterDashboardPage() {
  return (
    <AuthGuard requireAuth={true} requireMasterAdmin={true}>
      <MasterDashboardPageContent />
    </AuthGuard>
  )
}