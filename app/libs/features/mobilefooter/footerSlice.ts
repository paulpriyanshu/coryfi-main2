import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatState {
  isMobileChatOpen: boolean;
}

const initialState: ChatState = {
  isMobileChatOpen: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setMobileChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isMobileChatOpen = action.payload;
    },
  },
});

export const { setMobileChatOpen } = chatSlice.actions;

export default chatSlice.reducer;