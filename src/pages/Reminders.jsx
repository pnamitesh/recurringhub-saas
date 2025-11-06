import React, { useContext, useState } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { formatDateTime, calculateStatus } from '../utils/helpers';
import { Send, MessageCircle, Mail, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

function Reminders() {
  const { customers, reminders, addReminder } = useContext(DatabaseContext);
  
  const [reminderType, setReminderType] = useState('sms');
  const [template, setTemplate] = useState('Hi {NAME}, your {PLAN} plan fee of ₹{FEE} is due on {DUE_DATE}. Please pay to avoid service interruption.');
  const [savedTemplates, setSavedTemplates] = useState([
    { name: 'Payment Due', content: 'Hi {NAME}, your {PLAN} plan fee of ₹{FEE} is due on {DUE_DATE}.' },
    { name: 'Urgent Overdue', content: 'URGENT: Your payment of ₹{FEE} is overdue! Please pay immediately.' },
    { name: 'Friendly Reminder', content: 'Hi {NAME}, friendly reminder that your {PLAN} subscription fee is coming up soon!' },
    { name: 'Final Notice', content: '{NAME}, your account will be suspended if ₹{FEE} is not paid by {DUE_DATE}.' }
  ]);

  const sendReminder = async (customer) => {
    try {
      const message = template
        .replace('{NAME}', customer.name)
        .replace('{PLAN}', customer.plan)
        .replace('{FEE}', customer.monthlyFee)
        .replace('{DUE_DATE}', `${customer.dueDate}th`);

      addReminder({
        customerId: customer.id,
        customerName: customer.name,
        type: reminderType,
        message: message,
        reminderType: 'manual'
      });
    } catch (err) {
      toast.error('Error sending reminder: ' + err.message);
    }
  };

  const sendBulkReminders = async () => {
    const overdueCustomers = customers.filter(c => calculateStatus(c) === 'Overdue');
    
    if (overdueCustomers.length === 0) {
      toast.warning('No overdue customers found!');
      return;
    }

    if (window.confirm(`Send reminders to ${overdueCustomers.length} overdue customer(s)?`)) {
      let sent = 0;
      for (const customer of overdueCustomers) {
        try {
          await sendReminder(customer);
          sent++;
          await new Promise(r => setTimeout(r, 100));
        } catch (err) {
          console.error('Failed to send to ' + customer.name);
        }
      }
      toast.success(`Reminders sent to ${sent} customer(s)!`);
    }
  };

  const sendByPlan = async (planType) => {
    const planCustomers = customers.filter(c => c.plan === planType && c.status === 'active');
    
    if (planCustomers.length === 0) {
      toast.warning(`No active ${planType} customers found!`);
      return;
    }

    if (window.confirm(`Send reminders to ${planCustomers.length} ${planType} customers?`)) {
      let sent = 0;
      for (const customer of planCustomers) {
        try {
          await sendReminder(customer);
          sent++;
          await new Promise(r => setTimeout(r, 50));
        } catch (err) {
          console.error('Failed to send to ' + customer.name);
        }
      }
      toast.success(`Reminders sent to ${sent} ${planType} customers!`);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reminder Management</h1>

      {/* Reminder Configuration */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Reminder Configuration</h2>
        
        <div className="form-group mb-4">
          <label className="form-label">Reminder Type</label>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="sms"
                checked={reminderType === 'sms'}
                onChange={(e) => setReminderType(e.target.value)}
              />
              <MessageCircle size={20} className="text-blue-600" />
              <span>SMS</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="whatsapp"
                checked={reminderType === 'whatsapp'}
                onChange={(e) => setReminderType(e.target.value)}
              />
              <MessageCircle size={20} className="text-green-600" />
              <span>WhatsApp</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="email"
                checked={reminderType === 'email'}
                onChange={(e) => setReminderType(e.target.value)}
              />
              <Mail size={20} className="text-red-600" />
              <span>Email</span>
            </label>
          </div>
        </div>

        <div className="form-group mb-4">
          <label className="form-label">Saved Templates</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
            {savedTemplates.map((tmpl, idx) => (
              <button
                key={idx}
                className="btn btn-secondary btn-sm text-left text-xs"
                onClick={() => setTemplate(tmpl.content)}
              >
                {tmpl.name}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Message Template</label>
          <textarea
            className="form-textarea"
            rows="4"
            value={template}
            onChange={(e) => setTemplate(e.target.value)}
            placeholder="Use {NAME}, {PLAN}, {FEE}, {DUE_DATE} as placeholders"
          />
          <div className="text-sm text-gray-600 mt-2">
            Available placeholders: {'{NAME}'}, {'{PLAN}'}, {'{FEE}'}, {'{DUE_DATE}'}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-danger" onClick={sendBulkReminders}>
            <Send size={20} />
            Send to Overdue
          </button>
          <button className="btn btn-primary" onClick={() => sendByPlan('Premium')}>
            <Send size={20} />
            Premium Customers
          </button>
          <button className="btn btn-primary" onClick={() => sendByPlan('Standard')}>
            <Send size={20} />
            Standard Customers
          </button>
        </div>
      </div>

      {/* Send Individual Reminder */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Send Individual Reminder</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Fee</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td className="font-semibold">{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>{customer.plan}</td>
                  <td>₹{customer.monthlyFee}</td>
                  <td>
                    <span className={`badge ${calculateStatus(customer) === 'Overdue' ? 'badge-danger' : calculateStatus(customer) === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                      {calculateStatus(customer)}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={() => sendReminder(customer)}
                    >
                      <Send size={16} />
                      Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reminder History */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Reminder History ({reminders.length} Total)</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {reminders.length > 0 ? (
                reminders.slice().reverse().map(reminder => (
                  <tr key={reminder.id}>
                    <td className="text-sm">{formatDateTime(reminder.sentAt)}</td>
                    <td className="font-semibold">{reminder.customerName}</td>
                    <td>
                      <span className="badge badge-info">{reminder.type.toUpperCase()}</span>
                    </td>
                    <td className="text-sm max-w-xs truncate">{reminder.message}</td>
                    <td>
                      <span className="badge badge-success">{reminder.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    <AlertCircle size={32} className="mx-auto mb-2 opacity-50" />
                    No reminders sent yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reminders;

// ----------------------------------------------------