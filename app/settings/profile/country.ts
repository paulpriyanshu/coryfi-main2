export const countries = [
  { name: "India", code: "IN", dialCode: "+91" },
  { name: "United States", code: "US", dialCode: "+1" },
  { name: "United Kingdom", code: "GB", dialCode: "+44" },
  { name: "Canada", code: "CA", dialCode: "+1" },
  { name: "Australia", code: "AU", dialCode: "+61" },
  { name: "Germany", code: "DE", dialCode: "+49" },
  { name: "France", code: "FR", dialCode: "+33" },
  { name: "Japan", code: "JP", dialCode: "+81" },
  { name: "China", code: "CN", dialCode: "+86" },
  { name: "Brazil", code: "BR", dialCode: "+55" },
  // Add more countries as needed
]

export const formatPhoneNumberAsYouType = (
  phoneNumber: string,
  countryCode: string,
  includeCountryCode: boolean = true
): string => {
  // Remove all non-digit characters
  const digits = phoneNumber.replace(/\D/g, "")
  
  // Basic formatting for Indian numbers (10 digits)
  if (countryCode === "IN" && digits.length <= 10) {
    if (digits.length <= 5) {
      return digits
    } else if (digits.length <= 10) {
      return `${digits.slice(0, 5)} ${digits.slice(5)}`
    }
  }
  
  // For other countries, return as is with basic spacing
  if (digits.length > 3) {
    return digits.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3")
  }
  
  return digits
}
