import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../store/store'

// Define a type for the slice state
interface ResponseState {
  responseData: Record<string, any> | null; // Field for storing response data
}

// Define the initial state using that type
const initialState: ResponseState = {
  responseData: null,
}

export const responseSlice = createSlice({
  name: 'response',
  initialState,
  reducers: {
    // New action to store the response data
    setResponseData: (state, action: PayloadAction<Record<string, any>>) => {
      state.responseData = action.payload
      // console.log("this is state",state.responseData)
    },
    clearResponseData: (state) => { 
      state.responseData = null; // Action to clear response data
    },
  },
})

export const { setResponseData, clearResponseData } = responseSlice.actions

// Selector to retrieve response data
export const selectResponseData = (state: RootState) => state.response.responseData

export default responseSlice.reducer