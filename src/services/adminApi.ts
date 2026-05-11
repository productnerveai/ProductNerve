const API_BASE_URL = import.meta.env.VITE_API_URL;

// Admin API service for all admin dashboard functionality

class AdminApiService {
  // Authentication
  static async getAdminProfile() {
    const response = await fetch(`${API_BASE_URL}/admin/me`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // Analytics
  static async getPlatformAnalytics(timeRange = '30d') {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/platform?timeRange=${timeRange}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getProductAnalytics(timeRange = '30d') {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/product?timeRange=${timeRange}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getGrowthAnalytics(timeRange = '30d') {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/growth?timeRange=${timeRange}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getStudioAnalytics() {
    const response = await fetch(`${API_BASE_URL}/admin/analytics/studio`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // User Management
  static async getAllUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    plan?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/users?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getUserById(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getUsersByIds(userIds: string[]) {
    const response = await fetch(`${API_BASE_URL}/admin/users/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ userIds })
    });
    return response.json();
  }

  static async updateUserStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  static async updateUserSubscription(id: string, subscriptionData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/subscription`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(subscriptionData)
    });
    return response.json();
  }

  static async grantTemporaryAccess(id: string, accessType: string, durationDays: number) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/grant-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ access_type: accessType, duration_days: durationDays })
    });
    return response.json();
  }

  static async deleteUser(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async promoteToAdmin(id: string, adminRole: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/promote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ admin_role: adminRole })
    });
    return response.json();
  }

  static async demoteFromAdmin(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/demote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }

  // Workspace Management
  static async getAllWorkspaces(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/workspaces?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getWorkspaceById(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/workspaces/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async updateWorkspaceStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/admin/workspaces/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  static async deleteWorkspace(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/workspaces/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // Project Management
  static async getAllProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    phase?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/projects?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getUserProjects(userId: string) {
    const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/projects`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getProjectById(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getProjectStats() {
    const response = await fetch(`${API_BASE_URL}/admin/projects/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async updateProjectStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  static async deleteProject(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/projects/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // KYC Management
  static async getAllKycSubmissions(params: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/kyc?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getKycById(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/kyc/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async approveKyc(id: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/kyc/${id}/approve`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ notes: notes || '' })
    });
    return response.json();
  }

  static async rejectKyc(id: string, notes: string) {
    const response = await fetch(`${API_BASE_URL}/admin/kyc/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ notes })
    });
    return response.json();
  }

  // Billing Management
  static async getBillingOverview(timeRange = '30d') {
    const response = await fetch(`${API_BASE_URL}/admin/billing/overview?timeRange=${timeRange}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getBillingTransactions(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/billing/transactions?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async grantSubscriptionAccess(userId: string, planType: string, durationDays: number, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/billing/grant-access`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        userId,
        plan_type: planType,
        duration_days: durationDays,
        notes: notes || ''
      })
    });
    return response.json();
  }

  // Contact Center
  static async getAllTickets(params: {
    page?: number;
    limit?: number;
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/contacts/tickets?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getTicketById(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/contacts/tickets/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getTicketStats() {
    const response = await fetch(`${API_BASE_URL}/admin/contacts/tickets/stats`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async createTicket(ticketData: {
    title: string;
    description: string;
    feedback_type?: string;
    priority?: string;
    user_email?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/contacts/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(ticketData)
    });
    return response.json();
  }

  static async updateTicketStatus(id: string, status: string) {
    const response = await fetch(`${API_BASE_URL}/admin/contacts/tickets/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });
    return response.json();
  }

  static async replyToTicket(id: string, message: string) {
    const response = await fetch(`${API_BASE_URL}/admin/contacts/tickets/${id}/reply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ message })
    });
    return response.json();
  }

  static async deleteTicket(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/contacts/tickets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // Content Management
  static async getAllBlogPosts(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/content/blog-posts?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getBlogPostById(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/content/blog-posts/${id}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async createBlogPost(postData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/content/blog-posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(postData)
    });
    return response.json();
  }

  static async updateBlogPost(id: string, postData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/content/blog-posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(postData)
    });
    return response.json();
  }

  static async publishBlogPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/content/blog-posts/${id}/publish`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async deleteBlogPost(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/content/blog-posts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // System Settings
  static async getSystemSettings() {
    const response = await fetch(`${API_BASE_URL}/admin/settings`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async updateSystemSetting(key: string, value: any, description?: string) {
    const response = await fetch(`${API_BASE_URL}/admin/settings/${key}`, {
      method: 'PUT',
      headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ value, description })
    });
    return response.json();
  }

  // Communication Center
  static async getAllBroadcasts() {
    const response = await fetch(`${API_BASE_URL}/admin/communications/broadcasts`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async createBroadcast(broadcastData: {
    title: string;
    message: string;
    channel: string;
    target_group: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/admin/communications/broadcasts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(broadcastData)
    });
    return response.json();
  }

  static async getAllNotifications(params: {
    page?: number;
    limit?: number;
    type?: string;
    read?: boolean;
    include_archived?: boolean;
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/communications/notifications${queryParams ? '?' + queryParams : ''}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async resendNotification(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/communications/notifications/${id}/resend`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async archiveNotification(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/communications/notifications/${id}/archive`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async unarchiveNotification(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/communications/notifications/${id}/unarchive`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async deleteNotification(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/communications/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // Security Audit
  static async getSecurityLogs() {
    const response = await fetch(`${API_BASE_URL}/admin/security/logs`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getAuditLogs() {
    const response = await fetch(`${API_BASE_URL}/admin/audit/logs`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getSuspendedUsers() {
    const response = await fetch(`${API_BASE_URL}/admin/users?status=suspended`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  // Studio Activity
  static async getStudioActivity() {
    const response = await fetch(`${API_BASE_URL}/admin/studio/activity`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getStudioAIMonitoring() {
    const response = await fetch(`${API_BASE_URL}/admin/studio/ai-monitoring`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getStudioContent() {
    const response = await fetch(`${API_BASE_URL}/admin/studio/content`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getStudioModeration() {
    const response = await fetch(`${API_BASE_URL}/admin/studio/moderation`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async deleteStudioContent(toolType: string, id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/studio/${toolType}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async getAllPages(params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams(params as any).toString();
    const response = await fetch(`${API_BASE_URL}/admin/content/pages?${queryParams}`, {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  }

  static async createPage(pageData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/content/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(pageData)
    });
    return response.json();
  }

  static async updatePage(id: string, pageData: any) {
    const response = await fetch(`${API_BASE_URL}/admin/content/pages/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(pageData)
    });
    return response.json();
  }

  static async deletePage(id: string) {
    const response = await fetch(`${API_BASE_URL}/admin/content/pages/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    return response.json();
  } 
}

export default AdminApiService;
