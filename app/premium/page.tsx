import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Crown, Star, Zap, Shield, Users, TrendingUp } from "lucide-react"

export default function PremiumPage() {
  const freeFeatures = [
    { feature: "Limited Access to Path Searches", included: false },
    { feature: "No Ad Revenue Sharing", included: false },
    { feature: "No Profile Boosts", included: false },
    { feature: "Lower Priority in Customer Service Channels", included: false },
    { feature: "Basic Safety Features", included: true },
    { feature: "No Multiple Profiles Allowed", included: false },
    { feature: "Only One Business Page per Account", included: false },
    { feature: "Minimal Profile Participation in Path Searches", included: false },
    { feature: "No Early Access to Upcoming Features", included: false },
  ]

  const premiumFeatures = [
    { feature: "Unlimited Access to Path Searches", included: true, icon: <TrendingUp className="w-4 h-4" /> },
    { feature: "Unlocks Ad Revenue Sharing Model on Posts", included: true, icon: <Star className="w-4 h-4" /> },
    { feature: "Higher Engagement on Profile & Posts", included: true, icon: <Zap className="w-4 h-4" /> },
    { feature: "Higher Priority in Customer Service Channels", included: true, icon: <Users className="w-4 h-4" /> },
    { feature: "Enhanced Safety Features", included: true, icon: <Shield className="w-4 h-4" /> },
    {
      feature: "Unlock Multiple Isolated Profiles on Same Account",
      included: true,
      icon: <Users className="w-4 h-4" />,
    },
    {
      feature: "Create Multiple Business Pages with Same Account",
      included: true,
      icon: <TrendingUp className="w-4 h-4" />,
    },
    { feature: "Higher Profile Participation in Path Searches", included: true, icon: <Star className="w-4 h-4" /> },
    {
      feature: "Early Access to Beta Versions of Upcoming Features",
      included: true,
      icon: <Zap className="w-4 h-4" />,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Crown className="w-16 h-16 text-purple-600 dark:text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent mb-6">
            Upgrade to Coryfi Premium
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            Unlock unlimited potential with advanced features, priority support, and exclusive benefits designed for
            serious creators and businesses.
          </p>
          {/* <Badge
            variant="secondary"
            className="text-lg px-6 py-2 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
          >
            Join 10,000+ Premium Users
          </Badge> */}
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-7xl mx-auto mb-20">
          {/* Monthly Plan */}
          <Card className="relative border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-purple-600"></div>
            <CardHeader className="text-center pb-8 pt-12 px-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Monthly Plan</CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                  Perfect for trying out premium features
                </CardDescription>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-6xl font-bold text-purple-600 dark:text-purple-400">₹229</span>
                </div>
                <span className="text-xl text-gray-600 dark:text-gray-400">/month</span>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>All premium features included</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>24/7 priority support</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Button className="w-full h-14 text-lg font-semibold bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Start Monthly Plan
              </Button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                No commitment • Start immediately
              </p>
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative border-2 border-purple-500 dark:border-purple-400 bg-white dark:bg-gray-800 shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-600 to-blue-600"></div>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white px-6 py-4 text-sm font-bold shadow-lg">
                🎉 BEST VALUE - SAVE 13%
              </Badge>
            </div>
            <CardHeader className="text-center pb-8 pt-12 px-8">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Annual Plan</CardTitle>
                <CardDescription className="text-lg text-gray-600 dark:text-gray-400">
                  Best value for committed creators
                </CardDescription>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-6xl font-bold text-purple-600 dark:text-purple-400">₹199</span>
                </div>
                <span className="text-xl text-gray-600 dark:text-gray-400">/month</span>
                <div className="mt-2">
                  <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
                    Save ₹360 per year!
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Billed annually at ₹2,388</p>
              </div>
              <div className="space-y-3 text-left">
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>All premium features included</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Priority customer support</span>
                </div>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                  <span>Early access to new features</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <Button className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 hover:from-purple-700 hover:to-blue-700 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                Start Annual Plan
              </Button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Most popular choice • Best value
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Compare Plans</h2>

          {/* Desktop Table */}
          <div className="hidden lg:block">
            <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-3 bg-gray-50 dark:bg-gray-700">
                <div className="p-6 font-semibold text-gray-900 dark:text-white">Features</div>
                <div className="p-6 text-center font-semibold text-gray-900 dark:text-white border-l border-gray-200 dark:border-gray-600">
                  Free
                </div>
                <div className="p-6 text-center font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-900 dark:text-purple-100 border-l border-gray-200 dark:border-gray-600">
                  <Crown className="w-5 h-5 inline mr-2" />
                  Premium
                </div>
              </div>

              {premiumFeatures.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 border-t border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="p-6 flex items-center text-gray-900 dark:text-white">
                    {item.icon && <span className="mr-3 text-purple-600 dark:text-purple-400">{item.icon}</span>}
                    {item.feature}
                  </div>
                  <div className="p-6 text-center border-l border-gray-200 dark:border-gray-600">
                    <X className="w-5 h-5 text-red-500 dark:text-red-400 mx-auto" />
                  </div>
                  <div className="p-6 text-center bg-purple-50 dark:bg-purple-900/10 border-l border-gray-200 dark:border-gray-600">
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400 mx-auto" />
                  </div>
                </div>
              ))}
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-6">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader className="bg-gray-50 dark:bg-gray-700">
                <CardTitle className="text-center text-gray-900 dark:text-white">Free Plan</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {freeFeatures.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-900 dark:text-white">{item.feature}</span>
                      {item.included ? (
                        <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <X className="w-5 h-5 text-red-500 dark:text-red-400" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-2 border-purple-500 dark:border-purple-400">
              <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                <CardTitle className="text-center text-purple-900 dark:text-purple-100">
                  <Crown className="w-5 h-5 inline mr-2" />
                  Premium Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {premiumFeatures.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="mr-3 text-purple-600 dark:text-purple-400">{item.icon}</span>
                        <span className="text-gray-900 dark:text-white">{item.feature}</span>
                      </div>
                      <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Ready to Go Premium?</h3>
              <p className="text-purple-100 dark:text-purple-200 mb-6">
                Join thousands of creators who have already upgraded their Coryfi experience
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-purple-600 hover:bg-gray-100 dark:bg-gray-100 dark:text-purple-600 dark:hover:bg-gray-200"
                >
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="flex justify-center items-center space-x-8 text-gray-400 dark:text-gray-500">
            <div className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              <span>Secure Payments</span>
            </div>
            <div className="flex items-center">
              <Users className="w-5 h-5 mr-2" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
