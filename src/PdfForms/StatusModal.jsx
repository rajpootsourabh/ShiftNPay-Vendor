import React, { useEffect } from 'react';

const StatusModal = ({ isOpen, onClose, type = 'success', title, message, duration = 2000 }) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '420px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isSuccess ? '#d1fae5' : '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          {isSuccess ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          )}
        </div>

        {/* Title */}
        {title && (
          <h3
            style={{
              margin: '0 0 8px',
              fontSize: '18px',
              fontWeight: '600',
              color: isSuccess ? '#065f46' : '#991b1b',
            }}
          >
            {title}
          </h3>
        )}

        {/* Message */}
        {message && (
          <p
            style={{
              margin: '0 0 20px',
              fontSize: '14px',
              color: '#6b7280',
              lineHeight: '1.5',
            }}
          >
            {message}
          </p>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            padding: '8px 24px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: isSuccess ? '#059669' : '#dc2626',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default StatusModal;
