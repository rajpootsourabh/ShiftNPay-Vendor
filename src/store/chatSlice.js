// store/slices/chatSlice.js
import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    messages: [],
    currentPage: 1,
    totalPages: 1,
    selectedConversation: null,
  },
  reducers: {
    setMessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessagesToTop: (state, action) => {
      state.messages = [...action.payload, ...state.messages];
    },
    addNewMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    deleteMessage: (state, action) => {
      state.messages = state.messages.filter(
        (msg) => msg.data._id !== action.payload
      );
    },
    setPagination: (state, action) => {
      state.currentPage = action.payload.currentPage;
      state.totalPages = action.payload.totalPages;
    },
    resetMessages: (state) => {
      state.messages = [];
      state.currentPage = 1;
      state.totalPages = 1;
    },
    setSelectedConversation: (state, action) => {
      state.selectedConversation = action.payload;
    },
  },
});

export const {
  setMessages,
  addMessagesToTop,
  addNewMessage,
  deleteMessage,
  setPagination,
  resetMessages,
  setSelectedConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
