// Advanced Date Utilities

export const DateUtils = {
  // Get days until due date
  daysUntilDue: (dueDate) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let nextDue;
    if (dueDate > currentDay) {
      nextDue = new Date(currentYear, currentMonth, dueDate);
    } else {
      nextDue = new Date(currentYear, currentMonth + 1, dueDate);
    }

    const diffTime = nextDue - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
  },

  // Get days overdue
  daysOverdue: (lastPaymentDate, dueDate) => {
    const today = new Date();
    const lastPayment = new Date(lastPaymentDate);
    const lastPaymentMonth = lastPayment.getMonth();
    const lastPaymentYear = lastPayment.getFullYear();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Check if payment was made this month
    if (lastPaymentMonth === currentMonth && lastPaymentYear === currentYear) {
      return 0;
    }

    // Calculate days since due date
    let dueDateThisMonth = new Date(currentYear, currentMonth, dueDate);
    if (today < dueDateThisMonth && currentMonth > 0) {
      dueDateThisMonth = new Date(currentYear, currentMonth - 1, dueDate);
    }

    const diffTime = today - dueDateThisMonth;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    return Math.max(0, diffDays);
  },

  // Get month name
  getMonthName: (monthIndex) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  },

  // Get age in months
  getAgeInMonths: (startDate) => {
    const start = new Date(startDate);
    const now = new Date();

    let months = (now.getFullYear() - start.getFullYear()) * 12;
    months += now.getMonth() - start.getMonth();

    return months;
  },

  // Get quarter
  getQuarter: (date) => {
    const month = new Date(date).getMonth();
    return Math.floor(month / 3) + 1;
  },

  // Format as relative time (e.g., "2 days ago")
  formatRelativeTime: (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  },

  // Get payment schedule for next 6 months
  getPaymentSchedule: (customer) => {
    const schedule = [];
    const today = new Date();
    const startMonth = today.getMonth();
    const startYear = today.getFullYear();

    for (let i = 0; i < 6; i++) {
      const month = (startMonth + i) % 12;
      const year = startYear + Math.floor((startMonth + i) / 12);
      const dueDate = new Date(year, month, customer.dueDate);

      schedule.push({
        month: DateUtils.getMonthName(month),
        year,
        dueDate: dueDate.toISOString().split('T'),
        amount: customer.monthlyFee,
        isPast: dueDate < today,
        isThisMonth: month === startMonth && year === startYear
      });
    }

    return schedule;
  }
};

export default DateUtils;
