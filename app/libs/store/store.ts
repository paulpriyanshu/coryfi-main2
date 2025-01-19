import { configureStore } from '@reduxjs/toolkit';
import responseReducer from '../features/pathdata/pathSlice';
import chatReducer from '../features/mobilefooter/footerSlice'; // Adjust the path as needed

export const store = configureStore({
  reducer: {
    response: responseReducer, // Existing reducer
    chat: chatReducer, // Add your new chat reducer here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;