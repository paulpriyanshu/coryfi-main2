import { configureStore } from '@reduxjs/toolkit'
import responseReducer from '../features/pathdata/pathSlice'

export const store = configureStore({
  reducer: {
    response: responseReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch