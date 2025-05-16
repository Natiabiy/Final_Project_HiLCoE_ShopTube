"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SellerLayout } from "@/components/layouts/seller-layout"
import { useAuth } from "@/lib/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { getSellerSubscribers } from "./actions"

type Subscriber = {
  id: string
  created_at: string
  customer_id: string
  user?: {
    id: string
    name: string
    email: string
    created_at: string
  }
}

export default function SellerSubscribers() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (!loading && (!user || user.role !== "seller")) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchSubscribers = async () => {
      if (!user?.id) return

      try {
        setIsLoading(true)
        const result = await getSellerSubscribers(user.id)

        if (result.success) {
          setSubscribers(result.subscribers)
          setFilteredSubscribers(result.subscribers)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to load subscribers",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error fetching subscribers:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchSubscribers()
    }
  }, [user, toast])

  useEffect(() => {
    // Filter subscribers based on search term
    if (!searchTerm) {
      setFilteredSubscribers(subscribers)
      return
    }

    const filtered = subscribers.filter((sub) => {
      if (!sub.user) return false

      return (
        sub.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })

    setFilteredSubscribers(filtered)
  }, [searchTerm, subscribers])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <SellerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Subscribers</h2>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Subscriber Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-6">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscribers..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 w-full animate-pulse bg-muted rounded"></div>
                  ))}
                </div>
              ) : filteredSubscribers.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No subscribers found</h3>
                  <p className="mt-2 text-muted-foreground">
                    {subscribers.length === 0
                      ? "You don't have any subscribers yet."
                      : "No subscribers match your search."}
                  </p>
                  {subscribers.length > 0 && searchTerm && (
                    <Button variant="outline" className="mt-4" onClick={() => setSearchTerm("")}>
                      Clear search
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Subscriber ID</TableHead>
                        <TableHead>Subscribed On</TableHead>
                        <TableHead>Customer ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSubscribers.map((sub) => (
                        <TableRow key={sub.id}>
                          <TableCell className="font-medium">{sub.id}</TableCell>
                          <TableCell>{formatDate(sub.created_at)}</TableCell>
                          <TableCell>{sub.customer_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerLayout>
  )
}
