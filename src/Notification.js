import React, { useState, useEffect } from 'react';
import { Menu, MenuItem, Box} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function NotificationMenu({ open, onClose, initial_notifications, anchorEl, handleNotificationClick }) {
  const [notifications, setNotifications] = useState([]);
  const [USER_ID, setUserID] = useState(sessionStorage.getItem('USER_ID'));
  const [SERVERPORT, setServerPort] = useState(sessionStorage.getItem('SERVERPORT'));

  useEffect(() => {
    const fetchPointChanges = async () =>{
        fetch(`https://team27-express.cpsc4911.com/point_change?USER_ID=${USER_ID}`)
        .then(response => response.json())
          .then(data => {
            setNotifications(data);
          })
          .catch(error => {
            console.error('Error fetching sponsors:', error);
          });
        }
        fetchPointChanges();        
  }, []);

  useEffect(() => {
    if (initial_notifications) {
      setNotifications(initial_notifications);
    }
  }, [initial_notifications]);

    function getTimeSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMilliseconds = now - date;

    const diffSeconds = Math.floor(diffMilliseconds / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `${diffDays} day(s) ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour(s) ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute(s) ago`;
    } else {
        return `${diffSeconds} second(s) ago`;
    }
    }

  return (
    <Menu
  id="notification-menu"
  anchorEl={anchorEl}
  open={open}
  onClose={onClose}
  PaperProps={{
    style: {
      width: '300px', // Adjust the width as needed
    },
  }}
>
  <MenuItem style={{ fontSize: 'larger', padding: '16px 24px' }}>
    <strong>Notifications</strong>
  </MenuItem>
  {notifications
    .slice() // Create a copy of notifications to avoid mutating the original array
    .sort((a, b) => new Date(b.AUDIT_DATE) - new Date(a.AUDIT_DATE)) // Sort by the time of the notification
    .slice(0, 5) // Take only the first 5 notifications
    .map((notification, index) => (
      <div key={index}>
        <MenuItem onClick={handleNotificationClick} style={{ padding: '16px 24px' }}>
          <Box>
            <div>
              <strong>Point Update</strong>
            </div>
            <div>
              <span style={{ fontStyle: 'italic', fontSize: 'smaller' }}>
                Sponsor ID: {notification.AUDIT_SPONSOR} - {getTimeSince(notification.AUDIT_DATE)}
              </span>
            </div>
            <div>
              <strong>Point Total:</strong> {notification.AUDIT_POINTS}
            </div>
          </Box>
        </MenuItem>
        {index !== notifications.length - 1 && <MenuItem divider />}
      </div>
    ))}
</Menu>
  );
}
