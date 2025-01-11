import { parsePhoneNumber, AsYouType } from 'libphonenumber-js'

export const countries = [
  { code: 'IN', name: 'India', phoneCode: '+91' },
  { code: 'NP', name: 'Nepal', phoneCode: '+977' },
  { code: 'BD', name: 'Bangladesh', phoneCode: '+880' },
  { code: 'LK', name: 'Sri Lanka', phoneCode: '+94' },
  { code: 'BT', name: 'Bhutan', phoneCode: '+975' },
  { code: 'MV', name: 'Maldives', phoneCode: '+960' },
  { code: 'PK', name: 'Pakistan', phoneCode: '+92' },
  { code: 'AF', name: 'Afghanistan', phoneCode: '+93' },
]

export const formatPhoneNumber = (phoneNumber: string, countryCode: string) => {
  try {
    const parsed = parsePhoneNumber(phoneNumber, countryCode as any)
    return parsed.formatInternational()
  } catch (error) {
    return phoneNumber
  }
}

export const formatPhoneNumberAsYouType = (phoneNumber: string, countryCode: string) => {
  const formatter = new AsYouType(countryCode as any)
  return formatter.input(phoneNumber)
}

