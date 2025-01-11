'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/Label"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Edit, Save, Camera, MapPin, Globe, Phone, User, Mail, Building } from 'lucide-react'
import { countries, formatPhoneNumber, formatPhoneNumberAsYouType } from '../countryData'
import { updateUserProfile } from '@/app/api/actions/network'
import toast, { Toaster } from 'react-hot-toast'
import { useSession } from 'next-auth/react'
import { fetchUserId, fetchUserInfo } from '@/app/api/actions/media'
import axios from 'axios'

interface ProfileField {
  label: string
  value: string
  isEditing: boolean
  icon: React.ReactNode
}

export default function ProfilePage() {
  const [isHovered, setIsHovered] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState(countries[0].code)
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState(null)
  const { data: session, status } = useSession()
  const [editedImage, setEditedImage] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef(null)
  
  const [fields, setFields] = useState({
    name: { label: 'Name', value: '', isEditing: false, icon: <User className="h-4 w-4" /> },
    email: { label: 'Email', value: '', isEditing: false, icon: <Mail className="h-4 w-4" /> },
    bio: { label: 'Bio', value: '', isEditing: false, icon: <Edit className="h-4 w-4" /> },
    state: { label: 'State', value: '', isEditing: false, icon: <MapPin className="h-4 w-4" /> },
    city: { label: 'City', value: '', isEditing: false, icon: <Building className="h-4 w-4" /> },
    country: { label: 'Country', value: '', isEditing: false, icon: <Globe className="h-4 w-4" /> },
    phone: { label: 'Phone Number', value: '', isEditing: false, icon: <Phone className="h-4 w-4" /> },
  })

  const [profileImageUrl, setProfileImageUrl] = useState('/placeholder.svg?height=192&width=192')

  useEffect(() => {
    const getUser = async () => {
      if (session?.user?.email) {
        const user = await fetchUserId(session.user.email)
        setUserId(user?.id)
        const userData = await fetchUserInfo(session.user.email)
        
        let userBio = ''
        let userCity = ''
        let userState = ''
        let userCountry = ''
        let userPhone = ''
        let userDp = ''
        if ('userDetails' in userData) {
          userBio = userData?.userDetails?.bio
          userCity = userData?.userDetails?.city
          userState = userData?.userDetails?.state
          userCountry = userData?.userDetails?.country
          userPhone = userData?.userDetails?.phoneNumber
          userDp = userData?.userDetails?.displayImage
        }
        
        setFields(prev => ({
          ...prev,
          name: { ...prev.name, value: user?.name || '' },
          email: { ...prev.email, value: user?.email || '' },
          bio: { ...prev.bio, value: userBio || '' },
          city: { ...prev.city, value: userCity || '' },
          state: { ...prev.state, value: userState || '' },
          country: { ...prev.country, value: userCountry || countries[0].name },
          phone: { ...prev.phone, value: userPhone || '' }
        }))

        const userCountryObj = countries.find(c => c.name === userCountry)
        if (userCountryObj) {
          setSelectedCountry(userCountryObj.code)
        }

        if (userDp) {
          setProfileImageUrl(userDp)
        }
      }
    }
    getUser()
  }, [session])

  const updatePhoneWithCountryCode = useCallback((countryCode: string) => {
    const country = countries.find(c => c.code === countryCode)
    if (country) {
      setFields(prev => ({
        ...prev,
        phone: {
          ...prev.phone,
          value: country.phoneCode + ' ' + (prev.phone.value.replace(/^\+\d+\s*/, '') || '')
        }
      }))
    }
  }, [])

  useEffect(() => {
    updatePhoneWithCountryCode(selectedCountry)
  }, [selectedCountry, updatePhoneWithCountryCode])

  const toggleEdit = (field: string) => {
    if (field !== 'email') {
      setFields(prev => ({
        ...prev,
        [field]: { ...prev[field], isEditing: !prev[field].isEditing }
      }))
    }
  }

  const handleChange = (field: string, value: string) => {
    if (field === 'phone') {
      const country = countries.find(c => c.code === selectedCountry)
      const phoneCode = country?.phoneCode || ''
      value = value.startsWith(phoneCode) ? value : phoneCode + ' ' + value.replace(/^\+\d+\s*/, '')
      value = formatPhoneNumberAsYouType(value, selectedCountry)
    } else if (field === 'country') {
      const country = countries.find(c => c.code === value)
      if (country) {
        setSelectedCountry(value)
        setFields(prev => ({
          ...prev,
          country: { ...prev.country, value: country.name }
        }))
        return
      }
    }
    
    setFields(prev => ({
      ...prev,
      [field]: { ...prev[field], value }
    }))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => setEditedImage(e.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSaveEditedImage = async (editedImage: string) => {
    setIsUploading(true)
    setUploadProgress(0)

    try {
      const response = await fetch(editedImage)
      const blob = await response.blob()
      const file = new File([blob], 'profile_image.jpg', { type: 'image/jpeg' })

      const uploadUrlResponse = await axios.get(`http://localhost:8000/api/imageUpload/${file.name}`)
      const { url, filename } = uploadUrlResponse.data

      await axios.put(url, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percentCompleted)
        },
      })

      const previewResponse = await axios.get(`http://localhost:8000/api/image/${filename}`)
      setProfileImageUrl(previewResponse.data.url)

      toast.success('Profile image uploaded successfully')
    } catch (error) {
      console.error('Error uploading profile image:', error)
      toast.error('Failed to upload profile image')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      setEditedImage(null)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const loadingToast = toast.loading('Updating profile...')

    try {
      const updatedUser = await updateUserProfile({
        userId,
        name: fields.name.value,
        email: fields.email.value,
        userDetails: {
          bio: fields.bio.value,
          state: fields.state.value,
          city: fields.city.value,
          country: fields.country.value,
          phoneNumber: fields.phone.value,
          displayImage: profileImageUrl,
        }
      })
      
      toast.success('Profile updated successfully!', {
        id: loadingToast,
      })
    } catch (error) {
      toast.error('Failed to update profile. Please try again.', {
        id: loadingToast,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-8">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Card className="max-w-4xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <h1 className="text-4xl font-bold mb-8 text-center text-gray-800 dark:text-gray-200">Your Profile</h1>
          
          <div className="flex flex-col items-center mb-12">
            <div 
              className="relative group cursor-pointer"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                  <img 
                    src={editedImage || profileImageUrl}
                    alt="Profile Picture" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Camera className="text-white w-12 h-12" />
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileSelect}
            />
            {editedImage && (
              <div className="mt-4 flex space-x-4">
                <Button onClick={() => handleSaveEditedImage(editedImage)} disabled={isUploading}>
                  {isUploading ? `Uploading... ${uploadProgress}%` : 'Save Image'}
                </Button>
                <Button variant="outline" onClick={() => setEditedImage(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
          
          <div className="space-y-8">
            {Object.entries(fields).map(([key, field]) => (
              <div key={key} className="relative bg-gray-50 dark:bg-gray-700 p-4 rounded-lg transition-all duration-300 hover:shadow-md">
                <div className="flex items-center mb-2">
                  {field.icon}
                  <Label htmlFor={key} className="text-lg font-semibold text-gray-700 dark:text-gray-300 ml-2">
                    {field.label}
                  </Label>
                </div>
                {field.isEditing && key !== 'email' ? (
                  key === 'bio' ? (
                    <Textarea
                      id={key}
                      value={field.value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="mt-2 w-full bg-white dark:bg-gray-600"
                    />
                  ) : key === 'country' ? (
                    <Select 
                      value={selectedCountry}
                      onValueChange={(value) => handleChange('country', value)}
                    >
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Select a country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id={key}
                      value={field.value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="mt-2 bg-white dark:bg-gray-600"
                    />
                  )
                ) : (
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{field.value || 'Not set'}</p>
                )}
                {key !== 'email' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => toggleEdit(key)}
                  >
                    {field.isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <Button 
            className="w-full mt-8 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save All Changes'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

