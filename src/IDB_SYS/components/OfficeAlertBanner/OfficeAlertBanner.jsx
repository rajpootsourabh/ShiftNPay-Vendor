import React, { useState, useEffect } from 'react';
import { Alert, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import './OfficeAlertBanner.css';

/**
 * OfficeAlertBanner Component
 * Displays a prominent alert banner at the top of the client profile page
 * when "Alert when accessing client data" is enabled for the client.
 * 
 * @param {Object} props
 * @param {boolean} props.alertOnAccess - Whether to show the alert (covidVaccinatedAlert field)
 * @param {string} props.alertMessage - The alert message to display (alertText field)
 * @param {boolean} props.dismissible - Whether the alert can be dismissed (default: true)
 * @param {string} props.clientName - Client's name for context
 */
const OfficeAlertBanner = ({ 
  alertOnAccess = false, 
  alertMessage = '', 
  dismissible = true,
  clientName = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Show alert when alertOnAccess is enabled and there's a message
  useEffect(() => {
    if (alertOnAccess && alertMessage && alertMessage.trim()) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [alertOnAccess, alertMessage]);

  // Don't render anything if alert is not enabled or no message
  if (!alertOnAccess || !alertMessage || !alertMessage.trim()) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <Collapse in={isVisible}>
      <div className="office-alert-banner-container">
        <Alert
          severity="warning"
          icon={<WarningAmberIcon fontSize="inherit" />}
          className="office-alert-banner"
          action={
            dismissible ? (
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={handleDismiss}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            ) : null
          }
          sx={{
            borderRadius: '0',
            fontSize: '1rem',
            fontWeight: 500,
            alignItems: 'center',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              padding: '4px 0',
              width: '100%'
            }
          }}
        >
          <div className="office-alert-content">
            {clientName && (
              <span className="office-alert-client-name">
                <strong>Client Alert - {clientName}:</strong>{' '}
              </span>
            )}
            <span className="office-alert-message">{alertMessage}</span>
          </div>
        </Alert>
      </div>
    </Collapse>
  );
};

export default OfficeAlertBanner;
