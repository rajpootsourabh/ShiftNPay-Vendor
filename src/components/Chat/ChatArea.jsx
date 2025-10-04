import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { getUserName } from '../../Helper/functions';

const ChatArea = ({
  user,
  conversation,
  otherUser,
  onlineUsers,
  messages,
  onSendMessage,
  onDeleteMessage,
  currentPage,
  totalPages,
  onPageChange,
  isLoadingMore
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef(null);
  const chatMessagesRef = useRef(null);
  const loadingRef = useRef(false); // Internal flag to prevent rapid load calls
  const previousScrollHeight = useRef(0); // To store scroll height before messages update
  const [isAtBottom, setIsAtBottom] = useState(true); // Tracks if user is currently at the bottom

  useEffect(() => {
    if (currentPage === 1 && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      setIsAtBottom(true); // Confirm we are at the bottom after initial scroll
      loadingRef.current = false; // Ensure loading flag is reset for initial load
    }
  }, [conversation?._id, messages.length, currentPage]); // Depend on conversation ID to re-trigger for new chats

  useLayoutEffect(() => {
    const container = chatMessagesRef.current;
    if (container && currentPage > 1 && messages.length > 0 && previousScrollHeight.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const scrollDifference = newScrollHeight - previousScrollHeight.current;
      container.scrollTop += scrollDifference;
    }
    previousScrollHeight.current = 0;
  }, [messages, currentPage]); // Depend on messages and currentPage to re-evaluate

  useEffect(() => {
    if (isAtBottom && !isLoadingMore) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom, isLoadingMore]); // Depend on messages, isAtBottom, isLoadingMore

  useEffect(() => {
    const handleScroll = () => {
      const container = chatMessagesRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;

      previousScrollHeight.current = scrollHeight;

      if (scrollTop === 0 && currentPage < totalPages && !isLoadingMore && !loadingRef.current) {
        loadingRef.current = true; // Set internal flag to prevent multiple rapid calls
        onPageChange(currentPage + 1);
      }

      const atBottom = (scrollHeight - (scrollTop + clientHeight)) <= 5;
      setIsAtBottom(atBottom);

      setShowScrollToBottom((scrollHeight - (scrollTop + clientHeight)) > 100);
    };

    const container = chatMessagesRef.current;
    container?.addEventListener('scroll', handleScroll);

    return () => {
      container?.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage, totalPages, onPageChange, isLoadingMore]); // Dependencies updated

  useEffect(() => {
    loadingRef.current = false;
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollToBottom(false);
    setIsAtBottom(true); // User is now at the bottom
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim()) {
      onSendMessage(messageInput);
      setMessageInput('');
      scrollToBottom(); // Always scroll to bottom after sending a message
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatLongDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="chat-area d-flex flex-column" style={{
      height: '100%',
      width: '100%',
      backgroundColor: '#e5ddd5',
      position: 'relative'
    }}>
      {conversation ? (
        <>
          <div className="chat-header p-3 border-bottom d-flex align-items-center bg-light" style={{
            height: '64px',
            position: 'sticky',
            top: 0,
            zIndex: 1
          }}>
            <div className="avatar me-3">
              <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  backgroundImage: otherUser?.image
                    ? `url(${otherUser.image})`
                    : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {!otherUser?.image && getUserName(otherUser)?.charAt(0)?.toUpperCase() || 'C'}
              </div>
            </div>
            <div className="flex-grow-1">
              <h5 className="mb-0 fw-normal" style={{ fontSize: '16px' }}>
                {getUserName(otherUser) || 'Chat'}
              </h5>
              <small className="text-muted" style={{ fontSize: '12px' }}>
                {onlineUsers[otherUser?._id?.toString()] ? 'online' : 'offline'}
              </small>
            </div>
          </div>

          <div
            className="chat-messages flex-grow-1 p-3 overflow-auto bg-white"
            style={{ paddingBottom: '80px' }}
            ref={chatMessagesRef}
          >
            {isLoadingMore && (
              <div className="text-center py-2">
                <div className="spinner-border spinner-border-sm text-secondary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {messages.map((msg, index) => {
              const prevMessageDate = index > 0 ? new Date(messages[index - 1].data.createdAt).toDateString() : null;
              const currentMessageDate = new Date(msg.data.createdAt).toDateString();
              const showDateSeparator = index === 0 || prevMessageDate !== currentMessageDate;

              const isCurrentUser = msg.data.sender?._id?.toString() === user?._id?.toString();

              return (
                <React.Fragment key={msg.data._id}>
                  {showDateSeparator && (
                    <div className="date-separator text-center my-3">
                      <span className="badge bg-dark text-white fw-normal px-2 py-1" style={{
                        fontSize: '12px',
                        fontWeight: 'normal',
                        opacity: '0.8',
                        borderRadius: '14px'
                      }}>
                        {formatLongDate(msg.data.createdAt)}
                      </span>
                    </div>
                  )}

                  <div className={`message mb-3 d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'}`}>
                    {!isCurrentUser && (
                      <div className="avatar me-2 align-self-top">
                        <div className="rounded-circle bg-success d-flex align-items-center justify-content-center"
                          style={{
                            width: '45px',
                            height: '45px',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            backgroundImage: otherUser?.profile
                              ? `url(${otherUser.profile})`
                              : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        >
                          {getUserName(otherUser)?.charAt(0)?.toUpperCase()}
                        </div>
                      </div>
                    )}

                    <div
                      className={`message-bubble p-3 position-relative ${isCurrentUser ?
                        'bg-light-green text-white' : 'bg-green text-dark'}`}
                      style={{
                        maxWidth: '65%',
                        minWidth: '300px',
                        boxShadow: '0 1px 0.5px rgba(0,0,0,0.13)',
                        borderRadius: isCurrentUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px'
                      }}
                    >
                      {msg.data.isDeletedBy?.length ? (
                        <div className="text-muted fst-italic">Message deleted</div>
                      ) : (
                        <>
                          <p className={`mb-2 ${isCurrentUser ? 'text-dark' : 'text-white'}`} style={{
                            fontSize: '18px',
                            lineHeight: '1.4',
                            wordBreak: 'break-word'
                          }}>
                            {msg.data.message}
                          </p>
                        </>
                      )}
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        {isCurrentUser && (
                          <span className="ms-2" style={{
                            color: isCurrentUser ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.5)',
                            lineHeight: 0
                          }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                            </svg>
                          </span>
                        )}
                      </div>
                      {isCurrentUser && !msg.data.isDeletedBy?.length && (
                        <button
                          className="btn-delete-message btn btn-sm position-absolute"
                          onClick={() => onDeleteMessage(msg.data._id)}
                          style={{
                            top: '8px',
                            right: '8px',
                            padding: '0 4px',
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: !isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)',
                            opacity: 0.7,
                            transition: 'opacity 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                          title="Delete message"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                            <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                          </svg>
                        </button>
                      )}
                      <small style={{
                        fontSize: '11px',
                        display:'flex',
                        justifyContent:"end",
                        fontSize:"12px",
                        marginBottom:"-12px",
                        color: !isCurrentUser ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'
                      }}>
                        {formatDate(msg.data.createdAt)}
                      </small>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {showScrollToBottom && (
            <button
              onClick={scrollToBottom}
              className="btn btn-secondary rounded-circle position-absolute"
              style={{
                right: '20px',
                bottom: '80px',
                width: '40px',
                height: '40px',
                zIndex: 2,
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}
              title="Scroll to bottom"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
          )}

          <div className="chat-input p-3 border-top bg-white d-flex align-items-center" style={{
            position: 'sticky',
            bottom: 0
          }}>
            <form onSubmit={handleSendMessage} className="flex-grow-1 d-flex align-items-center me-2">
              <input
                type="text"
                className="form-control py-2 px-3"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                style={{
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: '#f0f2f5',
                  fontSize: '15px'
                }}
              />
            </form>
            {messageInput.trim() ? (
              <button
                type="submit"
                onClick={handleSendMessage}
                className="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: '40px',
                  height: '40px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576 6.636 10.07Zm6.787-8.201L1.591 6.602l4.339 2.76 7.494-7.493Z"/>
                </svg>
              </button>
            ) : (
              <button className="btn btn-sm p-1 text-muted">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"/>
                  <path d="M8 6.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
                </svg>
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="d-flex flex-column align-items-center justify-content-center flex-grow-1 text-center p-4" style={{
          backgroundColor: '#f0f2f5',
        }}>
          <div className="mb-3" style={{ opacity: 0.3 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" fill="#54656f" viewBox="0 0 16 16">
              <path d="M16 8c0 3.866-3.582 7-8 7a9.06 9.06 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7zM5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0zm3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
          </div>
          <h5 className="text-muted mb-2">No conversation selected</h5>
          <p className="text-muted">Select a conversation or employee to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatArea;