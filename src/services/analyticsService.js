// Advanced Analytics Service

export const AnalyticsService = {
  // Calculate revenue metrics
  getRevenueMetrics: (payments, customers) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.date);
      return paymentDate.getMonth() === currentMonth && paymentDate.getFullYear() === currentYear;
    });

    const lastMonthPayments = payments.filter(p => {
      const paymentDate = new Date(p.date);
      const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      return paymentDate.getMonth() === lastMonth && paymentDate.getFullYear() === lastMonthYear;
    });

    const thisMonthTotal = thisMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const lastMonthTotal = lastMonthPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const monthlyGrowth = lastMonthTotal > 0 
      ? (((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100).toFixed(2)
      : 0;

    return {
      thisMonth: thisMonthTotal,
      lastMonth: lastMonthTotal,
      growth: monthlyGrowth,
      growthDirection: monthlyGrowth >= 0 ? 'up' : 'down',
      average: thisMonthPayments.length > 0 ? (thisMonthTotal / thisMonthPayments.length).toFixed(2) : 0
    };
  },

  // Calculate customer metrics
  getCustomerMetrics: (customers) => {
    const active = customers.filter(c => c.status === 'active').length;
    const inactive = customers.filter(c => c.status === 'inactive').length;
    const suspended = customers.filter(c => c.status === 'suspended').length;

    return {
      total: customers.length,
      active,
      inactive,
      suspended,
      activePercentage: customers.length > 0 ? ((active / customers.length) * 100).toFixed(1) : 0
    };
  },

  // Get payment distribution by method
  getPaymentMethodDistribution: (payments) => {
    const distribution = {};

    payments.forEach(p => {
      distribution[p.method] = (distribution[p.method] || 0) + parseFloat(p.amount);
    });

    return Object.entries(distribution).map(([method, amount]) => ({
      method,
      amount,
      count: payments.filter(p => p.method === method).length,
      percentage: ((amount / payments.reduce((sum, p) => sum + parseFloat(p.amount), 0)) * 100).toFixed(2)
    }));
  },

  // Get revenue trend (last 30 days)
  getRevenueTrend: (payments) => {
    const trend = {};
    const dates = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T');
      trend[dateKey] = 0;
      dates.push(dateKey);
    }

    payments.forEach(p => {
      const dateKey = p.date.split('T');
      if (trend.hasOwnProperty(dateKey)) {
        trend[dateKey] += parseFloat(p.amount);
      }
    });

    return dates.map(date => ({
      date,
      amount: trend[date],
      dayOfWeek: new Date(date).toLocaleDateString('en-IN', { weekday: 'short' })
    }));
  },

  // Get customer cohort analysis
  getCustomerCohorts: (customers) => {
    const cohorts = {
      veryNew: [], // < 1 month
      new: [],     // 1-3 months
      established: [], // 3-12 months
      loyal: []    // > 1 year
    };

    const now = new Date();

    customers.forEach(c => {
      const createdDate = new Date(c.createdAt);
      const daysOld = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));

      if (daysOld < 30) cohorts.veryNew.push(c);
      else if (daysOld < 90) cohorts.new.push(c);
      else if (daysOld < 365) cohorts.established.push(c);
      else cohorts.loyal.push(c);
    });

    return {
      veryNew: cohorts.veryNew.length,
      new: cohorts.new.length,
      established: cohorts.established.length,
      loyal: cohorts.loyal.length,
      total: customers.length
    };
  },

  // Calculate collection rate by plan
  getCollectionRateByPlan: (payments, customers) => {
    const plans = ['Premium', 'Standard', 'Basic'];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return plans.map(plan => {
      const planCustomers = customers.filter(c => c.plan === plan && c.status === 'active');
      const expectedRevenue = planCustomers.reduce((sum, c) => sum + parseFloat(c.monthlyFee), 0);

      const planPayments = payments.filter(p => {
        const paymentDate = new Date(p.date);
        const customer = customers.find(c => c.id === p.customerId);
        return customer && customer.plan === plan && 
               paymentDate.getMonth() === currentMonth && 
               paymentDate.getFullYear() === currentYear;
      });

      const collectedRevenue = planPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const rate = expectedRevenue > 0 ? ((collectedRevenue / expectedRevenue) * 100).toFixed(2) : 0;

      return {
        plan,
        customers: planCustomers.length,
        expectedRevenue,
        collectedRevenue,
        rate,
        gap: expectedRevenue - collectedRevenue
      };
    });
  },

  // Get top performing periods
  getTopPeriods: (payments) => {
    const months = {};

    payments.forEach(p => {
      const date = new Date(p.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + parseFloat(p.amount);
    });

    return Object.entries(months)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  },

  // Calculate churn rate
  getChurnRate: (customers, payments) => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const inactiveRecently = customers.filter(c => {
      if (c.status !== 'active') return false;
      const lastPayment = new Date(c.lastPaymentDate);
      return lastPayment < thirtyDaysAgo;
    });

    const churnRate = customers.length > 0 
      ? ((inactiveRecently.length / customers.length) * 100).toFixed(2)
      : 0;

    return {
      atRisk: inactiveRecently.length,
      churnRate,
      recommendation: churnRate > 10 ? 'High churn - Send reminders' : 'Churn rate normal'
    };
  }
};

export default AnalyticsService;
