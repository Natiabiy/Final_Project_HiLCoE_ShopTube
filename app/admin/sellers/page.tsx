"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminLayout } from "@/components/layouts/admin-layout"
import { useToast } from "@/hooks/use-toast"
import { getPendingSellers, approveSellerApplication } from "./actions"

type PendingSeller = {
  id: string
  business_name: string
  description: string
  created_at: string
  user: {
    id: string
    name: string
    email: string
  }
}

export default function AdminSellersPage() {
  const { toast } = useToast()
  const [pendingSellers, setPendingSellers] = useState<PendingSeller[]>([])
  const [loading, setLoading] = useState(true)
  const [approving, setApproving] = useState<string | null>(null)

  useEffect(() => {
    const fetchPendingSellers = async () => {
      try {
        const result = await getPendingSellers()
        if (result.success) {
          setPendingSellers(result.pendingSellers)
        }
      } catch (error) {
        console.error("Error fetching pending sellers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingSellers()
  }, [])

  const handleApprove = async (profileId: string) => {
    setApproving(profileId)
    try {
      const result = await approveSellerApplication(profileId)

      if (result.success) {
        setPendingSellers(pendingSellers.filter((seller) => seller.id !== profileId))
        toast({
          title: "Seller Approved",
          description: "The seller has been approved successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error approving seller:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setApproving(null)
    }
  }

  return (
    <AdminLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Seller Management</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Seller Applications</CardTitle>
            <CardDescription>Review and approve seller applications</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-24">
                <p>Loading applications...</p>
              </div>
            ) : pendingSellers.length === 0 ? (
              <div className="text-center py-6">
                <h3 className="text-lg font-medium">No pending applications</h3>
                <p className="mt-2 text-sm text-muted-foreground">All seller applications have been processed.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingSellers.map((seller) => (
                  <div key={seller.id} className="rounded-lg border p-4">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{seller.business_name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Applied by {seller.user.name} ({seller.user.email})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Applied on {new Date(seller.created_at).toLocaleDateString()}
                        </p>
                        <p className="mt-2">{seller.description}</p>
                      </div>
                      <div className="flex gap-2 md:flex-col">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            // In a real app, you would implement rejection logic
                            toast({
                              title: "Not Implemented",
                              description: "Rejection functionality is not implemented in this demo.",
                            })
                          }}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleApprove(seller.id)}
                          disabled={approving === seller.id}
                        >
                          {approving === seller.id ? (
                            "Approving..."
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
