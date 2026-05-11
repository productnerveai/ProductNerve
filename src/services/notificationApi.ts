const API_BASE_URL = import.meta.env.VITE_API_URL;

class NotificationApiService {
  // Get user notifications
  static async getNotifications(page = 0, limit = 20, unreadOnly = false) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(unreadOnly && { unreadOnly: 'true' })
    });

    const response = await fetch(`${API_BASE_URL}/notifications?${params}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // Get unread notification count
  static async getUnreadCount() {
    const response = await fetch(`${API_BASE_URL}/notifications/unread-count`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // Mark notification as read
  static async markAsRead(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // Mark all notifications as read
  static async markAllAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // Delete notification
  static async deleteNotification(notificationId: string) {
    const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }
}

export default NotificationApiService;
