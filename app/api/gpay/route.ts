// import { NextResponse } from "next/server"

// export async function GET(req: Request) {
//   const url = new URL(req.url)
//   const amount = url.searchParams.get("amount") || "1.00"

//   const upiID = "priyanshu.paul003@okaxis" // Replace with actual UPI ID
//   const txnId = `TID${Date.now()}`
//   const orderId = `ORD${Date.now()}`
//   console.log("hello")

//   const upiIntentURL = `upi://pay?pa=${upiID}&pn=Your+Business&mc=1234&tid=${txnId}&tr=${orderId}&tn=Payment+for+Order&am=${amount}&cu=INR`

//   return NextResponse.json({ upiIntentURL })
// }