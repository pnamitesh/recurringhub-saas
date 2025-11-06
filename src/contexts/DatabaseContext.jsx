import React, { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export const DatabaseContext = createContext();

// Sample data for demo
const SAMPLE_CUSTOMERS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    phone: '9876543210',
    plan: 'Premium',
    monthlyFee: 5000,
    status: 'active',
    dueDate: 5,
    startDate: '2024-08-01',
    lastPaymentDate: '2025-11-01',
    createdAt: '2024-08-01'
  },
  {
    id: 2,
    name: 'Priya Singh',
    phone: '8765432109',
    plan: 'Standard',
    monthlyFee: 3500,
    status: 'active',
    dueDate: 15,
    startDate: '2024-09-15',
    lastPaymentDate: '2025-10-15',
    createdAt: '2024-09-15'
  },
  {
    id: 3,
    name: 'Amit Patel',
    phone: '7654321098',
    plan: 'Basic',
    monthlyFee: 2000,
    status: 'suspended',
    dueDate: 1,
    startDate: '2024-07-01',
    lastPaymentDate: '2025-08-20',
    createdAt: '2024-07-01'
  },
  {
    id: 4,
    name: 'Neha Verma',
    phone: '6543210987',
    plan: 'Premium',
    monthlyFee: 4500,
    status: 'active',
    dueDate: 20,
    startDate: '2024-10-01',
    lastPaymentDate: '2025-11-03',
    createdAt: '2024-10-01'
  },
  {
    id: 5,
    name: 'Vikram Joshi',
    phone: '9432109876',
    plan: 'Standard',
    monthlyFee: 3000,
    status: 'active',
    dueDate: 10,
    startDate: '2024-09-01',
    lastPaymentDate: '2025-11-02',
    createdAt: '2024-09-01'
  }
];

const SAMPLE_PAYMENTS = [
  {
    id: 1,
    customerId: 1,
    customerName: 'Rajesh Kumar',
    amount: 5000,
    date: '2025-11-01',
    method: 'UPI',
    status: 'completed',
    referenceId: 'TXN001',
    createdAt: '2025-11-01'
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Priya Singh',
    amount: 3500,
    date: '2025-11-02',
    method: 'Bank Transfer',
    status: 'completed',
    referenceId: 'TXN002',
    createdAt: '2025-11-02'
  },
  {
    id: 3,
    customerId: 4,
    customerName: 'Neha Verma',
    amount: 4500,
    date: '2025-11-03',
    method: 'UPI',
    status: 'completed',
    referenceId: 'TXN003',
    createdAt: '2025-11-03'
  },
  {
    id: 4,
    customerId: 5,
    customerName: 'Vikram Joshi',
    amount: 3000,
    date: '2025-11-02',
    method: 'Cash',
    status: 'completed',
    referenceId: 'TXN004',
    createdAt: '2025-11-02'
  }
];

const SAMPLE_REMINDERS = [
  {
    id: 1,
    customerId: 2,
    customerName: 'Priya Singh',
    type: 'sms',
    message: 'Hi Priya Singh, your Standard plan fee of ₹3,500 is due on 15th.',
    status: 'sent',
    sentAt: '2025-11-04T10:30:00',
    reminderType: 'due'
  }
];

export function DatabaseProvider({ children }) {
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load data from localStorage or use sample data
  useEffect(() => {
    const savedCustomers = localStorage.getItem('recurringHub_customers');
    const savedPayments = localStorage.getItem('recurringHub_payments');
    const savedReminders = localStorage.getItem('recurringHub_reminders');

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers));
    } else {
      setCustomers(SAMPLE_CUSTOMERS);
      localStorage.setItem('recurringHub_customers', JSON.stringify(SAMPLE_CUSTOMERS));
    }

    if (savedPayments) {
      setPayments(JSON.parse(savedPayments));
    } else {
      setPayments(SAMPLE_PAYMENTS);
      localStorage.setItem('recurringHub_payments', JSON.stringify(SAMPLE_PAYMENTS));
    }

    if (savedReminders) {
      setReminders(JSON.parse(savedReminders));
    } else {
      setReminders(SAMPLE_REMINDERS);
      localStorage.setItem('recurringHub_reminders', JSON.stringify(SAMPLE_REMINDERS));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (customers.length > 0) {
      localStorage.setItem('recurringHub_customers', JSON.stringify(customers));
    }
  }, [customers]);

  useEffect(() => {
    if (payments.length > 0) {
      localStorage.setItem('recurringHub_payments', JSON.stringify(payments));
    }
  }, [payments]);

  useEffect(() => {
    if (reminders.length > 0) {
      localStorage.setItem('recurringHub_reminders', JSON.stringify(reminders));
    }
  }, [reminders]);

  // Customer operations
  const addCustomer = (customerData) => {
    const newCustomer = {
      ...customerData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setCustomers([...customers, newCustomer]);
    toast.success(`Customer ${customerData.name} added successfully!`);
    return newCustomer;
  };

  const updateCustomer = (id, updates) => {
    setCustomers(customers.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    ));
    toast.success('Customer updated successfully!');
  };

  const deleteCustomer = (id) => {
    const customer = customers.find(c => c.id === id);
    setCustomers(customers.filter(c => c.id !== id));
    toast.success(`Customer ${customer?.name} deleted successfully!`);
  };

  // Payment operations
  const addPayment = (paymentData) => {
    const customer = customers.find(c => c.id === parseInt(paymentData.customerId));
    const newPayment = {
      ...paymentData,
      id: Date.now(),
      customerName: customer?.name || 'Unknown',
      createdAt: new Date().toISOString()
    };
    setPayments([...payments, newPayment]);
    
    // Update customer's last payment date
    if (customer) {
      updateCustomer(customer.id, { lastPaymentDate: paymentData.date });
    }
    
    toast.success('Payment recorded successfully!');
    return newPayment;
  };

  const updatePayment = (id, updates) => {
    setPayments(payments.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
    toast.success('Payment updated successfully!');
  };

  const deletePayment = (id) => {
    setPayments(payments.filter(p => p.id !== id));
    toast.success('Payment deleted successfully!');
  };

  // Reminder operations
  const addReminder = (reminderData) => {
    const newReminder = {
      ...reminderData,
      id: Date.now(),
      sentAt: new Date().toISOString(),
      status: 'sent'
    };
    setReminders([...reminders, newReminder]);
    toast.success(`Reminder sent to ${reminderData.customerName}!`);
    return newReminder;
  };

  // Clear all data
  const clearAllData = () => {
    setCustomers([]);
    setPayments([]);
    setReminders([]);
    localStorage.removeItem('recurringHub_customers');
    localStorage.removeItem('recurringHub_payments');
    localStorage.removeItem('recurringHub_reminders');
    toast.success('All data cleared!');
  };

  // Reset to sample data
  const resetToSampleData = () => {
    setCustomers(SAMPLE_CUSTOMERS);
    setPayments(SAMPLE_PAYMENTS);
    setReminders(SAMPLE_REMINDERS);
    localStorage.setItem('recurringHub_customers', JSON.stringify(SAMPLE_CUSTOMERS));
    localStorage.setItem('recurringHub_payments', JSON.stringify(SAMPLE_PAYMENTS));
    localStorage.setItem('recurringHub_reminders', JSON.stringify(SAMPLE_REMINDERS));
    toast.success('Data reset to sample!');
  };

  const value = {
    customers,
    setCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    
    payments,
    setPayments,
    addPayment,
    updatePayment,
    deletePayment,
    
    reminders,
    setReminders,
    addReminder,
    
    loading,
    setLoading,
    
    clearAllData,
    resetToSampleData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
}
