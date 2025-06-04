"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import {
  createAuthClient, // Import createAuthClient
  GET_USER_NOTIFICATIONS,
  GET_UNREAD_NOTIFICATIONS_COUNT,
  MARK_NOTIFICATION_AS_READ,
  MARK_ALL_NOTIFICATIONS_AS_READ,
} from "../graphql-client";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  product_id?: string;
  seller_id?: string;
  product?: { id: string; name: string; image_url?: string };
  seller?: { id: string; name: string };
}

export function useNotifications() {
  const { user, token } = useAuth(); // Get token from useAuth
  console.log("useNotifications - Auth User:", user, "Token:", token);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async (limit = 10, offset = 0) => {
    if (!user?.id || !token) {
      console.log("fetchNotifications - No user or token");
      setError("User not authenticated");
      return;
    }
    try {
      console.log("Fetching notifications for userId:", user.id);
      const client = createAuthClient(token); // Use createAuthClient
      const data = await client.request(GET_USER_NOTIFICATIONS, {
        userId: user.id,
        limit,
        offset,
      });
      console.log("Fetched Notifications:", data.notifications);
      setNotifications(data.notifications);
      setError(null);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setError("Failed to fetch notifications");
    }
  };

  const fetchUnreadCount = async () => {
    if (!user?.id || !token) {
      console.log("fetchUnreadCount - No user or token");
      setError("User not authenticated");
      return;
    }
    try {
      console.log("Fetching unread count for userId:", user.id);
      const client = createAuthClient(token); // Use createAuthClient
      const data = await client.request(GET_UNREAD_NOTIFICATIONS_COUNT, {
        userId: user.id,
      });
      console.log("Unread Count:", data.notifications_aggregate.aggregate.count);
      setUnreadCount(data.notifications_aggregate.aggregate.count);
      setError(null);
    } catch (error) {
      console.error("Error fetching unread count:", error);
      setError("Failed to fetch unread count");
    }
  };

  const markAsRead = async (notificationId: string) => {
    if (!token) {
      console.log("markAsRead - No token");
      return;
    }
    try {
      const client = createAuthClient(token); // Use createAuthClient
      await client.request(MARK_NOTIFICATION_AS_READ, { notificationId });
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === notificationId ? { ...notif, is_read: true } : notif)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.id || !token) {
      console.log("markAllAsRead - No user or token");
      return;
    }
    try {
      const client = createAuthClient(token); // Use createAuthClient
      await client.request(MARK_ALL_NOTIFICATIONS_AS_READ, { userId: user.id });
      setNotifications((prev) => prev.map((notif) => ({ ...notif, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    console.log("useNotifications useEffect - User:", user, "Token:", token);
    if (user?.id && token) {
      fetchNotifications();
      fetchUnreadCount();
      setLoading(false);
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      return () => clearInterval(interval);
    } else {
      setLoading(false);
      setError("User not authenticated");
    }
  }, [user?.id, token]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    refetch: () => {
      fetchNotifications();
      fetchUnreadCount();
    },
  };
}