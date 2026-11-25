import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { initSocketClient, getSocket } from '../services/socket.js';

const AuthContext = createContext(null);

export const ROLE_DEFINITIONS = {
  Owner: {
    name: 'Owner',
    badgeClass: 'role-Owner',
    color: '#f43f5e',
    title: 'Executive & Workspace Authority',
    tagline: 'Highest authority: workspace governance, roles, billing & deals',
    summary: 'Full executive control over workspace, all members, roles, pipelines, channels, and billing.',
    canDo: [
      'Manage workspace settings & rename organization',
      'Elevate and demote any member role',
      'Provision employee IT credentials directly',
      'Create and delete team discussion channels',
      'Full CRUD on all CRM deals, pipelines & categories',
      'Delete deals and audit logs',
      'Host and moderate WebRTC audio/video calls with screen sharing',
      'Manage billing and enterprise subscriptions',
    ],
    cannotDo: [],
  },
  Admin: {
    name: 'Admin',
    badgeClass: 'role-Admin',
    color: '#a855f7',
    title: 'Operations Director & Team Manager',
    tagline: 'Team onboarding, pipeline oversight & channel management',
    summary: 'Can invite members, manage channels, assign deals, and host meetings. Cannot demote the Owner.',
    canDo: [
      'Provision IT employee credentials & invite new members',
      'Create and manage public & private channels',
      'Create, edit, assign, and delete pipeline deals',
      'Track deal progress, checklist items, and SLAs',
      'Host WebRTC team conferences and screen shares',
      'Post comments and attach documents',
    ],
    cannotDo: [
      'Cannot delete the organization workspace',
      'Cannot alter enterprise billing or demote workspace Owner',
    ],
  },
  Editor: {
    name: 'Editor',
    badgeClass: 'role-Editor',
    color: '#3b82f6',
    title: 'Account Executive & Pipeline Contributor',
    tagline: 'Daily deal management, checklist execution & communication',
    summary: 'Can create and update deals, participate in channels, and join video syncs. Cannot delete deals.',
    canDo: [
      'Create and update CRM deals, categories, and stages',
      'Toggle checklist items and add deliverable subtasks',
      'Send channel messages and direct messages with emojis',
      'Join WebRTC conferences with camera, mic, and screen share',
      'Post activity notes, comments, and upload attachments',
    ],
    cannotDo: [
      'Cannot delete deals or pipeline records',
      'Cannot invite new members or change team roles',
      'Cannot delete channels',
    ],
  },
  Viewer: {
    name: 'Viewer',
    badgeClass: 'role-Viewer',
    color: '#10b981',
    title: 'Compliance Auditor & Observer',
    tagline: 'Read-only access for compliance, auditing & reporting',
    summary: 'Safe, read-only observer. Can review pipelines and export CSV data, but cannot modify anything.',
    canDo: [
      'View all CRM stages, deals, and records',
      'Read team channels and broadcast notices',
      'Export filtered deal ledgers to CSV',
      'Join WebRTC video conferences in listen-only mode',
    ],
    cannotDo: [
      'Cannot create, edit, or delete any deals',
      'Cannot post comments or send messages',
      'Cannot alter workspace configuration',
    ],
  },
};

const ROLE_PERMISSIONS = {
  Owner: [
    'WORKSPACE_MANAGE', 'WORKSPACE_DELETE', 'BILLING_MANAGE',
    'USER_MANAGE_ROLES', 'USER_INVITE', 'CHANNEL_CREATE',
    'CHANNEL_DELETE', 'CHANNEL_VIEW', 'TASK_CREATE', 'TASK_UPDATE',
    'TASK_DELETE', 'TASK_VIEW', 'COMMENT_POST', 'CALL_HOST', 'CALL_JOIN'
  ],
  Admin: [
    'USER_INVITE', 'CHANNEL_CREATE', 'CHANNEL_DELETE',
    'CHANNEL_VIEW', 'TASK_CREATE', 'TASK_UPDATE', 'TASK_DELETE',
    'TASK_VIEW', 'TASK_ASSIGN', 'COMMENT_POST', 'CALL_HOST', 'CALL_JOIN'
  ],
  Editor: [
    'USER_INVITE', 'CHANNEL_CREATE', 'CHANNEL_VIEW', 'TASK_CREATE', 'TASK_UPDATE',
    'TASK_DELETE', 'TASK_VIEW', 'COMMENT_POST', 'CALL_HOST', 'CALL_JOIN'
  ],
  Viewer: [
    'USER_INVITE', 'CHANNEL_CREATE', 'CHANNEL_VIEW', 'TASK_VIEW', 'COMMENT_POST', 'CALL_HOST', 'CALL_JOIN'
  ],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('devdrip_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('devdrip_token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setToken(storedToken);
            initSocketClient(res.user);
          } else {
            localStorage.removeItem('devdrip_token');
            setToken(null);
          }
        } catch {
          localStorage.removeItem('devdrip_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('devdrip_token', res.token);
      initSocketClient(res.user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success && res.token) {
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('devdrip_token', res.token);
      initSocketClient(res.user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('devdrip_token');
    setToken(null);
    setUser(null);
    const socket = getSocket();
    if (socket) socket.disconnect();
  };

  const changeStatus = async (status, statusMessage) => {
    try {
      const res = await api.updateStatus(status, statusMessage);
      if (res.success && res.user) {
        setUser((prev) => ({ ...prev, status, statusMessage }));
      }
    } catch (err) {
      console.error('Status update error:', err);
    }
  };

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;
    const permissions = ROLE_PERMISSIONS[user.role] || [];
    return permissions.includes(permission);
  };

  const canEditTasks = () => ['Owner', 'Admin', 'Editor'].includes(user?.role);
  const canDeleteTasks = () => ['Owner', 'Admin'].includes(user?.role);
  const canManageRoles = () => ['Owner'].includes(user?.role);
  const canInviteMembers = () => ['Owner', 'Admin'].includes(user?.role);
  const canCreateChannel = () => ['Owner', 'Admin', 'Editor'].includes(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        changeStatus,
        hasPermission,
        canEditTasks,
        canDeleteTasks,
        canManageRoles,
        canInviteMembers,
        canCreateChannel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
