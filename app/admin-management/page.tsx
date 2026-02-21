"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Check, X, Clock, User } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { checkAdminRole, getAdminRequests, approveAdminRequest, rejectAdminRequest, type AdminRequest } from "@/lib/admin-utils"

export default function AdminManagementPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState<AdminRequest[]>([])
  const [processing, setProcessing] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

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
        alert('Access denied. Master admin privileges required.')
        router.push('/dashboard')
        return
      }

      setUser(session.user)
      loadRequests()
    } catch (error) {
      console.error('Auth check failed:', error)
      router.push("/login")
    } finally {
      setLoading(false)
    }
  }

  const loadRequests = async () => {
    const { data, error } = await getAdminRequests()
    if (error) {
      console.error('Failed to load requests:', error)
    } else {
      setRequests(data || [])
    }
  }

  const handleApprove = async (requestId: string) => {
    setProcessing(requestId)
    const { error } = await approveAdminRequest(requestId, user.email)
    
    if (error) {
      alert('Failed to approve request: ' + error.message)
    } else {
      alert('Admin request approved successfully!')
      loadRequests()
    }
    setProcessing(null)
  }

  const handleReject = async (requestId: string) => {
    setProcessing(requestId)
    const { error } = await rejectAdminRequest(requestId, user.email)
    
    if (error) {
      alert('Failed to reject request: ' + error.message)
    } else {
      alert('Admin request rejected.')
      loadRequests()
    }
    setProcessing(null)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-300"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="outline" className="text-green-600 border-green-300"><Check className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="outline" className="text-red-600 border-red-300"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1">Admin Management</h1>
          <p className="text-xs sm:text-sm text-gray-600">Approve or reject admin requests</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3">
              <Clock className="w-5 h-5 text-yellow-500 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'pending').length}
              </p>
              <p className="text-xs text-gray-600">Pending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <Check className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'approved').length}
              </p>
              <p className="text-xs text-gray-600">Approved</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-3">
              <X className="w-5 h-5 text-red-500 mb-2" />
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                {requests.filter(r => r.status === 'rejected').length}
              </p>
              <p className="text-xs text-gray-600">Rejected</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-base sm:text-lg">
              <User className="w-4 h-4 mr-2" />
              Admin Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600">No admin requests found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((request) => (
                  <div key={request.id} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-sm text-gray-900 truncate">{request.full_name}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-xs text-gray-600 truncate">{request.email}</p>
                      </div>
                    </div>
                    {request.message && (
                      <p className="text-xs text-gray-700 bg-gray-100 p-2 rounded mb-2 line-clamp-2">
                        "{request.message}"
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <span>Requested: {new Date(request.created_at).toLocaleDateString()}</span>
                      {request.reviewed_at && (
                        <span>Reviewed: {new Date(request.reviewed_at).toLocaleDateString()}</span>
                      )}
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleApprove(request.id)}
                          disabled={processing === request.id}
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                        >
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReject(request.id)}
                          disabled={processing === request.id}
                          variant="outline"
                          size="sm"
                          className="flex-1 border-red-300 text-red-600 hover:bg-red-50 text-xs h-8"
                        >
                          <X className="w-3 h-3 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}