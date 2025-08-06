"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Lock, Crown, ArrowLeft, Check, Smartphone, Loader2 } from 'lucide-react'
import { fetchUserInfo } from "@/app/api/actions/media"
import { useSession } from "next-auth/react"
import Checkout from "./SubButton"
import { checkUserPremiumStatus } from "@/app/api/actions/user" // Import the server action
import Link from "next/link"

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState("annual")
  const [paymentMethod, setPaymentMethod] = useState("upi")
  const { data: session } = useSession()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [isPremium, setIsPremium] = useState(false) // New state for premium status
  const [premiumLoading, setPremiumLoading] = useState(true) // New state for premium status loading

  const [billingDetails, setBillingDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })

  const plans = {
    monthly: {
      name: "Monthly Plan",
      price: 229,
      billing: "monthly",
      total: 229, // Corrected total
      savings: 0,
    },
    annual: {
      name: "Annual Plan",
      price: 199,
      billing: "annually",
      total: 2388, // Corrected total (199 * 12)
      savings: 360,
      originalPrice: 2748,
    },
  }
  const currentPlan = plans[selectedPlan as keyof typeof plans]

  const handleInputChange = (field: string, value: string) => {
    setBillingDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  useEffect(() => {
    async function getUserAndPremiumStatus() {
      if (session?.user?.email) {
        setLoading(true);
        setPremiumLoading(true);
        const user = await fetchUserInfo(session.user.email);
        setUserData(user);
        console.log("fetched user", user);

        const premiumStatus = await checkUserPremiumStatus(session.user.email);
        setIsPremium(premiumStatus);
        setPremiumLoading(false);
        setLoading(false);
      }
    }
    getUserAndPremiumStatus();
  }, [session?.user?.email]); // Depend on session email

  const handlePurchase = async () => {
    try {
      setLoading(true)
      if (session?.user?.email && userData?.id) { // Ensure userData.id is available
        const res = await fetch('/api/create-subscription', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userData.id,
            email: userData.email,
            phone: userData.userDetails?.phoneNumber,
            name: userData.name,
            amount: currentPlan.total,
            planType: selectedPlan, // "monthly" or "annual"
            planName: currentPlan.name
          })
        });
        const data = await res.json();
        console.log("data of cashfree", data)
        if (data.success) {
          setLoading(false)
          window.location.href = data.subscription_link;
        } else {
          alert('Failed to start subscription: ' + data.error);
        }
      }
    } catch (err) {
      console.error(err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="mr-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />            Back to Plans
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete Your Purchase</h1>
            <p className="text-gray-600 dark:text-gray-400">Secure checkout for Coryfi Premium</p>
            {premiumLoading ? (
              <Badge variant="secondary" className="mt-2">Checking premium status...</Badge>
            ) : isPremium && (
              <Badge className="mt-2 bg-green-500 text-white">Premium Active <Check className="ml-1 w-3 h-3" /></Badge>
            )}
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Billing Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Selection */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Crown className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />                  Select Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedPlan === "monthly"
                      ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                    onClick={() => setSelectedPlan("monthly")}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Plan</h3>
                        <p className="text-gray-600 dark:text-gray-400">₹229/month</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹229</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">per month</div>
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${selectedPlan === "annual"
                      ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                    onClick={() => setSelectedPlan("annual")}
                  >
                    <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">Save ₹360</Badge>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Annual Plan</h3>
                        <p className="text-gray-600 dark:text-gray-400">₹199/month (billed annually)</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">₹2,388</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-through">₹2,748</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Payment Method */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === "upi"
                      ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"}`}
                    onClick={() => setPaymentMethod("upi")}
                  >
                    <div className="flex items-center">
                      <Smartphone className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">UPI Payment</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Pay using UPI ID or QR code</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-white">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{currentPlan.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Billed {currentPlan.billing}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        ₹{currentPlan.total.toLocaleString()}</div>
                      {currentPlan.savings > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400">Save ₹{currentPlan.savings}</div>
                      )}
                    </div>
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Subtotal</span><span className="text-gray-900 dark:text-white">₹{currentPlan.total.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Tax</span><span className="text-gray-900 dark:text-white">₹0</span></div>
                    {currentPlan.savings > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400"><span>Discount</span><span>-₹{currentPlan.savings}</span></div>
                    )}
                  </div>
                  <Separator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-purple-600 dark:text-purple-400">₹{currentPlan.total.toLocaleString()}</span>
                  </div>
                  {session && userData?.userDetails?.phoneNumber && !isPremium && <Checkout userId={userData?.id} user_email={userData?.email} user_phone={userData?.userDetails?.phoneNumber} user_name={userData?.name} total_amount={currentPlan?.total} planType={selectedPlan} planName={currentPlan.name}  />}
                  {isPremium &&  <Badge className="mt-2 bg-green-500 text-white">Premium Active <Check className="ml-1 w-3 h-3" /></Badge>}
                  {!userData?.userDetails?.phoneNumber  && session && <Link href="/settings/profile">
                        <Badge className="mt-2 bg-red-500 text-white cursor-pointer hover:bg-red-600 transition">
                            Add mobile number to proceed
                            <Check className="ml-1 w-3 h-3" />
                        </Badge>
                        </Link>}
                  <div className="space-y-3 pt-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Check className="w-4 h-4 mr-2 text-green-500" /><span>Unlimited access to path searches</span></div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Check className="w-4 h-4 mr-2 text-green-500" /><span>Higher Profile Participation in Path Searches</span></div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Check className="w-4 h-4 mr-2 text-green-500" /><span>Secure Payments</span></div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400"><Check className="w-4 h-4 mr-2 text-green-500" /><span>Cancel anytime</span></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
