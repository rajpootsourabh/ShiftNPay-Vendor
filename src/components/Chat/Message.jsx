import React from 'react';

const Message = ({ message, isSent, onDelete }) => {
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div
      className={`message ${isSent ? 'sent ms-auto' : 'received'} mb-3 p-2 rounded`}
      style={{ maxWidth: '60%' }}
    >
      {message.data.type === 'OFFER' ? (
        <div className="offer-message border p-2 rounded">
          <p className="mb-1"><strong>Offer</strong></p>
          <p className="mb-1">Quantity: {message.data.offerQuantity}</p>
          <p className="mb-1">Amount: ${message.data.offerAmount}</p>
          <p className="mb-1">Expires in: {message.daysLeft} days</p>
          <p className="mb-1">Status: {message.data.offerStatus}</p>
          {message.data.message && <p className="mb-0">{message.data.message}</p>}
        </div>
      ) : (
        <p className="mb-0">{message.message}</p>
      )}
      <small className="text-muted">{formatDate(message.data.createdAt)}</small>
      {isSent && (
        <button
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={onDelete}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default Message;