import React, { useContext, useState } from 'react'; // ← MAKE SURE THIS LINE EXISTS
import { DatabaseContext } from '../contexts/DatabaseContext'; // ← ADD THIS
import { SettingsContext } from '../contexts/SettingsContext'; // ← ADD THIS
import { Save, Trash2, RotateCcw, Download, Upload } from 'lucide-react';
import { toast } from 'react-toastify';

function Settings() {
  const { clearAllData, resetToSampleData, customers, payments, reminders } = useContext(DatabaseContext);
  const { theme, setTheme, businessName, setBusinessName, businessType, setBusinessType } = useContext(SettingsContext); // ← ADD THIS
  
  const [tempBusinessName, setTempBusinessName] = useState(businessName);
  const [tempBusinessType, setTempBusinessType] = useState(businessType);

  const handleSaveSettings = () => {
    setBusinessName(tempBusinessName);
    setBusinessType(tempBusinessType);
    toast.success('Settings saved successfully!');
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear ALL data? This cannot be undone!')) {
      clearAllData();
      toast.error('All data has been cleared!');
    }
  };

  const handleResetData = () => {
    if (window.confirm('Reset to sample data? This will replace your current data.')) {
      resetToSampleData();
      toast.success('Data reset to sample!');
    }
  };

  const handleExportBackup = () => {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        businessName,
        businessType,
        customers,
        payments,
        reminders
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_${new Date().toISOString().split('T')}.json`;
      link.click();
      
      toast.success('Backup downloaded successfully!');
    } catch (err) {
      toast.error('Error creating backup: ' + err.message);
    }
  };

  const handleRestoreBackup = (e) => {
    const file = e.target.files;
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const backup = JSON.parse(event.target.result);
        toast.success('Backup loaded! (Full restore feature coming soon)');
      } catch (err) {
        toast.error('Invalid backup file!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Business Information */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Business Information</h2>
        
        <div className="form-group">
          <label className="form-label">Business Name</label>
          <input
            type="text"
            className="form-input"
            value={tempBusinessName}
            onChange={(e) => setTempBusinessName(e.target.value)}
            placeholder="Your business name"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Business Type</label>
          <select
            className="form-select"
            value={tempBusinessType}
            onChange={(e) => setTempBusinessType(e.target.value)}
          >
            <option>Tuition Center</option>
            <option>Gym</option>
            <option>Yoga Studio</option>
            <option>Coaching Center</option>
            <option>Dance Studio</option>
            <option>Music School</option>
            <option>Sports Academy</option>
            <option>Other</option>
          </select>
        </div>

        <button className="btn btn-primary" onClick={handleSaveSettings}>
          <Save size={20} />
          Save Settings
        </button>
      </div>

     {/* Appearance */}
<div className="card mb-6">
  <h2 className="text-xl font-semibold mb-4">Appearance</h2>
  
  <div className="form-group">
    <label className="form-label">Theme</label>
    <div className="flex gap-4 flex-wrap">
      {/* Light Mode Button */}
      <label className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded" style={{
        borderColor: theme === 'light' ? '#0066CC' : '#CCCCCC',
        background: theme === 'light' ? '#EBF5FF' : '#F0F0F0'
      }}>
        <input
          type="radio"
          value="light"
          checked={theme === 'light'}
          onChange={(e) => setTheme(e.target.value)}
          className="cursor-pointer"
        />
        <span style={{ color: '#000000' }}>☀️ Light Mode</span>
      </label>

      {/* Dark Mode Button */}
      <label className="flex items-center gap-2 cursor-pointer p-3 border-2 rounded" style={{
        borderColor: theme === 'dark' ? '#0066CC' : '#CCCCCC',
        background: theme === 'dark' ? '#1B3A4D' : '#F0F0F0'  // ← FIXED
      }}>
        <input
          type="radio"
          value="dark"
          checked={theme === 'dark'}
          onChange={(e) => setTheme(e.target.value)}
          className="cursor-pointer"
        />
        <span style={{ color: theme === 'dark' ? '#FFFFFF' : '#000000' }}>🌙 Dark Mode</span>
      </label>
    </div>
  </div>

  <div className="mt-4 p-4 bg-blue-50 rounded">
    <p className="text-sm">
      {theme === 'light' 
        ? '☀️ Light mode is currently active' 
        : '🌙 Dark mode is currently active'}
    </p>
  </div>
</div>


      {/* Data Management */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        
        <div className="space-y-4">
          {/* Backup & Restore */}
          <div className="p-4 bg-blue-50 rounded">
            <h3 className="font-semibold mb-2">Backup & Restore</h3>
            <p className="text-sm text-gray-600 mb-3">
              Download your data as a backup or restore from a previous backup.
            </p>
            <div className="flex gap-2">
              <button className="btn btn-primary" onClick={handleExportBackup}>
                <Download size={20} />
                Download Backup
              </button>
              <label className="btn btn-secondary cursor-pointer">
                <Upload size={20} />
                Restore Backup
                <input type="file" accept=".json" onChange={handleRestoreBackup} className="hidden" />
              </label>
            </div>
          </div>

          {/* Sample Data */}
          <div className="p-4 bg-green-50 rounded">
            <h3 className="font-semibold mb-2">Sample Data</h3>
            <p className="text-sm text-gray-600 mb-3">
              Load sample customers, payments, and reminders for testing.
            </p>
            <button className="btn btn-secondary" onClick={handleResetData}>
              <RotateCcw size={20} />
              Reset to Sample Data
            </button>
          </div>

          {/* Danger Zone */}
          <div className="p-4 bg-red-50 rounded border-2 border-red-200">
            <h3 className="font-semibold mb-2 text-red-600">Danger Zone</h3>
            <p className="text-sm text-gray-600 mb-3">
              Clear all data from the application. This action cannot be undone!
            </p>
            <button className="btn btn-danger" onClick={handleClearData}>
              <Trash2 size={20} />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Database Statistics</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded text-center">
            <div className="text-2xl font-bold text-blue-600">{customers.length}</div>
            <div className="text-sm text-gray-600">Total Customers</div>
          </div>
          <div className="p-4 bg-gray-50 rounded text-center">
            <div className="text-2xl font-bold text-green-600">{payments.length}</div>
            <div className="text-sm text-gray-600">Total Payments</div>
          </div>
          <div className="p-4 bg-gray-50 rounded text-center">
            <div className="text-2xl font-bold text-purple-600">{reminders.length}</div>
            <div className="text-sm text-gray-600">Total Reminders</div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">About RecurringHub</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <p><strong>Version:</strong> 1.0.0 Production</p>
          <p><strong>Build:</strong> Complete</p>
          <p><strong>Technology:</strong> React 18 + Tailwind CSS + Firebase Mock</p>
          <p><strong>Storage:</strong> Browser LocalStorage</p>
          <p className="pt-4">
            RecurringHub is a comprehensive, production-ready solution for managing recurring payments,
            customer subscriptions, and billing for tuition centers, gyms, yoga studios, and similar businesses.
          </p>
          <p className="pt-2">
            <strong>Last Updated:</strong> {new Date().toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Settings; // ← MAKE SURE THIS LINE EXISTS AT THE END
