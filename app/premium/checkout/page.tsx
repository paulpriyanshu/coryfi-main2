"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, Lock, Crown, ArrowLeft, Check, Smartphone, Building, Globe, Network, Loader2 } from "lucide-react"
import { fetchUserData, fetchUserDp, fetchUserInfo } from "@/app/api/actions/media"
import { useSession } from "next-auth/react"

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState("annual")
  const [paymentMethod, setPaymentMethod] = useState("upi")
    const {data:session} = useSession()
  const [userData,setUserData]=useState(null)
  const [loading,setLoading]=useState(false)
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
      total: 229,
      savings: 0,
    },
    annual: {
      name: "Annual Plan",
      price: 199,
      billing: "annually",
      total: 2388,
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
  useEffect(()=>{
    async function getUser(){
        const user=await fetchUserInfo(session?.user?.email)
        setUserData(user)
        console.log("fetched user",user)
    }
    getUser()
  },[])
  const handlePurchase = async () => {
    try {
        setLoading(true)
        if(session?.user?.email){
              const res = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userData.id,
          email: userData.email,
          phone: userData.userDetails?.phoneNumber,
          name: userData.name
        })
        
      });
         const data = await res.json();
         console.log("data of cashfree",data)
        if (data.success) {
        setLoading(false)
        window.location.href = data.subscription_link;
            
    }
    else {
        alert('Failed to start subscription: ' + data.error);
      }
    } 
    } 
    catch (err) {
      console.error(err);
      alert('Something went wrong.');
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complete Your Purchase</h1>
            <p className="text-gray-600 dark:text-gray-400">Secure checkout for Coryfi Premium</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Billing Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Selection */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Crown className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Select Your Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPlan === "monthly"
                        ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
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
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                      selectedPlan === "annual"
                        ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
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

            {/* Billing Information */}
            {/* <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <Building className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Billing Information
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Enter your billing details for the invoice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                      First Name *
                    </Label>
                    <Input
                      id="firstName"
                      value={billingDetails.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                      Last Name *
                    </Label>
                    <Input
                      id="lastName"
                      value={billingDetails.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={billingDetails.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={billingDetails.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-gray-700 dark:text-gray-300">
                      Company (Optional)
                    </Label>
                    <Input
                      id="company"
                      value={billingDetails.company}
                      onChange={(e) => handleInputChange("company", e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address" className="text-gray-700 dark:text-gray-300">
                    Address *
                  </Label>
                  <Input
                    id="address"
                    value={billingDetails.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={billingDetails.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">
                      State *
                    </Label>
                    <Input
                      id="state"
                      value={billingDetails.state}
                      onChange={(e) => handleInputChange("state", e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode" className="text-gray-700 dark:text-gray-300">
                      ZIP Code *
                    </Label>
                    <Input
                      id="zipCode"
                      value={billingDetails.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                      className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">
                    Country *
                  </Label>
                  <Select value={billingDetails.country} onValueChange={(value) => handleInputChange("country", value)}>
                    <SelectTrigger className="mt-1 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="United States">United States</SelectItem>
                      <SelectItem value="United Kingdom">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card> */}

            {/* Payment Method */}
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {/* <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "card"
                        ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setPaymentMethod("card")}
                  >
                    <div className="flex items-center">
                      <CreditCard className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Credit/Debit Card</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </div> */}

                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "upi"
                        ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
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

                  {/* <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === "netbanking"
                        ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => setPaymentMethod("netbanking")}
                  >
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 mr-3 text-gray-600 dark:text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Net Banking</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">All major Indian banks supported</p>
                      </div>
                    </div>
                  </div> */}
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
                        ₹{currentPlan.total.toLocaleString()}
                      </div>
                      {currentPlan.savings > 0 && (
                        <div className="text-sm text-green-600 dark:text-green-400">Save ₹{currentPlan.savings}</div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                      <span className="text-gray-900 dark:text-white">₹{currentPlan.total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Tax</span>
                      <span className="text-gray-900 dark:text-white">₹0</span>
                    </div>
                    {currentPlan.savings > 0 && (
                      <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                        <span>Discount</span>
                        <span>-₹{currentPlan.savings}</span>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-gray-200 dark:bg-gray-700" />

                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-gray-900 dark:text-white">Total</span>
                    <span className="text-purple-600 dark:text-purple-400">₹{currentPlan.total.toLocaleString()}</span>
                  </div>

                  <Button
                        onClick={handlePurchase}
                        disabled={loading}
                        className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center"
                        >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                            <Lock className="w-4 h-4 mr-2" />
                            Complete Purchase
                            </>
                        )}
                        </Button>

                  <div className="space-y-3 pt-4">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      <span>Unlimited access to path searches</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      <span>Higher Profile Participation in Path Searches</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      <span>Secure Payments</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-4 h-4 mr-2 text-green-500" />
                      <span>Cancel anytime</span>
                    </div>
                    

                  </div>
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              {/* <Card className="mt-6 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" className="mt-1" />
                    <Label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      I agree to the{" "}
                      <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="#" className="text-purple-600 dark:text-purple-400 hover:underline">
                        Privacy Policy
                      </a>
                      . I understand that my subscription will automatically renew.
                    </Label>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
