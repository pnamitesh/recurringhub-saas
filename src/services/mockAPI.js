// Mock API Service

export const mockAPI = {
  // Simulate API delay
  delay: (ms = 300) => new Promise(r => setTimeout(r, ms)),

  // Authentication
  login: async (email, password) => {
    await mockAPI.delay(300);
    return {
      success: true,
      user: { id: 1, email, businessId: 'biz_001', role: 'admin' }
    };
  },

  signup: async (data) => {
    await mockAPI.delay(400);
    return { success: true, message: 'Signup successful' };
  },

  // Customers
  getCustomers: async () => {
    await mockAPI.delay(300);
    return { success: true, data: [] };
  },

  addCustomer: async (customerData) => {
    await mockAPI.delay(250);
    return { success: true, data: { ...customerData, id: Date.now() } };
  },

  updateCustomer: async (id, updates) => {
    await mockAPI.delay(250);
    return { success: true, data: { id, ...updates } };
  },

  deleteCustomer: async (id) => {
    await mockAPI.delay(200);
    return { success: true, message: 'Deleted' };
  },

  // Payments
  getPayments: async () => {
    await mockAPI.delay(300);
    return { success: true, data: [] };
  },

  recordPayment: async (paymentData) => {
    await mockAPI.delay(300);
    return { success: true, data: { ...paymentData, id: Date.now() } };
  },

  generatePaymentLink: async (data) => {
    await mockAPI.delay(400);
    return {
      success: true,
      link: `https://rzp.io/i/mock_${Date.now()}`,
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    };
  },

  // Reminders
  sendReminder: async (reminderData) => {
    await mockAPI.delay(400);
    return { success: true, message: `Reminder sent to ${reminderData.customerName}` };
  },

  // Reports
  generateReport: async (filters) => {
    await mockAPI.delay(500);
    return { success: true, data: { totalCollected: 0, pending: 0 } };
  },
};

export default mockAPI;
