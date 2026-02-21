"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Activity, Plus, Edit, Trash2, User, Calendar, Filter, LogIn, ChevronLeft, ChevronRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { checkAdminRole, getActivityLogs, type ActivityLog } from "@/lib/admin-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

// Login Logs Component
function LoginLogsSection() {
  const [loginLogs, setLoginLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLoginLogs()
  }, [])

  const fetchLoginLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('login_logs')
        .select('*')
        .order('login_time', { ascending: false })
        .limit(10)

      if (error) throw error
      setLoginLogs(data || [])
    } catch (error) {
      console.error('Error fetching login logs:', error)
      setLoginLogs([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center py-4">Loading login logs...</div>
  }

  if (loginLogs.length === 0) {
    return (
      <div className="text-center py-8">
        <LogIn className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No login logs found</p>
      </div>
    )
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  return (
    <div className="space-y-3">
      {loginLogs.map((log) => (
        <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              log.logout_time ? 'bg-blue-100' : 'bg-green-100'
            }`}>
              <LogIn className={`w-4 h-4 ${
                log.logout_time ? 'text-blue-600' : 'text-green-600'
              }`} />
            </div>
            <div>
              <p className="font-medium text-gray-900">{log.admin_email}</p>
              <p className="text-sm text-gray-500">
                Logged in • {new Date(log.login_time).toLocaleDateString()} at {new Date(log.login_time).toLocaleTimeString()}
              </p>
              {log.logout_time && (
                <p className="text-xs text-gray-400">
                  Logged out • {new Date(log.logout_time).toLocaleDateString()} at {new Date(log.logout_time).toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            {log.logout_time ? (
              <div className="space-y-1">
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full block">
                  Session: {formatDuration(log.session_duration || 0)}
                </span>
                <span className="text-xs text-gray-500">
                  Completed
                </span>
              </div>
            ) : (
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                🟢 Active
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ActivityLogsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ActivityLog[]>([])
  const [filterAction, setFilterAction] = useState<string>('all')
  const [filterResource, setFilterResource] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    applyFilters()
    setCurrentPage(1)
  }, [logs, filterAction, filterResource])

  const checkUser = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session?.user) {
        router.push("/login")
        return
      }

      // Check if user is master admin
      const { isAdmin, role } = await checkAdminRole(session.user.email || '')
      
      if (!isAdmin || role !== 'master_admin') {
        toast.error('Access denied. Master admin privileges required.')
        router.push('/dashboard')
        return
      }

      setUser(session.user)
      loadActivityLogs()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadActivityLogs = async () => {
    const { data, error } = await getActivityLogs(100)
    if (error) {
      toast.error('Failed to load activity logs')
    } else {
      setLogs(data || [])
    }
  }

  const applyFilters = () => {
    let filtered = logs

    if (filterAction !== 'all') {
      filtered = filtered.filter(log => log.action === filterAction)
    }

    if (filterResource !== 'all') {
      filtered = filtered.filter(log => log.resource_type === filterResource)
    }

    setFilteredLogs(filtered)
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create':
        return <Badge className="bg-green-100 text-green-800 border-green-300"><Plus className="w-3 h-3 mr-1" />Created</Badge>
      case 'update':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Edit className="w-3 h-3 mr-1" />Updated</Badge>
      case 'delete':
        return <Badge className="bg-red-100 text-red-800 border-red-300"><Trash2 className="w-3 h-3 mr-1" />Deleted</Badge>
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const getResourceBadge = (resourceType: string) => {
    switch (resourceType) {
      case 'category':
        return <Badge variant="outline" className="text-purple-600 border-purple-300">Category</Badge>
      case 'question':
        return <Badge variant="outline" className="text-orange-600 border-orange-300">Question</Badge>
      default:
        return <Badge variant="outline">{resourceType}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-end mb-4">
            <Skeleton className="h-9 w-20" />
          </div>
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-3">
                  <Skeleton className="h-5 w-5 mb-2" />
                  <Skeleton className="h-8 w-12 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button - Aligned with menu */}
        <div className="flex justify-end mb-4">
          <Button
            onClick={() => router.push('/master-dashboard')}
            variant="outline"
            size="sm"
            className="flex-shrink-0 text-xs"
          >
            <ArrowLeft className="w-3 h-3 mr-1" />
            Back
          </Button>
        </div>

        {/* Header */}
        <div className="mb-6 text-center sm:text-left">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">Activity Logs</h1>
          <p className="text-xs sm:text-sm text-gray-600">Track all admin actions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card>
            <CardContent className="p-3">
              <Activity className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{logs.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <Plus className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {logs.filter(log => log.action === 'create').length}
              </p>
              <p className="text-xs text-gray-600">Created</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <Edit className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {logs.filter(log => log.action === 'update').length}
              </p>
              <p className="text-xs text-gray-600">Updated</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <Trash2 className="w-5 h-5 text-red-500 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {logs.filter(log => log.action === 'delete').length}
              </p>
              <p className="text-xs text-gray-600">Deleted</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Action</label>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Filter by action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Created</SelectItem>
                    <SelectItem value="update">Updated</SelectItem>
                    <SelectItem value="delete">Deleted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-xs font-medium text-gray-700 mb-1 block">Resource Type</label>
                <Select value={filterResource} onValueChange={setFilterResource}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Filter by resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="category">Categories</SelectItem>
                    <SelectItem value="question">Questions</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Logs */}
        <Card className="mb-6">
          <CardHeader className="p-4">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <User className="w-4 h-4 mr-2" />
              Recent Admin Logins
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <LoginLogsSection />
          </CardContent>
        </Card>

        {/* Activity Logs */}
        <Card>
          <CardHeader className="p-4">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <Activity className="w-4 h-4 mr-2" />
              Recent Activities ({filteredLogs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-xs sm:text-sm text-gray-600">No activity logs found</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {filteredLogs
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((log) => (
                    <div key={log.id} className="border rounded-lg p-3 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            {getActionBadge(log.action)}
                            {getResourceBadge(log.resource_type)}
                            <span className="text-xs text-gray-500 flex items-center truncate">
                              <User className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">{log.admin_email}</span>
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-sm text-gray-900 mb-1 truncate">
                            {log.resource_name}
                          </h3>
                          
                          <p className="text-xs text-gray-600 mb-2">
                            {log.action === 'create' && `Created new ${log.resource_type}`}
                            {log.action === 'update' && `Updated ${log.resource_type}`}
                            {log.action === 'delete' && `Deleted ${log.resource_type}`}
                          </p>
                          
                          {log.details && (
                            <div className="text-[10px] sm:text-xs text-gray-500 bg-gray-100 p-2 rounded mt-2 overflow-x-auto">
                              <pre className="whitespace-pre-wrap break-all">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            </div>
                          )}
                          
                          <p className="text-[10px] sm:text-xs text-gray-500 mt-2 flex items-center">
                            <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                            {formatDate(log.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination */}
                {filteredLogs.length > itemsPerPage && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <p className="text-xs text-gray-600">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        {currentPage} / {Math.ceil(filteredLogs.length / itemsPerPage)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredLogs.length / itemsPerPage), p + 1))}
                        disabled={currentPage >= Math.ceil(filteredLogs.length / itemsPerPage)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}