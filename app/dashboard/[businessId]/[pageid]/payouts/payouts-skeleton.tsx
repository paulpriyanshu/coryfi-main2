import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function PayoutsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-2 items-center">
            <Skeleton className="h-10 w-[120px] sm:w-[180px]" />
            <Skeleton className="h-10 w-[120px] sm:w-[180px]" />
          </div>
          <Skeleton className="h-10 w-[120px] sm:w-[180px]" />
        </div>
        <Skeleton className="h-10 w-[100px]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  <Skeleton className="h-4 w-24" />
                </CardTitle>
                <Badge variant="outline">
                  <Skeleton className="h-4 w-16" />
                </Badge>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
      </div>

      <Tabs defaultValue="payouts" className="w-full">
        <TabsList>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="payouts" className="space-y-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <Skeleton className="h-5 w-[100px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[150px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-5 w-[80px]" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="h-8 w-[40px] ml-auto" />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
