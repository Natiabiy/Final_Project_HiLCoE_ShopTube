import { Skeleton } from "@/components/ui/skeleton"
import { SellerLayout } from "@/components/layouts/seller-layout"

export default function Loading() {
  return (
    <SellerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Skeleton className="h-10 w-[200px]" />

        <div className="space-y-4">
          <div className="rounded-md border p-6">
            <Skeleton className="h-8 w-[180px] mb-6" />
            <Skeleton className="h-10 w-full mb-6" />
            <div className="space-y-2">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  )
}
