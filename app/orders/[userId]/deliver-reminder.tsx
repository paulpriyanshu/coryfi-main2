import { Info } from "lucide-react"

export default function DeliveryReminder() {
  return (
    <div className="w-full  mx-auto m-5">
      <div className="relative rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-6 shadow-sm dark:from-blue-950/20 dark:to-indigo-950/20 dark:border-blue-800/30 dark:bg-gray-900/50">
        {/* Gentle icon */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-800 mb-3 dark:text-gray-200">
              Just a friendly heads up! 👋
            </h3>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed dark:text-gray-300">
              Your delivery partner might ask you to confirm a few details to make sure your order gets to you safely:
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>
                  Your <span className="font-medium text-gray-800 dark:text-gray-200">name</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>
                  Your <span className="font-medium text-gray-800 dark:text-gray-200">phone number</span>
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                <span>
                  An <span className="font-medium text-gray-800 dark:text-gray-200">OTP</span>{" "}
                  <span className="text-xs text-gray-500 dark:text-gray-400">(not required in most of the cases)</span>
                </span>
              </div>
            </div>

            <div className="bg-white/60 dark:bg-gray-800/30 rounded-lg p-3 border border-white/80 dark:border-gray-700/50">
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                💡 These details help ensure your order reaches you securely. Feel free to share them with your delivery
                partner!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
