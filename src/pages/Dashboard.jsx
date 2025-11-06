import React, { useContext } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { formatCurrency, calculateStatus } from '../utils/helpers';
import { Pie, Bar } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Users, DollarSign, AlertCircle } from 'lucide-react';

function Dashboard() {
  const { customers, payments } = useContext(DatabaseContext);

  // Calculate metrics
  const totalCollected = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const activeCustomers = customers.filter(c => c.status === 'active').length;

  const expectedRevenue = customers
    .filter(c => c.status === 'active')
    .reduce((sum, c) => sum + parseFloat(c.monthlyFee), 0);

  const pendingAmount = expectedRevenue - totalCollected;

  const customersWithStatus = customers.map(c => ({
    ...c,
    paymentStatus: calculateStatus(c)
  }));

  const overdueCustomers = customersWithStatus.filter(c => c.paymentStatus === 'Overdue');
  const overdueAmount = overdueCustomers.reduce((sum, c) => sum + parseFloat(c.monthlyFee), 0);

  const collectionRate = expectedRevenue > 0 
    ? ((totalCollected / expectedRevenue) * 100).toFixed(1) 
    : 0;

  // Chart data
  const revenueData = {
    labels: ['Collected', 'Pending', 'Overdue'],
    datasets: [
      {
        data: [totalCollected, pendingAmount - overdueAmount, overdueAmount],
        backgroundColor: ['#27AE60', '#F39C12', '#E74C3C'],
        borderWidth: 0
      }
    ]
  };

  const planData = {
    labels: ['Premium', 'Standard', 'Basic'],
    datasets: [
      {
        label: 'Number of Customers',
        data: [
          customers.filter(c => c.plan === 'Premium').length,
          customers.filter(c => c.plan === 'Standard').length,
          customers.filter(c => c.plan === 'Basic').length
        ],
        backgroundColor: ['#0066CC', '#27AE60', '#F39C12']
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString('en-IN', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card success">
          <div className="flex-between">
            <div>
              <div className="metric-label">Total Collected</div>
              <div className="metric-value">{formatCurrency(totalCollected)}</div>
              <div className="text-sm opacity-90 mt-2">
                Collection Rate: {collectionRate}%
              </div>
            </div>
            <DollarSign size={48} className="opacity-50" />
          </div>
        </div>

        <div className="metric-card warning">
          <div className="flex-between">
            <div>
              <div className="metric-label">Pending Fees</div>
              <div className="metric-value">{formatCurrency(pendingAmount)}</div>
              <div className="text-sm opacity-90 mt-2">
                Expected: {formatCurrency(expectedRevenue)}
              </div>
            </div>
            <TrendingUp size={48} className="opacity-50" />
          </div>
        </div>

        <div className="metric-card danger">
          <div className="flex-between">
            <div>
              <div className="metric-label">Overdue Amount</div>
              <div className="metric-value">{formatCurrency(overdueAmount)}</div>
              <div className="text-sm opacity-90 mt-2">
                {overdueCustomers.length} customer(s)
              </div>
            </div>
            <AlertCircle size={48} className="opacity-50" />
          </div>
        </div>

        <div className="metric-card">
          <div className="flex-between">
            <div>
              <div className="metric-label">Active Customers</div>
              <div className="metric-value">{activeCustomers}</div>
              <div className="text-sm opacity-90 mt-2">
                Total: {customers.length}
              </div>
            </div>
            <Users size={48} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="chart-container">
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <Pie data={revenueData} options={chartOptions} />
        </div>

        <div className="chart-container">
          <h2 className="text-xl font-semibold mb-4">Customers by Plan</h2>
          <Bar data={planData} options={chartOptions} />
        </div>
      </div>

      {/* Top Defaulters */}
      {overdueCustomers.length > 0 && (
        <div className="card mt-6">
          <h2 className="text-xl font-semibold mb-4 text-red-600">
            <AlertCircle size={24} className="inline mr-2" />
            Overdue Payments - Action Required
          </h2>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Plan</th>
                  <th>Monthly Fee</th>
                  <th>Due Date</th>
                  <th>Last Payment</th>
                </tr>
              </thead>
              <tbody>
                {overdueCustomers.slice(0, 5).map(customer => (
                  <tr key={customer.id}>
                    <td className="font-semibold">{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.plan}</td>
                    <td>{formatCurrency(customer.monthlyFee)}</td>
                    <td>{customer.dueDate}th of month</td>
                    <td>{new Date(customer.lastPaymentDate).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="card mt-6">
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.slice(-5).reverse().map(payment => (
                <tr key={payment.id}>
                  <td>{new Date(payment.date).toLocaleDateString('en-IN')}</td>
                  <td>{payment.customerName}</td>
                  <td className="font-semibold">{formatCurrency(payment.amount)}</td>
                  <td>{payment.method}</td>
                  <td>
                    <span className="badge badge-success">{payment.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;


// ------------------------------------------------

// import React, { useState, useMemo, useContext, createContext } from 'react';
// import { Pie, Bar } from 'react-chartjs-2';
// import {
//   Chart as ChartJS,
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
// } from 'chart.js';
// import {
//   TrendingUp,
//   Users,
//   DollarSign,
//   AlertCircle,
//   CheckCircle,
//   Clock,
//   ChevronRight
// } from 'lucide-react';

// // 1. REGISTER CHART.JS MODULES
// // ============================================================================
// ChartJS.register(
//   ArcElement,
//   Tooltip,
//   Legend,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title
// );

// // 2. HELPER FUNCTIONS
// // (These would normally be in 'utils/helpers.js')
// // ============================================================================

// /**
//  * Formats a number as Indian Rupees (INR).
//  * @param {number} amount - The amount to format.
//  * @returns {string} - The formatted currency string.
//  */
// const formatCurrency = (amount) => {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// };

// /**
//  * Calculates the payment status for a customer.
//  * @param {object} customer - The customer object.
//  * @returns {string} - 'Paid', 'Pending', or 'Overdue'.
//  */
// const calculateStatus = (customer) => {
//   const today = new Date();
//   const dueDate = parseInt(customer.dueDate, 10);
//   const lastPaymentDate = new Date(customer.lastPaymentDate);

//   // Check if last payment was this month
//   const paidThisMonth =
//     lastPaymentDate.getMonth() === today.getMonth() &&
//     lastPaymentDate.getFullYear() === today.getFullYear();

//   if (paidThisMonth) {
//     return 'Paid';
//   }

//   // Check if today is past the due date
//   if (today.getDate() > dueDate) {
//     return 'Overdue';
//   }

//   return 'Pending';
// };

// // 3. MOCK DATA & DATABASE CONTEXT
// // (This would normally be in 'contexts/DatabaseContext.js')
// // ============================================================================

// // Mock Data
// const mockCustomers = [
//   { id: 1, name: 'Rohan Sharma', phone: '98XXXX1234', plan: 'Premium', monthlyFee: '1500', status: 'active', dueDate: '5', lastPaymentDate: '2025-11-01' },
//   { id: 2, name: 'Priya Singh', phone: '99XXXX5678', plan: 'Standard', monthlyFee: '1000', status: 'active', dueDate: '10', lastPaymentDate: '2025-10-11' },
//   { id: 3, name: 'Amit Patel', phone: '97XXXX9012', plan: 'Basic', monthlyFee: '700', status: 'active', dueDate: '15', lastPaymentDate: '2025-11-10' },
//   { id: 4, name: 'Sunita Rao', phone: '96XXXX3456', plan: 'Premium', monthlyFee: '1500', status: 'active', dueDate: '5', lastPaymentDate: '2025-09-05' },
//   { id: 5, name: 'Vikram Reddy', phone: '95XXXX7890', plan: 'Standard', monthlyFee: '1000', status: 'inactive', dueDate: '20', lastPaymentDate: '2025-10-20' },
//   { id: 6, name: 'Anjali Desai', phone: '94XXXX2345', plan: 'Basic', monthlyFee: '700', status: 'active', dueDate: '12', lastPaymentDate: '2025-11-11' },
// ];

// const mockPayments = [
//   { id: 1, customerId: 1, customerName: 'Rohan Sharma', amount: '1500', date: '2025-11-01', method: 'UPI', status: 'completed' },
//   { id: 2, customerId: 3, customerName: 'Amit Patel', amount: '700', date: '2025-11-10', method: 'Card', status: 'completed' },
//   { id: 3, customerId: 6, customerName: 'Anjali Desai', amount: '700', date: '2025-11-11', method: 'Cash', status: 'completed' },
//   { id: 4, customerId: 2, customerName: 'Priya Singh', amount: '1000', date: '2025-10-11', method: 'UPI', status: 'completed' },
//   { id: 5, customerId: 5, customerName: 'Vikram Reddy', amount: '1000', date: '2025-10-20', method: 'Card', status: 'completed' },
//   { id: 6, customerId: 4, customerName: 'Sunita Rao', amount: '1500', date: '2025-09-05', method: 'Cash', status: 'completed' },
// ];

// // Context
// const DatabaseContext = createContext();

// // Provider
// const DatabaseProvider = ({ children }) => {
//   // In a real app, this state would be fetched from Firebase/API
//   const [customers, setCustomers] = useState(mockCustomers);
//   const [payments, setPayments] = useState(mockPayments);

//   const value = { customers, payments };

//   return (
//     <DatabaseContext.Provider value={value}>
//       {children}
//     </DatabaseContext.Provider>
//   );
// };

// // 4. CUSTOM HOOK FOR DASHBOARD LOGIC
// // (This would normally be in 'hooks/useDashboardMetrics.js')
// // ============================================================================

// const useDashboardMetrics = () => {
//   const { customers, payments } = useContext(DatabaseContext);

//   // Use useMemo to memoize expensive calculations
//   const metrics = useMemo(() => {
//     const activeCustomers = customers.filter(c => c.status === 'active');
    
//     const totalCollected = payments
//       .filter(p => p.status === 'completed' && new Date(p.date).getMonth() === new Date().getMonth()) // This month's collections
//       .reduce((sum, p) => sum + parseFloat(p.amount), 0);

//     const expectedRevenue = activeCustomers
//       .reduce((sum, c) => sum + parseFloat(c.monthlyFee), 0);

//     const customersWithStatus = activeCustomers.map(c => ({
//       ...c,
//       paymentStatus: calculateStatus(c)
//     }));

//     const overdueCustomers = customersWithStatus.filter(c => c.paymentStatus === 'Overdue');
//     const overdueAmount = overdueCustomers.reduce((sum, c) => sum + parseFloat(c.monthlyFee), 0);

//     const pendingAmount = expectedRevenue - totalCollected;
    
//     const collectionRate = expectedRevenue > 0
//       ? ((totalCollected / expectedRevenue) * 100).toFixed(1)
//       : 0;
      
//     const recentPayments = [...payments]
//       .sort((a, b) => new Date(b.date) - new Date(a.date))
//       .slice(0, 5);

//     // Chart Data
//     const revenueData = {
//       labels: ['Collected', 'Pending', 'Overdue'],
//       datasets: [
//         {
//           data: [totalCollected, Math.max(0, pendingAmount - overdueAmount), overdueAmount],
//           backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
//           borderColor: '#ffffff',
//           borderWidth: 2,
//         },
//       ],
//     };

//     const planData = {
//       labels: ['Premium', 'Standard', 'Basic'],
//       datasets: [
//         {
//           label: 'Number of Customers',
//           data: [
//             activeCustomers.filter(c => c.plan === 'Premium').length,
//             activeCustomers.filter(c => c.plan === 'Standard').length,
//             activeCustomers.filter(c => c.plan === 'Basic').length,
//           ],
//           backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
//           borderRadius: 4,
//         },
//       ],
//     };

//     return {
//       totalCollected,
//       pendingAmount,
//       expectedRevenue,
//       overdueAmount,
//       overdueCustomers,
//       activeCustomersCount: activeCustomers.length,
//       totalCustomersCount: customers.length,
//       collectionRate,
//       recentPayments,
//       revenueData,
//       planData,
//     };
//   }, [customers, payments]);

//   return metrics;
// };

// // 5. REUSABLE UI COMPONENTS
// // ============================================================================

// /**
//  * A styled card container.
//  */
// const Card = ({ children, className = '' }) => (
//   <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
//     {children}
//   </div>
// );

// /**
//  * A styled metric card for the dashboard header.
//  */
// const MetricCard = ({ title, value, detail, icon, color = 'blue' }) => {
//   const colors = {
//     green: 'bg-green-100 text-green-600',
//     blue: 'bg-blue-100 text-blue-600',
//     amber: 'bg-amber-100 text-amber-600',
//     red: 'bg-red-100 text-red-600',
//   };
  
//   const iconBg = colors[color] || colors.blue;

//   return (
//     <Card className="flex items-center space-x-4">
//       <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${iconBg}`}>
//         {icon}
//       </div>
//       <div>
//         <div className="text-sm font-medium text-gray-500">{title}</div>
//         <div className="text-2xl font-bold text-gray-900">{value}</div>
//         {detail && <div className="text-sm text-gray-500">{detail}</div>}
//       </div>
//     </Card>
//   );
// };

// /**
//  * A styled badge for status indicators.
//  */
// const Badge = ({ children, color }) => {
//   const colors = {
//     green: 'bg-green-100 text-green-800',
//     amber: 'bg-amber-100 text-amber-800',
//     red: 'bg-red-100 text-red-800',
//   };
//   const colorClass = colors[color] || 'bg-gray-100 text-gray-800';
//   return (
//     <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
//       {children}
//     </span>
//   );
// };

// // 6. DASHBOARD COMPONENT
// // (This is the main component you provided, now refactored)
// // ============================================================================

// function Dashboard() {
//   const {
//     totalCollected,
//     pendingAmount,
//     expectedRevenue,
//     overdueAmount,
//     overdueCustomers,
//     activeCustomersCount,
//     totalCustomersCount,
//     collectionRate,
//     recentPayments,
//     revenueData,
//     planData,
//   } = useDashboardMetrics();

//   const chartOptions = {
//     responsive: true,
//     maintainAspectRatio: false,
//     plugins: {
//       legend: {
//         position: 'bottom',
//         labels: {
//           font: {
//             family: 'Inter, sans-serif',
//             size: 12,
//           },
//           padding: 20,
//         },
//       },
//       title: {
//         display: false,
//       },
//     },
//   };

//   const barChartOptions = {
//     ...chartOptions,
//     scales: {
//       y: {
//         beginAtZero: true,
//         ticks: {
//           precision: 0 // Ensure only whole numbers for customer counts
//         }
//       },
//     },
//   };

//   return (
//     <div className="p-6 md:p-10">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
//         <div className="text-sm text-gray-600 mt-2 md:mt-0">
//           {new Date().toLocaleDateString('en-IN', {
//             weekday: 'long',
//             year: 'numeric',
//             month: 'long',
//             day: 'numeric',
//           })}
//         </div>
//       </div>

//       {/* Metrics Grid */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//         <MetricCard
//           title="Total Collected (This Month)"
//           value={formatCurrency(totalCollected)}
//           detail={`Collection Rate: ${collectionRate}%`}
//           icon={<DollarSign size={24} />}
//           color="green"
//         />
//         <MetricCard
//           title="Pending Fees"
//           value={formatCurrency(pendingAmount)}
//           detail={`Expected: ${formatCurrency(expectedRevenue)}`}
//           icon={<Clock size={24} />}
//           color="amber"
//         />
//         <MetricCard
//           title="Overdue Amount"
//           value={formatCurrency(overdueAmount)}
//           detail={`${overdueCustomers.length} customer(s)`}
//           icon={<AlertCircle size={24} />}
//           color="red"
//         />
//         <MetricCard
//           title="Active Customers"
//           value={activeCustomersCount}
//           detail={`Total: ${totalCustomersCount}`}
//           icon={<Users size={24} />}
//           color="blue"
//         />
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
//         <Card className="lg:col-span-1">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Revenue Breakdown
//           </h2>
//           <div className="h-64 md:h-80">
//             <Pie data={revenueData} options={chartOptions} />
//           </div>
//         </Card>
//         <Card className="lg:col-span-2">
//           <h2 className="text-xl font-semibold text-gray-900 mb-4">
//             Customers by Plan
//           </h2>
//           <div className="h-64 md:h-80">
//             <Bar data={planData} options={barChartOptions} />
//           </div>
//         </Card>
//       </div>

//       {/* Tables */}
//       <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
//         {/* Overdue Payments */}
//         <Card>
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold text-red-600 flex items-center">
//               <AlertCircle size={20} className="mr-2" />
//               Overdue Payments
//             </h2>
//             <a href="/payments" className="text-sm font-medium text-blue-600 hover:text-blue-800">
//               View all
//             </a>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {overdueCustomers.length > 0 ? (
//                   overdueCustomers.slice(0, 5).map(customer => (
//                     <tr key={customer.id} className="hover:bg-gray-50">
//                       <td className="px-4 py-3 whitespace-nowrap">
//                         <div className="text-sm font-medium text-gray-900">{customer.name}</div>
//                         <div className="text-sm text-gray-500">{customer.phone}</div>
//                       </td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{customer.plan}</td>
//                       <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(customer.monthlyFee)}</td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td colSpan="3" className="px-4 py-4 text-center text-sm text-gray-500">
//                       No overdue payments. Well done!
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Card>

//         {/* Recent Payments */}
//         <Card>
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold text-gray-900 flex items-center">
//               <CheckCircle size={20} className="mr-2 text-green-600" />
//               Recent Payments
//             </h2>
//             <a href="/payments" className="text-sm font-medium text-blue-600 hover:text-blue-800">
//               View all
//             </a>
//           </div>
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200">
//               <thead className="bg-gray-50">
//                 <tr>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
//                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {recentPayments.map(payment => (
//                   <tr key={payment.id} className="hover:bg-gray-50">
//                     <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{payment.customerName}</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
//                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{new Date(payment.date).toLocaleDateString('en-IN')}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }

// // 7. MAIN APP COMPONENT
// // (This wraps everything together)
// // ============================================================================

// export default function App() {
//   return (
//     <DatabaseProvider>
//       <div className="min-h-screen bg-gray-100 font-inter">
//         {/* Here you could have a Sidebar and Header */}
//         {/* <Sidebar /> */}
//         <main>
//           {/* <Header /> */}
//           <Dashboard />
//         </main>
//       </div>
//     </DatabaseProvider>
//   );
// }