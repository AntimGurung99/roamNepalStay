import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaBell } from "react-icons/fa";
import { notificationsAPI } from "../api/axios";
import "../styles/NotificationBell.css";

function NotificationBell({
  scope = "guest",
  title = "Notifications",
  viewAllPath = "/notifications",
}) {
  const navigate = useNavigate();
  const notificationRef = useRef(null);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      if (!localStorage.getItem("access")) return;

      const res = await notificationsAPI.getNotifications({
        limit: 10,
        scope,
      });

      setNotifications(res.data.results || []);
      setUnreadCount(res.data.unread_count || 0);
    } catch (err) {
      console.error(`Failed to fetch ${scope} notifications`, err);
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [scope]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.is_read) {
        await notificationsAPI.markAsRead(notification.id);
      }

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id ? { ...item, is_read: true } : item
        )
      );

      if (!notification.is_read) {
        setUnreadCount((prev) => Math.max(prev - 1, 0));
      }

      setNotificationsOpen(false);

      const targetUrl = notification?.data?.url;
      if (targetUrl) {
        navigate(targetUrl);
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllAsRead({ scope });

      setNotifications((prev) =>
        prev.map((item) => ({ ...item, is_read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read", error);
    }
  };

  return (
    <div className="nav__notifications" ref={notificationRef}>
      <button
        className="nav__bellBtn"
        type="button"
        onClick={() => setNotificationsOpen((prev) => !prev)}
        aria-label={`Open ${scope} notifications`}
        aria-expanded={notificationsOpen}
      >
        <FaBell />
        {unreadCount > 0 && (
          <span className="nav__bellBadge">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {notificationsOpen && (
        <div className="nav__notificationDropdown">
          <div className="nav__notificationHeader">
            <h3>{title}</h3>
            {notifications.length > 0 && (
              <button
                type="button"
                className="nav__markAllReadBtn"
                onClick={handleMarkAllRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="nav__notificationList">
            {notifications.length === 0 ? (
              <div className="nav__notificationEmpty">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`nav__notificationItem ${
                    notification.is_read ? "is-read" : "is-unread"
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="nav__notificationTitle">
                    {notification.title}
                  </div>
                  <div className="nav__notificationMessage">
                    {notification.message}
                  </div>
                  <div className="nav__notificationMeta">
                    {new Date(notification.created_at).toLocaleString()}
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="nav__notificationFooter">
            <button
              type="button"
              className="nav__viewAllBtn"
              onClick={() => {
                setNotificationsOpen(false);
                navigate(viewAllPath);
              }}
            >
              View all
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;