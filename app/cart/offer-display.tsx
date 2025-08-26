import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Percent, Tag, Gift } from 'lucide-react'

interface OfferDisplayProps {
  appliedOffer: {
    id: number
    title: string
    description: string
    discountType: string
    discountValue: number
    minOrderAmount: number
    maxDiscountValue: number
  } | null
  bestDiscount: number
  finalTotal: number
  originalTotal: number
}

export function OfferDisplay({ appliedOffer, bestDiscount, finalTotal, originalTotal }: OfferDisplayProps) {
  if (!appliedOffer || bestDiscount === 0) {
    return null
  }

  const savingsPercentage = ((bestDiscount / originalTotal) * 100).toFixed(1)

  return (
    <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
            <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <Percent className="h-3 w-3 mr-1" />
                {appliedOffer.discountValue}% OFF
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                OFFER APPLIED
              </Badge>
            </div>
            
            <div>
              <h4 className="font-semibold text-green-800 dark:text-green-200">
                {appliedOffer.title}
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                {appliedOffer.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between pt-2 border-t border-green-200 dark:border-green-800">
              <div className="text-sm text-green-700 dark:text-green-300">
                You saved <span className="font-semibold">{savingsPercentage}%</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-green-700 dark:text-green-300">Total Savings</div>
                <div className="font-bold text-green-800 dark:text-green-200">
                  ₹{bestDiscount.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
