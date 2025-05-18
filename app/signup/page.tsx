import React from 'react'
import SignupComponent from './SignupComponent'
import { Suspense } from 'react'

export default function SignupPage() {
 

  return (
    <div className='dark:bg-black'>
    <Suspense fallback={<div>Loading signup page...</div>} >
      <SignupComponent />
    </Suspense>
    </div>
  )
}