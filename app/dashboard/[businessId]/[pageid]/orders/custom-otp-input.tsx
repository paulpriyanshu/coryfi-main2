"use client"

import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from "react"
import { cn } from "@/lib/utils"

interface CustomOtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
}

export function CustomOtpInput({
  length = 6,
  value = "",
  onChange,
  disabled = false,
  error = false,
}: CustomOtpInputProps) {
  const [otp, setOtp] = useState<string[]>(value.split("").concat(Array(length - value.length).fill("")))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  // Update internal OTP state when value prop changes
  useEffect(() => {
    setOtp(value.split("").concat(Array(length - value.length).fill("")))
  }, [value, length])

  // Focus the first empty input or the last input if all filled
  useEffect(() => {
    const firstEmptyIndex = otp.findIndex((digit) => digit === "")
    const focusIndex = firstEmptyIndex === -1 ? length - 1 : firstEmptyIndex
    
    // Only focus if the component is mounted and not disabled
    if (inputRefs.current[focusIndex] && document.activeElement !== inputRefs.current[focusIndex] && !disabled) {
      inputRefs.current[focusIndex]?.focus()
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value
    
    // Only accept single digits
    if (newValue.length > 1) return
    
    // Update the OTP array
    const newOtp = [...otp]
    newOtp[index] = newValue
    setOtp(newOtp)
    
    // Call the onChange callback with the new OTP string
    onChange(newOtp.join(""))
    
    // Move focus to the next input if a digit was entered
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    // Handle backspace
    if (e.key === "Backspace") {
      if (otp[index] === "" && index > 0) {
        // If current input is empty and backspace is pressed, focus previous input
        const newOtp = [...otp]
        newOtp[index - 1] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
        inputRefs.current[index - 1]?.focus()
      } else if (otp[index] !== "") {
        // If current input has a value, clear it
        const newOtp = [...otp]
        newOtp[index] = ""
        setOtp(newOtp)
        onChange(newOtp.join(""))
      }
    }
    
    // Handle left arrow key
    if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle right arrow key
    if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()
    
    // Only process if the pasted data contains digits
    if (!/^\d+$/.test(pastedData)) return
    
    // Take only the first 'length' characters
    const pastedOtp = pastedData.slice(0, length).split("")
    const newOtp = [...Array(length).fill("")]
    
    pastedOtp.forEach((digit, index) => {
      newOtp[index] = digit
    })
    
    setOtp(newOtp)
    onChange(newOtp.join(""))
    
    // Focus the next empty input or the last input
    const nextEmptyIndex = newOtp.findIndex((digit) => digit === "")
    const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
    inputRefs.current[focusIndex]?.focus()
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {Array.from({ length }, (_, index) => (
        <div key={index} className="relative">
          <input
            ref={(ref) => (inputRefs.current[index] = ref)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              "w-10 h-12 sm:w-12 sm:h-14 text-center text-lg font-semibold rounded-lg border-2 transition-all",
              "focus:outline-none focus:ring-2 focus:ring-offset-1",
              error
                ? "border-red-500 focus:ring-red-500 bg-red-50"
                : "border-gray-300 focus:border-primary focus:ring-primary",
              disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white",
              "appearance-none"
            )}
            aria-label={`Digit ${index + 1}`}
          />
          {index < length - 1 && index % 3 === 2 && (
            <div className="absolute top-1/2 -right-3 transform -translate-y-1/2 text-gray-400">-</div>
          )}
        </div>
      ))}
    </div>
  )
}
