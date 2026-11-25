const BACKEND_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

const getHeaders = () => {
  const token = localStorage.getItem('devdrip_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (res) => {
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
  
    }
  }

  if (!res.ok) {
    const errorMsg = data?.message || (text && text.length < 200 ? text : null) || `API Error: ${res.status} (${res.statusText})`;
    throw new Error(errorMsg);
  }

  return data || {};
};

export const api = {

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(registerData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateStatus(status, statusMessage) {
    const res = await fetch(`${API_BASE}/auth/status`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ status, statusMessage }),
    });
    return handleResponse(res);
  },


  async getTasks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/tasks${query ? `?${query}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getTaskById(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createTask(taskData) {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(taskData),
    });
    return handleResponse(res);
  },

  async updateTask(id, updateData) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updateData),
    });
    return handleResponse(res);
  },

  async deleteTask(id) {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async addComment(taskId, text) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });
    return handleResponse(res);
  },

  async toggleSubtask(taskId, subtaskId) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/subtasks/${subtaskId}`, {
      method: 'PUT',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async addSubtask(taskId, title) {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/subtasks`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ title }),
    });
    return handleResponse(res);
  },

  // Workspace
  async getWorkspace() {
    const res = await fetch(`${API_BASE}/workspace`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateWorkspace(id, data) {
    const res = await fetch(`${API_BASE}/workspace/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async inviteMember(inviteData) {
    const res = await fetch(`${API_BASE}/workspace/invite`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(inviteData),
    });
    return handleResponse(res);
  },

  // Dynamic Sidebar Navigation Management
  async getSidebar() {
    const res = await fetch(`${API_BASE}/workspace/sidebar`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createSidebarSection(sectionData) {
    const res = await fetch(`${API_BASE}/workspace/sidebar/sections`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(sectionData),
    });
    return handleResponse(res);
  },

  async updateSidebarSection(id, sectionData) {
    const res = await fetch(`${API_BASE}/workspace/sidebar/sections/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(sectionData),
    });
    return handleResponse(res);
  },

  async deleteSidebarSection(id) {
    const res = await fetch(`${API_BASE}/workspace/sidebar/sections/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createSidebarTab(tabData) {
    const res = await fetch(`${API_BASE}/workspace/sidebar/tabs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(tabData),
    });
    return handleResponse(res);
  },

  async updateSidebarTab(id, tabData) {
    const res = await fetch(`${API_BASE}/workspace/sidebar/tabs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(tabData),
    });
    return handleResponse(res);
  },

  async updateSidebarTabPermissions(id, permissionsData) {
    const res = await fetch(`${API_BASE}/workspace/sidebar/tabs/${id}/permissions`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(permissionsData),
    });
    return handleResponse(res);
  },

  async deleteSidebarTab(id) {
    const res = await fetch(`${API_BASE}/workspace/sidebar/tabs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Users
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async updateUserRole(userId, role) {
    const res = await fetch(`${API_BASE}/users/role`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ userId, role }),
    });
    return handleResponse(res);
  },

  async createCredentials(credentialData) {
    const res = await fetch(`${API_BASE}/users/credentials`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentialData),
    });
    return handleResponse(res);
  },

  // Channels
  async getChannels() {
    const res = await fetch(`${API_BASE}/channels`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createChannel(channelData) {
    const res = await fetch(`${API_BASE}/channels`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(channelData),
    });
    return handleResponse(res);
  },

  async deleteChannel(id) {
    const res = await fetch(`${API_BASE}/channels/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Messages
  async getMessages(query = {}) {
    const searchParams = new URLSearchParams(query).toString();
    const res = await fetch(`${API_BASE}/messages${searchParams ? `?${searchParams}` : ''}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async sendMessage(msgData) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(msgData),
    });
    return handleResponse(res);
  },

  async reactToMessage(id, emoji) {
    const res = await fetch(`${API_BASE}/messages/${id}/react`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ emoji }),
    });
    return handleResponse(res);
  },


  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },


  async getCustomFields() {
    const res = await fetch(`${API_BASE}/custom-fields`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createCustomField(fieldData) {
    const res = await fetch(`${API_BASE}/custom-fields`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(fieldData),
    });
    return handleResponse(res);
  },

  async deleteCustomField(id) {
    const res = await fetch(`${API_BASE}/custom-fields/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Lifecycle Stages
  async getLifecycleStages() {
    const res = await fetch(`${API_BASE}/lifecycle-stages`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async createLifecycleStage(stageData) {
    const res = await fetch(`${API_BASE}/lifecycle-stages`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(stageData),
    });
    return handleResponse(res);
  },

  async deleteLifecycleStage(id) {
    const res = await fetch(`${API_BASE}/lifecycle-stages/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Calling & WebRTC Signaling
  async initiateCall(callData) {
    const res = await fetch(`${API_BASE}/calls/initiate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(callData),
    });
    return handleResponse(res);
  },

  async getIncomingCall() {
    const res = await fetch(`${API_BASE}/calls/incoming`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getCallStatus(callId) {
    const res = await fetch(`${API_BASE}/calls/${callId}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async respondToCall(callId, action, reason) {
    const res = await fetch(`${API_BASE}/calls/${callId}/respond`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ action, reason }),
    });
    return handleResponse(res);
  },

  async endCall(callId) {
    const res = await fetch(`${API_BASE}/calls/${callId}/end`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Recent messages for toasts & live polling
  async getRecentMessages(since) {
    const query = since ? `?since=${encodeURIComponent(since)}` : '';
    const res = await fetch(`${API_BASE}/messages/recent${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
};
