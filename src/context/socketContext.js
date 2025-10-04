// src/context/SocketContext.js
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useDispatch } from 'react-redux';
import {
  setMessages,
  addMessagesToTop,
  addNewMessage,
  deleteMessage as removeMessage,
  setPagination,
  resetMessages
} from '../store/chatSlice';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [onlineUsers, setOnlineUsers] = useState({});
  const [combinedList, setCombinedList] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const socketRef = useRef(null);

  // Effect to initialize and manage the socket connection based on token
  useEffect(() => {
    const token = localStorage.getItem("shinpay-vendor-token");

    // If a socket already exists and token is gone, disconnect it
    if (socketRef.current && !token) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setCurrentUser(null); // Reset user if token is removed
      return;
    }

    // If no token, or socket already exists and token hasn't changed, do nothing
    if (!token || socketRef.current) {
      return;
    }

    // Create new socket instance only when token is available and no socket exists
    const newSocket = io(process.env.REACT_APP_SOCKET_URL, {
      auth: { token: token },
      extraHeaders: {
        Authorization: `Bearer ${token}`,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = newSocket; // Store the new socket in the ref

    // Cleanup function for this useEffect
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [localStorage.getItem("token")]); // Dependency array: only re-run if token changes

  // Effect to register and unregister socket event listeners
  useEffect(() => {
    const socket = socketRef.current; // Get the current socket instance from ref

    if (!socket) return; // Do nothing if socket is not initialized yet

    // Connection events
    const onConnect = () => {
      socket.emit("join", {});
    };

    const onDisconnect = () => {
      if (currentUser?._id) {
        socket.emit("offline", { userId: currentUser._id });
      }
    };

    // User events
    const onJoin = (data) => {
      setCurrentUser({ _id: data.data, username: "You" });
      socket.emit("online", { status: true, userId: data.data });
    };

    const onUserStatus = (data) => {
      setOnlineUsers(prev => ({ ...prev, [data.userId]: data.is_online }));
    };

    const onOnlineUsers = (data) => {
      const updatedUsers = {};
      data.forEach(({ userId, is_online }) => {
        updatedUsers[userId] = is_online;
      });
      setOnlineUsers(prev => ({ ...prev, ...updatedUsers }));
    };

    // Chat events
    const onEmployeesAndChatsList = ({ data }) => {
      setCombinedList(data);
    };

    const onMessageList = ({ data, currentPage, totalPages }) => {
      if (currentPage === 1) {
        dispatch(setMessages(data.reverse()));
      } else {
        dispatch(addMessagesToTop(data.reverse()));
      }
      dispatch(setPagination({ currentPage, totalPages }));
    };

    const onNewMessage = ({ response }) => {
      dispatch(addNewMessage(response));
      socket.emit("getEmployeesAndChats", {});
    };

    const onMessageSent = ({ response }) => {
      dispatch(addNewMessage(response));
      socket.emit("getEmployeesAndChats", {});
    };

    const onMessageDeleted = ({ deletedMessage }) => {
      dispatch(removeMessage(deletedMessage._id));
    };

    const onArchiveChat = ({ data }) => {
      socket.emit("getEmployeesAndChats", {});
    };

    const onDeleteChat = ({ data }) => {
      socket.emit("getEmployeesAndChats", {});
    };

    const onErrorEvent = ({ message }) => {
    };

    // Register all listeners
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("join", onJoin);
    socket.on("userStatus", onUserStatus);
    socket.on("onlineUsers", onOnlineUsers);
    socket.on("employeesAndChatsList", onEmployeesAndChatsList);
    socket.on("messageList", onMessageList);
    socket.on("newMessage", onNewMessage);
    socket.on("messageSent", onMessageSent);
    socket.on("messageDeleted", onMessageDeleted);
    socket.on("archive-chat", onArchiveChat);
    socket.on("delete-chat", onDeleteChat);
    socket.on("errorEvent", onErrorEvent);

    // Initial data fetch (only if socket is ready)
    socket.emit("getEmployeesAndChats", {});

    // Cleanup all listeners when component unmounts or socket changes
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("join", onJoin);
      socket.off("userStatus", onUserStatus);
      socket.off("onlineUsers", onOnlineUsers);
      socket.off("employeesAndChatsList", onEmployeesAndChatsList);
      socket.off("messageList", onMessageList);
      socket.off("newMessage", onNewMessage);
      socket.off("messageSent", onMessageSent);
      socket.off("messageDeleted", onMessageDeleted);
      socket.off("archive-chat", onArchiveChat);
      socket.off("delete-chat", onDeleteChat);
      socket.off("errorEvent", onErrorEvent);
    };
  }, [socketRef.current, dispatch, currentUser]); // Depend on socketRef.current and dispatch, currentUser

  const contextValue = {
    socket: socketRef.current, // Provide the current socket instance
    onlineUsers,
    combinedList,
    currentUser,
    fetchChatMessages: (conversationId, page, limit) => {
      if (socketRef.current && conversationId) {
        socketRef.current.emit('getChatMessages', { conversationId, page, limit });
      }
    }
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};