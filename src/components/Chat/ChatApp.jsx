import React, { useState, useEffect } from "react";
import ChatSidebar from "./ChatSidebar";
import ChatArea from "./ChatArea";
import { useDispatch, useSelector } from "react-redux";
import {
  resetMessages,
  setPagination,
  setSelectedConversation,
} from "../../store/chatSlice";
import { useSocket } from '../../context/socketContext'; // Import useSocket

const ChatApp = () => {
  const dispatch = useDispatch();
  const { selectedConversation, messages, currentPage, totalPages } = useSelector((state) => state.chat);

  // Consume all necessary values from SocketContext
  const { socket, currentUser, combinedList, onlineUsers, fetchChatMessages } = useSocket();

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [otherUser, setOtherUser] = useState(null); // Managed locally based on selectedConversation

  // Effect to update otherUser when selectedConversation changes
  useEffect(() => {
    if (selectedConversation && currentUser) {
      const foundOtherUser = selectedConversation.members.find(
        (member) => member._id !== currentUser._id
      );
      setOtherUser(foundOtherUser);
    } else {
      setOtherUser(null);
    }
  }, [selectedConversation, currentUser]);

  // Effect to manage isLoadingMore based on messageList event
  // This listener needs to be here because isLoadingMore is local to ChatApp
  useEffect(() => {
    if (!socket) return;

    const handleMessageList = () => {
      setIsLoadingMore(false);
    };

    socket.on('messageList', handleMessageList);

    return () => {
      socket.off('messageList', handleMessageList);
    };
  }, [socket]); // Depend only on socket

  const handleSelectConversation = (item) => {
    dispatch(resetMessages());
    dispatch(setPagination({ currentPage: 1, totalPages: 1 }));
    setIsLoadingMore(true); // Set loading true when selecting a new conversation

    if (item.type === "vendor") {
      // For a new chat with a vendor (no existing conversation ID)
      dispatch(setSelectedConversation({
        _id: null, // No conversation ID yet
        members: [
          {
            _id: currentUser?._id,
            modelType: "user",
            username: currentUser?.username || "You",
          },
          {
            _id: item.data._id,
            modelType: "employee", // Assuming vendor is an employee on the other side
            username: item.data.name,
          },
        ],
      }));
      // No messages to load for a brand new vendor chat, so set loading false immediately
      setIsLoadingMore(false);
    } else if (item.type === "conversation") {
      // For an existing conversation
      const normalizedMembers = item.data.members.map((member) => ({
        ...member,
        modelType: member._id === currentUser?._id ? "user" : "vendor", // Correctly identify user vs vendor
      }));
      dispatch(setSelectedConversation({
        ...item.data,
        members: normalizedMembers,
      }));
      // Call fetchChatMessages from context
      fetchChatMessages(item.data._id, 1, 10);
    }
  };

  const handlePageChange = (page) => {
    setIsLoadingMore(true); // Set loading true when requesting next page
    // Call fetchChatMessages from context
    fetchChatMessages(selectedConversation?._id, page, 10);
  };

  const handleSendMessage = (message, type = "TEXT") => {
    if (selectedConversation && socket) { // Ensure socket is available
      const receiver = selectedConversation?.members?.find(
        (m) => m?._id?.toString() !== currentUser?._id?.toString()
      );
      if (receiver) {
        socket.emit("newMessage", {
          receiver: receiver._id,
          receiverModelType: 'employee', // Use the correct modelType from the receiver object
          message,
          type,
        });
      }
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (socket) { // Ensure socket is available
      socket.emit("deleteMessage", { id: messageId });
    }
  };

  const handleArchiveChat = (id) => {
    if (socket) { // Ensure socket is available
      socket.emit("archive-delete-chat", {
        id,
        key: "is_archived",
        status: true,
      });
    }
  };

  const handleDeleteChat = (id) => {
    if (socket) { // Ensure socket is available
      socket.emit("archive-delete-chat", {
        id,
        key: "is_deleted",
        status: true,
      });
    }
  };

  return (
    <div className="chat-container d-flex p-1" style={{ height: "88vh" }}>
      <ChatSidebar
        combinedList={combinedList}
        onlineUsers={onlineUsers}
        currentUserId={currentUser?._id} // Use currentUser from context
        onSelectConversation={handleSelectConversation}
        onArchiveChat={handleArchiveChat}
        onDeleteChat={handleDeleteChat}
      />
      <ChatArea
        user={currentUser} // Use currentUser from context
        conversation={selectedConversation}
        otherUser={otherUser} // Pass the derived otherUser
        onlineUsers={onlineUsers} // Pass onlineUsers from context
        messages={messages}
        onSendMessage={handleSendMessage}
        onDeleteMessage={handleDeleteMessage}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoadingMore={isLoadingMore}
      />
    </div>
  );
};

export default ChatApp;