// Application Constants

export const BUSINESS_TYPES = ['Tuition', 'Gym', 'Yoga Studio', 'Coaching Center'];

export const PLANS = ['Premium', 'Standard', 'Basic'];

export const PAYMENT_METHODS = ['UPI', 'Bank Transfer', 'Cash', 'Card'];

export const REMINDER_TYPES = ['SMS', 'WhatsApp', 'Email'];

export const COLORS = {
  primary: '#0066CC',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  light: '#F8F9FA',
  dark: '#2C3E50',
};

export const SAMPLE_CUSTOMERS = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    phone: '9876543210',
    plan: 'Premium',
    monthlyFee: 5000,
    status: 'active',
    dueDate: '5th'
  },
  {
    id: 2,
    name: 'Priya Singh',
    phone: '8765432109',
    plan: 'Standard',
    monthlyFee: 3500,
    status: 'active',
    dueDate: '15th'
  },
];

export const SAMPLE_PAYMENTS = [
  {
    id: 1,
    customerId: 1,
    amount: 5000,
    date: '2025-11-01',
    method: 'UPI',
    status: 'completed'
  },
  {
    id: 2,
    customerId: 2,
    amount: 3500,
    date: '2025-11-02',
    method: 'Bank Transfer',
    status: 'completed'
  },
];

export default {
  BUSINESS_TYPES,
  PLANS,
  PAYMENT_METHODS,
  REMINDER_TYPES,
  COLORS,
  SAMPLE_CUSTOMERS,
  SAMPLE_PAYMENTS,
};
