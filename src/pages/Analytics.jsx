import React, { useContext } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { AnalyticsService } from '../services/analyticsService';
import { formatCurrency } from '../utils/helpers';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

function Analytics() {
  const { customers, payments } = useContext(DatabaseContext);

  // Get all metrics
  const revenueMetrics = AnalyticsService.getRevenueMetrics(payments, customers);
  const customerMetrics = AnalyticsService.getCustomerMetrics(customers);
  const paymentMethods = AnalyticsService.getPaymentMethodDistribution(payments);
  const revenueTrend = AnalyticsService.getRevenueTrend(payments);
  const collectionByPlan = AnalyticsService.getCollectionRateByPlan(payments, customers);
  const topPeriods = AnalyticsService.getTopPeriods(payments);
  const churnData = AnalyticsService.getChurnRate(customers, payments);
  const cohorts = AnalyticsService.getCustomerCohorts(customers);

  // Chart: Revenue Trend
  const trendData = {
    labels: revenueTrend.map(t => t.dayOfWeek),
    datasets: [
      {
        label: 'Daily Revenue',
        data: revenueTrend.map(t => t.amount),
        borderColor: '#0066CC',
        backgroundColor: 'rgba(0, 102, 204, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  // Chart: Payment Methods
  const methodData = {
    labels: paymentMethods.map(m => m.method),
    datasets: [
      {
        data: paymentMethods.map(m => m.amount),
        backgroundColor: ['#0066CC', '#27AE60', '#F39C12', '#E74C3C']
      }
    ]
  };

  // Chart: Collection by Plan
  const planData = {
    labels: collectionByPlan.map(p => p.plan),
    datasets: [
      {
        label: 'Collection Rate %',
        data: collectionByPlan.map(p => p.rate),
        backgroundColor: ['#27AE60', '#F39C12', '#E74C3C']
      }
    ]
  };

  // Chart: Customer Cohorts
  const cohortData = {
    labels: ['Very New', 'New', 'Established', 'Loyal'],
    datasets: [
      {
        data: [cohorts.veryNew, cohorts.new, cohorts.established, cohorts.loyal],
        backgroundColor: ['#0066CC', '#27AE60', '#F39C12', '#E74C3C']
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Advanced Analytics</h1>

      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="metric-card success">
          <div className="flex justify-between items-start">
            <div>
              <div className="metric-label">This Month</div>
              <div className="metric-value">{formatCurrency(revenueMetrics.thisMonth)}</div>
            </div>
            {revenueMetrics.growthDirection === 'up' ? 
              <TrendingUp className="text-white opacity-50" size={32} /> :
              <TrendingDown className="text-white opacity-50" size={32} />
            }
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Month-on-Month Growth</div>
          <div className="metric-value text-white">{revenueMetrics.growth}%</div>
        </div>

        <div className="metric-card warning">
          <div className="metric-label">Churn Rate</div>
          <div className="metric-value">{churnData.churnRate}%</div>
          <div className="text-sm opacity-90">{churnData.atRisk} at risk</div>
        </div>

        <div className="metric-card danger">
          <div className="metric-label">At Risk Customers</div>
          <div className="metric-value">{churnData.atRisk}</div>
          <div className="text-xs opacity-90">{churnData.recommendation}</div>
        </div>
      </div>

      {/* Customer Metrics */}
      <div className="metrics-grid mb-6">
        <div className="metric-card">
          <div className="metric-label">Active Customers</div>
          <div className="metric-value">{customerMetrics.active}</div>
        </div>
        <div className="metric-card warning">
          <div className="metric-label">Inactive</div>
          <div className="metric-value">{customerMetrics.inactive}</div>
        </div>
        <div className="metric-card danger">
          <div className="metric-label">Suspended</div>
          <div className="metric-value">{customerMetrics.suspended}</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="chart-container">
          <h2 className="text-lg font-semibold mb-4">Revenue Trend (Last 30 Days)</h2>
          <Line data={trendData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2 className="text-lg font-semibold mb-4">Payment Methods</h2>
          <Doughnut data={methodData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2 className="text-lg font-semibold mb-4">Collection Rate by Plan</h2>
          <Bar data={planData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2 className="text-lg font-semibold mb-4">Customer Cohorts</h2>
          <Doughnut data={cohortData} options={chartOptions} />
        </div>
      </div>

      {/* Collection by Plan Table */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Collection Rate by Plan</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Plan</th>
                <th>Customers</th>
                <th>Expected Revenue</th>
                <th>Collected Revenue</th>
                <th>Collection Rate</th>
                <th>Gap</th>
              </tr>
            </thead>
            <tbody>
              {collectionByPlan.map((plan, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">{plan.plan}</td>
                  <td>{plan.customers}</td>
                  <td>{formatCurrency(plan.expectedRevenue)}</td>
                  <td>{formatCurrency(plan.collectedRevenue)}</td>
                  <td>
                    <span className={`badge ${plan.rate >= 80 ? 'badge-success' : plan.rate >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                      {plan.rate}%
                    </span>
                  </td>
                  <td>{formatCurrency(plan.gap)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Periods */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Top 5 Revenue Periods</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topPeriods.map((period, idx) => (
                <tr key={idx}>
                  <td className="font-semibold">{period.month}</td>
                  <td>{formatCurrency(period.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
