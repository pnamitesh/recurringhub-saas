// Helper Functions

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const validatePhone = (phone) => {
  const regex = /^[6-9]\d{9}$/;
  return regex.test(phone.replace(/\D/g, ''));
};

export const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const calculateStatus = (customer) => {
  const today = new Date();
  const currentDay = today.getDate();
  const dueDate = parseInt(customer.dueDate);

  if (customer.status === 'suspended') {
    return 'Suspended';
  }

  const lastPayment = customer.lastPaymentDate ? new Date(customer.lastPaymentDate) : null;
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  if (lastPayment) {
    const paymentMonth = lastPayment.getMonth();
    const paymentYear = lastPayment.getFullYear();

    // Check if payment was made this month
    if (paymentMonth === currentMonth && paymentYear === currentYear) {
      return 'Paid';
    }
  }

  // Check if overdue
  if (currentDay > dueDate) {
    return 'Overdue';
  }

  return 'Pending';
};

export const getStatusBadgeClass = (status) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'completed':
    case 'active':
      return 'badge-success';
    case 'pending':
      return 'badge-warning';
    case 'overdue':
    case 'suspended':
    case 'failed':
      return 'badge-danger';
    default:
      return 'badge-info';
  }
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const cell = row[header];
      return typeof cell === 'string' && cell.includes(',') 
        ? `"${cell}"` 
        : cell;
    }).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const simulateAPIDelay = (ms = 300) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export default {
  formatCurrency,
  formatDate,
  formatDateTime,
  validatePhone,
  validateEmail,
  calculateStatus,
  getStatusBadgeClass,
  exportToCSV,
  simulateAPIDelay
};
