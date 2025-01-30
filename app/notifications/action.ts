"use server"

import { approve_request, reject_request } from "@/app/api/actions/network"
import axios from "axios"
import type { Request } from "./types"

export async function handleAccept(request: Request, userEmail: string, userName: string) {
  const result = await approve_request(request.senderMail, userEmail, userName, request.id)

  if (!result.success) {
    throw new Error(result.error)
  }

  await axios.post("https://neo.coryfi.com/api/v1/connect", {
    email1: userEmail,
    email2: request.senderMail,
    strength: Number.parseInt(request.content.split(" ").pop(), 10),
  })
}

export async function handleReject(request: Request, userEmail: string) {
  const result = await reject_request(request.senderMail, userEmail, request.id)

  if (!result.success) {
    throw new Error(result.error)
  }
}

