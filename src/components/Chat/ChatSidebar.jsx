import React from 'react';
import { getUserName } from '../../Helper/functions';

const ChatSidebar = ({
  combinedList,
  onlineUsers,
  currentUserId,
  onSelectConversation,
  onArchiveChat,
  onDeleteChat
}) => {
  const formatTimeAgo = (date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInSeconds = Math.floor((now - messageDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hr ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} day ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} wk ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} mo ago`;
    return `${Math.floor(diffInSeconds / 31536000)} yr ago`;
  };
  console.log(combinedList , " combinedList")
  return (
    <div className="sidebar p-0" style={{ 
      width: '360px', 
      height: '80vh',
      overflowY: 'auto',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #e9ecef'
    }}>
      {/* Header */}
      <div className="p-3 sticky-top bg-light" style={{
        backgroundColor: '#f0f2f5',
        borderBottom: '1px solid #e9ecef'
      }}>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Chats</h5>
          <div className="d-flex">
            <button className="btn btn-sm p-1 me-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#54656f" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
            </button>
            <button className="btn btn-sm p-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="#54656f" viewBox="0 0 16 16">
                <path d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-bottom">
        <div className="input-group rounded-pill" style={{ backgroundColor: '#f0f2f5' }}>
          <span className="input-group-text border-0 bg-transparent">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#54656f" viewBox="0 0 16 16">
              <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
            </svg>
          </span>
          <input 
            type="text" 
            className="form-control border-0 bg-transparent" 
            placeholder="Search or start new chat"
            style={{ boxShadow: 'none' }}
          />
        </div>
      </div>

      {/* Chat List */}
      {combinedList.length === 0 ? (
        <div className="p-4 text-center text-muted">
          <p>No conversations found</p>
        </div>
      ) : (
        <div className="list-group list-group-flush">
          {combinedList.map((item) => {
            if (item.type === 'conversation') {
              const conv = item.data;
              const otherMember = conv.members.find(
                (member) => member._id.toString() !== currentUserId
              );

              return (
                <div
                  key={conv._id}
                  className="list-group-item list-group-item-action p-3 border-0 border-bottom"
                  onClick={() => onSelectConversation(item)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderBottom: '1px solid #f5f6f6',
                    backgroundColor: item.isSelected ? '#f5f6f6' : 'inherit'
                  }}
                >
                  <div className="d-flex align-items-center">
                    {/* Profile Picture */}
                    <div className="position-relative me-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center" 
                        style={{
                          width: '49px',
                          height: '49px',
                          backgroundColor: '#dfe5e7',
                          color: '#54656f',
                          fontSize: '20px',
                          fontWeight: '500',
                          overflow: 'hidden'
                        }}
                      >
                        {otherMember?.profilePic ? (
                          <img 
                            src={otherMember.profilePic} 
                            alt={getUserName(otherMember)} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          getUserName(otherMember)?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div 
                        className={`position-absolute bottom-0 end-0 rounded-circle border border-2 ${onlineUsers[otherMember?._id.toString()] ? 'bg-success' : 'bg-secondary'}`}
                        style={{ 
                          width: '12px', 
                          height: '12px',
                          borderColor: '#ffffff !important'
                        }}
                      ></div>
                    </div>
                    
                    {/* Chat Info */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 className="mb-0 fw-bold" style={{ color: '#111b21' }}>
                          {getUserName(otherMember) || 'Unknown'}
                        </h6>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {conv.latestMessage && formatTimeAgo(conv.latestMessage.createdAt)}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <p className="mb-0 text-truncate" style={{ 
                          fontSize: '0.875rem',
                          color: '#667781',
                          maxWidth: '220px'
                        }}>
                          {conv.latestMessage
                            ? conv.latestMessage.isDeletedBy?.length
                              ? 'Message deleted'
                              : conv.latestMessage.message || 'Offer message'
                            : 'No messages'}
                        </p>
                        {conv.unseenCount > 0 && (
                          <span className="badge rounded-pill bg-primary" style={{
                            backgroundColor: '#25d366',
                            color: 'white',
                            fontSize: '0.6875rem',
                            padding: '2px 5px',
                            minWidth: '20px'
                          }}>
                            {conv.unseenCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            } else {
              const employee = item.data;
              console.log('employee',employee)
              return (
                <div
                  key={employee._id}
                  className="list-group-item list-group-item-action p-3 border-0 border-bottom"
                  onClick={() => onSelectConversation(item)}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    borderBottom: '1px solid #f5f6f6'
                  }}
                >
                  <div className="d-flex align-items-center">
                    {/* Profile Picture */}
                    <div className="position-relative me-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center" 
                        style={{
                          width: '49px',
                          height: '49px',
                          backgroundColor: '#dfe5e7',
                          color: '#54656f',
                          fontSize: '20px',
                          fontWeight: '500',
                          overflow: 'hidden'
                        }}
                      >
                        {employee?.profilePic ? (
                          <img 
                            src={employee.profilePic} 
                            alt={getUserName(employee)} 
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          getUserName(employee)?.charAt(0)?.toUpperCase() || 'U'
                        )}
                      </div>
                      <div 
                        className={`position-absolute bottom-0 end-0 rounded-circle border border-2 ${onlineUsers[employee._id.toString()] ? 'bg-success' : 'bg-secondary'}`}
                        style={{ 
                          width: '12px', 
                          height: '12px',
                          borderColor: '#ffffff !important'
                        }}
                      ></div>
                    </div>
                    
                    {/* User Info */}
                    <div className="flex-grow-1">
                      <h6 className="mb-0 fw-bold" style={{ color: '#111b21' }}>
                        {getUserName(employee)}
                      </h6>
                      <small className={`text-${onlineUsers[employee._id.toString()] ? 'success' : 'muted'}`} style={{ fontSize: '0.8125rem' }}>
                        {onlineUsers[employee._id.toString()] ? 'Online' : 'Offline'}
                      </small>
                    </div>
                  </div>
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
};

export default ChatSidebar;