import React, { useState, useContext, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { SettingsProvider, SettingsContext } from './contexts/SettingsContext';

// Import Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Payments from './pages/Payments';
import Reminders from './pages/Reminders';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import PaymentSchedule from './pages/PaymentSchedule';
import CustomerProfiles from './pages/CustomerProfiles';
import BulkOperations from './pages/BulkOperations';

// Import Icons
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Bell, 
  FileText, 
  Settings as SettingsIcon,
  Menu,
  X,
  User,
  Calendar,
  BarChart3,
  Zap
} from 'lucide-react';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const { theme } = useContext(SettingsContext);

  useEffect(() => {
    if (theme) {
      document.body.classList.remove('light', 'dark');
      document.body.classList.add(theme);
    }
  }, [theme]);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/payments', icon: CreditCard, label: 'Payments' },
    { path: '/reminders', icon: Bell, label: 'Reminders' },
    { path: '/customer-profiles', icon: User, label: 'Profiles' },
    { path: '/payment-schedule', icon: Calendar, label: 'Schedule' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/bulk-operations', icon: Zap, label: 'Bulk Ops' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h1 className="sidebar-title">RecurringHub</h1>
          <button 
  className="sidebar-toggle"
  onClick={() => setSidebarOpen(!sidebarOpen)}
  style={{
    position: 'fixed',
    top: '15px',
    right: '15px',
    zIndex: 1001,
    background: '#0066CC',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    cursor: 'pointer',
    fontSize: '20px'
  }}
>
  {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
</button>

        </div>
        
        <nav className="sidebar-nav">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="sidebar-footer">
            <div className="business-info">
              <p className="business-name">Demo Business</p>
              <p className="business-type">Tuition Center</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/payment-schedule" element={<PaymentSchedule />} />
            <Route path="/customer-profiles" element={<CustomerProfiles />} />
            <Route path="/bulk-operations" element={<BulkOperations />} />
          </Routes>
        </div>
      </main>

      <ToastContainer 
        position="top-right" 
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DatabaseProvider>
        <NotificationProvider>
          <SettingsProvider>
            <Router>
              <AppContent />
            </Router>
          </SettingsProvider>
        </NotificationProvider>
      </DatabaseProvider>
    </AuthProvider>
  );
}

export default App;
