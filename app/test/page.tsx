import React from 'react'
import { sample } from '../api/business/cashfree/sample'

async function page() {
    const data=await sample()
    console.log("sample data",data)
  return (
    <div>page</div>
  )
}


export default page