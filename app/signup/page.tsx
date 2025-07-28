import SignupComponent from "./SignupComponent"
import { Suspense } from "react"
import NetworkBackground from "./NetworkBackground"

export default function SignupPage() {
  return (
    <div className="relative min-h-screen dark:bg-black overflow-hidden">
      <NetworkBackground />
      <div className="relative z-10">
        <Suspense fallback={<div>Loading signup page...</div>}>
          <SignupComponent />
        </Suspense>
      </div>
    </div>
  )
}
