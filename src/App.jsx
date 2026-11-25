import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { CallProvider } from './context/CallContext.jsx';
import { api } from './services/api.js';
import { getSocket } from './services/socket.js';

import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { ListView } from './components/ListView.jsx';
import { ChatView } from './components/ChatView.jsx';
import { CallRoomView } from './components/CallRoomView.jsx';
import { TeamView } from './components/TeamView.jsx';
import { AnalyticsView } from './components/AnalyticsView.jsx';

import { TaskModal } from './components/TaskModal.jsx';
import { InviteModal } from './components/InviteModal.jsx';
import { ChannelModal } from './components/ChannelModal.jsx';
import { ProvisionCredentialsModal } from './components/ProvisionCredentialsModal.jsx';
import { AuthPage } from './components/AuthPage.jsx';
import { IncomingCallModal } from './components/IncomingCallModal.jsx';
import { OutgoingCallModal } from './components/OutgoingCallModal.jsx';
import { MessageToast } from './components/MessageToast.jsx';


function LoadingScreen() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#060a14',
        color: '#f8fafc',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTopColor: '#6366f1',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#94a3b8' }}>
        Initializing Devdrip Enterprise Workspace...
      </span>
    </div>
  );
}


function MainApp() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [channels, setChannels] = useState([]);
  const [users, setUsers] = useState([]);
  const [healthInfo, setHealthInfo] = useState(null);
  const [customFields, setCustomFields] = useState([]);
  const [lifecycleStages, setLifecycleStages] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);

  const [currentView, setCurrentView] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isChannelModalOpen, setIsChannelModalOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [messageToast, setMessageToast] = useState(null);
  const [chatInitialTarget, setChatInitialTarget] = useState(null);

  const loadData = async () => {
    try {
      const [tasksRes, channelsRes, usersRes, healthRes, cfRes, lsRes] = await Promise.all([
        api.getTasks(),
        api.getChannels(),
        api.getUsers(),
        api.getHealth(),
        api.getCustomFields(),
        api.getLifecycleStages(),
      ]);

      if (tasksRes.success) setTasks(tasksRes.tasks || []);
      if (channelsRes.success) setChannels(channelsRes.channels || []);
      if (usersRes.success) setUsers(usersRes.users || []);
      if (healthRes) setHealthInfo(healthRes);
      if (cfRes?.success) setCustomFields(cfRes.customFields || []);
      if (lsRes?.success) setLifecycleStages(lsRes.stages || []);
    } catch (err) {
      console.error('Error fetching CRM data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const onTaskCreated = (t) => setTasks((prev) => [t, ...prev]);
    const onTaskUpdated = (t) => {
      setTasks((prev) => prev.map((x) => (x._id === t._id ? t : x)));
      if (selectedTask?._id === t._id) setSelectedTask(t);
    };
    const onTaskDeleted = ({ id }) => {
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (selectedTask?._id === id) {
        setIsTaskModalOpen(false);
        setSelectedTask(null);
      }
    };
    const onChannelCreated = (ch) => setChannels((prev) => [...prev, ch]);

    const onCustomFieldsUpdated = async () => {
      try {
        const res = await api.getCustomFields();
        if (res.success) setCustomFields(res.customFields || []);
      } catch (e) {}
    };

    const onLifecycleUpdated = async () => {
      try {
        const res = await api.getLifecycleStages();
        if (res.success) setLifecycleStages(res.stages || []);
      } catch (e) {}
    };

    const onNewMessage = (msg) => {
      const senderId = msg?.sender?._id || msg?.sender;
      if (senderId && senderId !== user?._id) {
        setMessageToast(msg);
      }
    };

    socket.on('task:created', onTaskCreated);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('channel:created', onChannelCreated);
    socket.on('customFields:updated', onCustomFieldsUpdated);
    socket.on('lifecycle:updated', onLifecycleUpdated);
    socket.on('message:new', onNewMessage);

    // Fallback polling for incoming messages / toasts on serverless hosts
    const pollToastTimer = setInterval(async () => {
      const s = getSocket();
      if (!s || !s.connected) {
        try {
          const res = await api.getRecentMessages();
          if (res.success && res.messages?.length > 0) {
            const latest = res.messages[0];
            const senderId = latest.sender?._id || latest.sender;
            if (senderId && senderId !== user?._id) {
              const diff = Date.now() - new Date(latest.createdAt).getTime();
              if (diff < 9000) {
                setMessageToast((prev) => (prev?._id === latest._id ? prev : latest));
              }
            }
          }
        } catch (e) {}
      }
    }, 3800);

    return () => {
      clearInterval(pollToastTimer);
      socket.off('task:created', onTaskCreated);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('channel:created', onChannelCreated);
      socket.off('customFields:updated', onCustomFieldsUpdated);
      socket.off('lifecycle:updated', onLifecycleUpdated);
      socket.off('message:new', onNewMessage);
    };
  }, [selectedTask]);

  const handleSaveTask = async (id, taskData) => {
    try {
      if (id) {
        const res = await api.updateTask(id, taskData);
        if (res.success && res.task) {
          setTasks((prev) => prev.map((t) => (t._id === id ? res.task : t)));
        }
      } else {
        const res = await api.createTask(taskData);
        if (res.success && res.task) {
          setTasks((prev) => [res.task, ...prev]);
        }
      }
    } catch (err) {
      alert(`Error saving task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      const res = await api.deleteTask(id);
      if (res.success) setTasks((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(`Error deleting task: ${err.message}`);
    }
  };

  const handleUpdateTaskStage = async (id, newStage) => {
    try {
      const res = await api.updateTask(id, { status: newStage });
      if (res.success && res.task) {
        setTasks((prev) => prev.map((t) => (t._id === id ? res.task : t)));
      }
    } catch (err) {
      alert(`Stage transition failed: ${err.message}`);
    }
  };

  const taskCountsByCategory = tasks.reduce((acc, t) => {
    const cat = t.listCategory || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    const lower = cat.toLowerCase();
    if (lower !== cat) {
      acc[lower] = (acc[lower] || 0) + 1;
    }
    return acc;
  }, {});

  return (
    <div className="app-container">
      <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
        <Navbar
          onOpenNewTask={() => {
            setSelectedTask(null);
            setIsTaskModalOpen(true);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onNavigate={(view) => setCurrentView(view)}
          onOpenProvisionModal={() => setIsProvisionModalOpen(true)}
        />

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            taskCountsByCategory={taskCountsByCategory}
            healthInfo={healthInfo}
            onCategoriesUpdated={setAvailableCategories}
          />

          <main className="main-wrapper">
            <div className="main-content">
              {currentView === 'list' && (
                <ListView
                  tasks={tasks}
                  onSelectTask={(task) => {
                    setSelectedTask(task);
                    setIsTaskModalOpen(true);
                  }}
                  onOpenNewTask={() => {
                    setSelectedTask(null);
                    setIsTaskModalOpen(true);
                  }}
                  onUpdateTaskStage={handleUpdateTaskStage}
                  onDeleteTask={handleDeleteTask}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  customFields={customFields}
                  onFieldsChanged={async () => {
                    const res = await api.getCustomFields();
                    if (res.success) setCustomFields(res.customFields || []);
                  }}
                  lifecycleStages={lifecycleStages}
                  onStagesChanged={async () => {
                    const res = await api.getLifecycleStages();
                    if (res.success) setLifecycleStages(res.stages || []);
                  }}
                />
              )}

              {currentView === 'chat' && (
                <ChatView
                  channels={channels}
                  users={users}
                  onOpenNewChannel={() => setIsChannelModalOpen(true)}
                  initialTarget={chatInitialTarget}
                />
              )}

              {currentView === 'calls' && <CallRoomView channels={channels} />}

              {currentView === 'team' && (
                <TeamView
                  users={users}
                  onRefreshUsers={loadData}
                  onOpenInviteModal={() => setIsInviteModalOpen(true)}
                  onOpenProvisionModal={() => setIsProvisionModalOpen(true)}
                />
              )}

              {currentView === 'analytics' && (
                <AnalyticsView
                  tasks={tasks}
                  users={users}
                  customFields={customFields}
                  lifecycleStages={lifecycleStages}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      <TaskModal
        task={selectedTask}
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setSelectedTask(null);
        }}
        onSaveTask={handleSaveTask}
        onDeleteTask={handleDeleteTask}
        users={users}
        categories={availableCategories}
        selectedCategory={selectedCategory}
        customFields={customFields}
        lifecycleStages={lifecycleStages}
      />

      <InviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onMemberInvited={loadData}
      />

      <ChannelModal
        isOpen={isChannelModalOpen}
        onClose={() => setIsChannelModalOpen(false)}
        onChannelCreated={loadData}
        users={users}
      />

      <ProvisionCredentialsModal
        isOpen={isProvisionModalOpen}
        onClose={() => setIsProvisionModalOpen(false)}
        onCredentialsCreated={loadData}
      />

      {/* Real-Time Call Popup Modals (1-on-1 Direct & Conference Ringing) */}
      <IncomingCallModal />
      <OutgoingCallModal />

      {/* Sliding Incoming Message Toast */}
      <MessageToast
        toast={messageToast}
        onClose={() => setMessageToast(null)}
        onNavigateToChat={(toastData) => {
          setCurrentView('chat');
          if (toastData?.channel) {
            setChatInitialTarget({ type: 'channel', id: toastData.channel });
          } else {
            const sid = toastData?.sender?._id || toastData?.sender;
            if (sid) {
              setChatInitialTarget({ type: 'dm', id: sid });
            }
          }
        }}
      />
    </div>
  );
}


function AppGate() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <AuthPage
        onAuthSuccess={() => {
          
        }}
      />
    );
  }

  return (
    <CallProvider>
      <MainApp />
    </CallProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppGate />
      </ThemeProvider>
    </AuthProvider>
  );
}
