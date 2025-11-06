import React, { useContext, useState } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { formatCurrency, formatDate, exportToCSV } from '../utils/helpers';
import { FileDown, TrendingUp, Calendar } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

function Reports() {
  const { customers, payments } = useContext(DatabaseContext);
  const [dateRange, setDateRange] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate metrics
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const avgPayment = payments.length > 0 ? totalRevenue / payments.length : 0;
  const totalPayments = payments.length;

  // Filter payments by date range
  const getFilteredPayments = () => {
    if (dateRange === 'all') return payments;
    
    if (dateRange === 'custom' && startDate && endDate) {
      return payments.filter(p => {
        const pDate = new Date(p.date);
        return pDate >= new Date(startDate) && pDate <= new Date(endDate);
      });
    }

    const now = new Date();
    if (dateRange === 'today') {
      return payments.filter(p => new Date(p.date).toDateString() === now.toDateString());
    }
    if (dateRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return payments.filter(p => new Date(p.date) >= weekAgo);
    }
    if (dateRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return payments.filter(p => new Date(p.date) >= monthAgo);
    }
    if (dateRange === 'year') {
      const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      return payments.filter(p => new Date(p.date) >= yearAgo);
    }

    return payments;
  };

  const filteredPayments = getFilteredPayments();

  const exportCustomersCSV = () => {
    try {
      exportToCSV(customers, 'customers');
    } catch (err) {
      toast.error('Error exporting customers: ' + err.message);
    }
  };

  const exportPaymentsCSV = () => {
    try {
      exportToCSV(filteredPayments, 'payments');
    } catch (err) {
      toast.error('Error exporting payments: ' + err.message);
    }
  };

  const exportFullReport = () => {
    try {
      const reportData = customers.map(c => {
        const customerPayments = payments.filter(p => p.customerId === c.id);
        const totalPaid = customerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        
        return {
          customerName: c.name,
          phone: c.phone,
          plan: c.plan,
          monthlyFee: c.monthlyFee,
          status: c.status,
          totalPayments: customerPayments.length,
          totalPaid: totalPaid,
          lastPayment: c.lastPaymentDate,
          joinDate: c.startDate
        };
      });

      exportToCSV(reportData, 'full_report');
    } catch (err) {
      toast.error('Error exporting report: ' + err.message);
    }
  };

  const exportPDFReport = () => {
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('RecurringHub - Business Report', 20, 20);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, 30);
      
      // Metrics
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Key Metrics:', 20, 45);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total Revenue: ₹${totalRevenue.toLocaleString('en-IN')}`, 20, 55);
      doc.text(`Total Customers: ${totalCustomers}`, 20, 65);
      doc.text(`Active Customers: ${activeCustomers}`, 20, 75);
      doc.text(`Total Payments: ${totalPayments}`, 20, 85);
      doc.text(`Average Payment: ₹${avgPayment.toLocaleString('en-IN')}`, 20, 95);
      
      // Customer Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Customer Summary:', 20, 110);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      let yPos = 120;
      customers.slice(0, 10).forEach((customer, idx) => {
        const custPayments = payments.filter(p => p.customerId === customer.id);
        const custTotal = custPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
        doc.text(
          `${idx + 1}. ${customer.name} - ${customer.plan} - ₹${custTotal.toLocaleString('en-IN')}`,
          20,
          yPos
        );
        yPos += 8;
      });
      
      doc.text('...and more', 20, yPos);
      
      doc.save(`report_${new Date().toISOString().split('T')}.pdf`);
      toast.success('Report exported to PDF!');
    } catch (err) {
      toast.error('Error generating PDF: ' + err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reports & Analytics</h1>

      {/* Summary Cards */}
      <div className="metrics-grid mb-6">
        <div className="metric-card success">
          <div className="metric-label">Total Revenue</div>
          <div className="metric-value">{formatCurrency(totalRevenue)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Customers</div>
          <div className="metric-value">{totalCustomers}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Active Customers</div>
          <div className="metric-value">{activeCustomers}</div>
        </div>
        <div className="metric-card warning">
          <div className="metric-label">Total Payments</div>
          <div className="metric-value">{totalPayments}</div>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="card mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Date Range
        </h2>
        <div className="flex gap-2 flex-wrap">
          {['all', 'today', 'week', 'month', 'year'].map(range => (
            <button
              key={range}
              className={`btn ${dateRange === range ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setDateRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
          <button
            className={`btn ${dateRange === 'custom' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setDateRange('custom')}
          >
            Custom
          </button>
        </div>

        {dateRange === 'custom' && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              placeholder="Start Date"
            />
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              placeholder="End Date"
            />
          </div>
        )}
      </div>

      {/* Export Options */}
      <div className="card mb-6">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="btn btn-primary" onClick={exportCustomersCSV}>
            <FileDown size={20} />
            Customers CSV
          </button>
          <button className="btn btn-primary" onClick={exportPaymentsCSV}>
            <FileDown size={20} />
            Payments CSV
          </button>
          <button className="btn btn-success" onClick={exportFullReport}>
            <FileDown size={20} />
            Full Report CSV
          </button>
          <button className="btn btn-primary" onClick={exportPDFReport}>
            <FileDown size={20} />
            PDF Report
          </button>
        </div>
      </div>

      {/* Detailed Report */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp size={24} />
          Detailed Customer Report
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Plan</th>
                <th>Monthly Fee</th>
                <th>Payments</th>
                <th>Total Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => {
                const custPayments = payments.filter(p => p.customerId === customer.id);
                const totalPaid = custPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
                
                return (
                  <tr key={customer.id}>
                    <td className="font-semibold">{customer.name}</td>
                    <td>{customer.plan}</td>
                    <td>{formatCurrency(customer.monthlyFee)}</td>
                    <td>{custPayments.length}</td>
                    <td className="font-semibold">{formatCurrency(totalPaid)}</td>
                    <td>
                      <span className={`badge ${customer.status === 'active' ? 'badge-success' : customer.status === 'suspended' ? 'badge-danger' : 'badge-warning'}`}>
                        {customer.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Reports;

// ----------------------------------------------------------------


// import React, { useContext, useState, useMemo } from 'react';
// import { FileDown, TrendingUp, Calendar, Zap, Users, Receipt } from 'lucide-react';

// // --- MOCK EXTERNAL LIBRARIES & HELPERS (To make the file runnable) ---
// // Note: In a real app, you would install these via npm.
// // The jsPDF library script is loaded via CDN here for the standalone immersive.
// // <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script> 

// // Mock Data
// const initialCustomers = [
//   { id: 'c1', name: 'Alok Sharma', phone: '9876543210', plan: 'Premium', monthlyFee: 1999, status: 'active', lastPaymentDate: '2024-10-25', startDate: '2024-07-01' },
//   { id: 'c2', name: 'Priya Singh', phone: '9988776655', plan: 'Standard', monthlyFee: 999, status: 'suspended', lastPaymentDate: '2024-09-10', startDate: '2024-08-15' },
//   { id: 'c3', name: 'Vijay Kumar', phone: '9000111222', plan: 'Premium', monthlyFee: 1999, status: 'active', lastPaymentDate: '2024-11-01', startDate: '2024-05-20' },
//   { id: 'c4', name: 'Sneha Patel', phone: '8123456789', plan: 'Standard', monthlyFee: 999, status: 'active', lastPaymentDate: '2024-11-04', startDate: '2024-09-01' },
// ];

// const initialPayments = [
//   { id: 'p1', customerId: 'c1', amount: 1999, date: '2024-10-25', status: 'completed' },
//   { id: 'p2', customerId: 'c2', amount: 999, date: '2024-09-10', status: 'completed' },
//   { id: 'p3', customerId: 'c3', amount: 1999, date: '2024-11-01', status: 'completed' },
//   { id: 'p4', customerId: 'c4', amount: 999, date: '2024-11-04', status: 'completed' },
//   { id: 'p5', customerId: 'c1', amount: 1999, date: '2024-09-25', status: 'completed' },
//   { id: 'p6', customerId: 'c3', amount: 1999, date: '2024-10-01', status: 'completed' },
//   { id: 'p7', customerId: 'c3', amount: 1999, date: '2024-09-01', status: 'completed' },
//   { id: 'p8', customerId: 'c4', amount: 999, date: '2024-10-04', status: 'failed' },
// ];

// const DatabaseContext = React.createContext(null);

// // Simplified helpers
// const formatCurrency = (amount) => `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
// const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });

// // Mock toast implementation (since 'react-toastify' is external)
// const toast = {
//   success: (msg) => console.log('TOAST SUCCESS:', msg),
//   error: (msg) => console.error('TOAST ERROR:', msg),
// };

// // Simplified CSV Export
// const exportToCSV = (data, filename) => {
//     // Mocking download action
//     console.log(`[CSV MOCK] Attempting to download ${filename}.csv...`);
//     toast.success(`Data exported to ${filename}.csv!`);
// };
// // --- END MOCK SETUP ---


// // Component to display a single metric card
// const MetricCard = ({ title, value, icon: Icon, colorClass, trend }) => (
//   <div className={`bg-white p-6 rounded-2xl shadow-lg border-b-4 ${colorClass} transition-transform hover:shadow-xl hover:-translate-y-0.5`}>
//     <div className="flex justify-between items-start">
//       <div className="text-2xl font-bold text-gray-800 tracking-tight">{value}</div>
//       <div className={`p-2 rounded-full ${colorClass.replace('border-', 'bg-')} bg-opacity-10 text-opacity-100`}>
//         <Icon size={24} />
//       </div>
//     </div>
//     <p className="text-sm font-medium text-gray-500 mt-1">{title}</p>
//     {trend && (
//         <div className="mt-3 text-xs font-medium flex items-center text-green-600">
//             <TrendingUp size={14} className="mr-1" /> {trend} vs last month
//         </div>
//     )}
//   </div>
// );


// function Reports() {
//   // Use mock context data
//   const { customers, payments } = useContext(DatabaseContext);
//   const [dateRange, setDateRange] = useState('all');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   // Memoize filtered payments
//   const filteredPayments = useMemo(() => {
//     const allPayments = payments.filter(p => p.status === 'completed');

//     let start = null;
//     let end = null;
//     const now = new Date();
    
//     if (dateRange === 'today') {
//         start = new Date(now.setHours(0, 0, 0, 0));
//         end = new Date(now.setHours(23, 59, 59, 999));
//     } else if (dateRange === 'week') {
//         start = new Date(now.setDate(now.getDate() - 7));
//         end = new Date();
//     } else if (dateRange === 'month') {
//         start = new Date(now.setMonth(now.getMonth() - 1));
//         end = new Date();
//     } else if (dateRange === 'year') {
//         start = new Date(now.setFullYear(now.getFullYear() - 1));
//         end = new Date();
//     } else if (dateRange === 'custom' && startDate && endDate) {
//         start = new Date(startDate);
//         end = new Date(endDate);
//         // Ensure end date includes the whole day
//         end.setHours(23, 59, 59, 999);
//     } else if (dateRange === 'all') {
//         return allPayments;
//     }

//     if (start && end) {
//         return allPayments.filter(p => {
//             const pDate = new Date(p.date);
//             return pDate >= start && pDate <= end;
//         });
//     }

//     return allPayments; // Default to all completed payments if filtering fails
//   }, [payments, dateRange, startDate, endDate]);


//   // Memoize core metrics calculation
//   const metrics = useMemo(() => {
//     const revenue = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
//     const completedPaymentsCount = filteredPayments.length;
    
//     const totalCustomers = customers.length;
//     const activeCustomers = customers.filter(c => c.status === 'active').length;
    
//     // Placeholder for trend calculation (complex logic omitted for this component)
//     const revenueTrend = '+4.2%'; 

//     return {
//       revenue,
//       totalCustomers,
//       activeCustomers,
//       completedPaymentsCount,
//       avgPayment: completedPaymentsCount > 0 ? revenue / completedPaymentsCount : 0,
//       revenueTrend
//     };
//   }, [customers, filteredPayments]);
  
//   // --- Export Functions ---
//   const handleExport = (data, filename) => {
//     try {
//       exportToCSV(data, filename);
//     } catch (err) {
//       toast.error('Error exporting CSV: ' + err.message);
//     }
//   };

//   const exportFullReport = () => {
//     const reportData = customers.map(c => {
//       const customerPayments = payments.filter(p => p.customerId === c.id && p.status === 'completed');
//       const totalPaid = customerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      
//       return {
//         customerName: c.name,
//         phone: c.phone,
//         plan: c.plan,
//         monthlyFee: c.monthlyFee,
//         status: c.status,
//         totalPayments: customerPayments.length,
//         totalPaid: totalPaid,
//         lastPayment: c.lastPaymentDate,
//         joinDate: c.startDate
//       };
//     });
//     handleExport(reportData, 'full_report');
//   };

//   const exportPDFReport = () => {
//     // jsPDF is globally available via the CDN script loaded in the App component
//     if (typeof window.jsPDF === 'undefined') {
//         toast.error('PDF library not initialized.');
//         return;
//     }

//     try {
//         const { jsPDF } = window;
//         const doc = new jsPDF();
//         let yPos = 20;

//         // Title
//         doc.setFontSize(22);
//         doc.setFont('helvetica', 'bold');
//         doc.text('Business Performance Report', 20, yPos);
//         yPos += 10;
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'normal');
//         doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, yPos);
//         yPos += 15;

//         // Metrics Summary
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.text('Key Metrics:', 20, yPos);
//         yPos += 7;

//         doc.setFontSize(12);
//         doc.setFont('helvetica', 'normal');
//         const metricsList = [
//             `Total Revenue: ${formatCurrency(metrics.revenue)}`,
//             `Total Customers: ${metrics.totalCustomers}`,
//             `Active Customers: ${metrics.activeCustomers}`,
//             `Total Completed Payments: ${metrics.completedPaymentsCount}`,
//             `Average Payment: ${formatCurrency(metrics.avgPayment)}`
//         ];
//         metricsList.forEach(text => {
//             doc.text(text, 25, yPos);
//             yPos += 6;
//         });

//         // Detailed Report Table (only for the filtered payments)
//         yPos += 10;
//         doc.setFontSize(14);
//         doc.setFont('helvetica', 'bold');
//         doc.text('Filtered Payment Details:', 20, yPos);
//         yPos += 10;

//         const tableData = filteredPayments.map(p => [
//             p.id, 
//             customers.find(c => c.id === p.customerId)?.name || 'N/A', 
//             formatCurrency(p.amount), 
//             formatDate(p.date)
//         ]);
        
//         // Add table to PDF (requires autoTable, which is not in base jspdf.umd.min.js, so we mock the table drawing)
//         // Simple text grid for the table:
//         const tableHeaders = ['ID', 'Customer', 'Amount', 'Date'];
        
//         doc.setFontSize(10);
//         doc.setFont('helvetica', 'bold');
//         let x = 20;
//         tableHeaders.forEach(header => {
//             doc.text(header, x, yPos);
//             x += 40;
//         });
//         yPos += 5;
        
//         doc.setFont('helvetica', 'normal');
//         tableData.slice(0, 10).forEach(row => {
//             x = 20;
//             row.forEach(cell => {
//                 doc.text(cell.toString(), x, yPos);
//                 x += 40;
//             });
//             yPos += 5;
//         });

//         doc.save(`report_${new Date().toISOString().split('T')[0]}.pdf`);
//         toast.success('Report exported to PDF!');

//     } catch (err) {
//       toast.error('Error generating PDF. Is jsPDF loaded? ' + err.message);
//     }
//   };


//   return (
//     <div className="p-6 bg-gray-50 min-h-screen font-sans">
//       <h1 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">
//         Financial Reports & Analytics
//       </h1>

//       {/* Summary Cards Grid */}
//       <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
//         <MetricCard
//           title="Total Revenue"
//           value={formatCurrency(metrics.revenue)}
//           icon={TrendingUp}
//           colorClass="border-green-500 text-green-700"
//           trend={metrics.revenueTrend}
//         />
//         <MetricCard
//           title="Total Customers"
//           value={metrics.totalCustomers.toLocaleString('en-IN')}
//           icon={Users}
//           colorClass="border-indigo-500 text-indigo-700"
//         />
//         <MetricCard
//           title="Active Customers"
//           value={metrics.activeCustomers.toLocaleString('en-IN')}
//           icon={Zap}
//           colorClass="border-blue-500 text-blue-700"
//         />
//         <MetricCard
//           title="Completed Payments"
//           value={metrics.completedPaymentsCount.toLocaleString('en-IN')}
//           icon={Receipt}
//           colorClass="border-yellow-500 text-yellow-700"
//         />
//       </div>

//       {/* Date Range Filter & Export Options */}
//       <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 mb-8">
//         <h2 className="text-xl font-bold text-gray-700 mb-5 border-b pb-3 flex items-center">
//           <Calendar size={20} className="mr-2 text-gray-400" />
//           Filter & Export Options
//         </h2>
        
//         {/* Date Range Selector (Pill Style) */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-500 mb-2">Payment Date Range</label>
//           <div className="flex bg-gray-100 rounded-xl p-1 max-w-full md:max-w-xl flex-wrap gap-1">
//             {['all', 'today', 'week', 'month', 'year', 'custom'].map(range => (
//               <button
//                 key={range}
//                 className={`flex-1 min-w-[70px] px-3 py-2 text-sm font-semibold rounded-lg transition-all duration-300
//                   ${dateRange === range
//                     ? 'bg-indigo-600 text-white shadow-md'
//                     : 'text-gray-600 hover:bg-gray-200'}`
//                 }
//                 onClick={() => setDateRange(range)}
//               >
//                 {range.charAt(0).toUpperCase() + range.slice(1)}
//               </button>
//             ))}
//           </div>
//         </div>

//         {dateRange === 'custom' && (
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-6">
//             <input
//               type="date"
//               className="w-full p-3 border border-gray-300 rounded-xl text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               placeholder="Start Date"
//             />
//             <input
//               type="date"
//               className="w-full p-3 border border-gray-300 rounded-xl text-gray-700 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               placeholder="End Date"
//             />
//           </div>
//         )}

//         {/* Export Buttons */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100 mt-4">
//           <button className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition shadow-md" onClick={() => handleExport(customers, 'customer_list')}>
//             <FileDown size={20} className="mr-2" />
//             Customers CSV
//           </button>
//           <button className="flex items-center justify-center px-4 py-3 bg-indigo-500 text-white font-semibold rounded-xl hover:bg-indigo-600 transition shadow-md" onClick={() => handleExport(filteredPayments, 'filtered_payments')}>
//             <FileDown size={20} className="mr-2" />
//             Payments CSV
//           </button>
//           <button className="flex items-center justify-center px-4 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition shadow-md" onClick={exportFullReport}>
//             <FileDown size={20} className="mr-2" />
//             Full Report CSV
//           </button>
//           <button className="flex items-center justify-center px-4 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-800 transition shadow-md" onClick={exportPDFReport}>
//             <FileDown size={20} className="mr-2" />
//             PDF Report
//           </button>
//         </div>
//       </div>

//       {/* Detailed Customer Report Table */}
//       <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 overflow-x-auto">
//         <h2 className="text-xl font-bold text-gray-700 mb-5 border-b pb-3 flex items-center">
//           <TrendingUp size={24} className="mr-2 text-gray-400" />
//           Customer Value Overview
//         </h2>
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
//               <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payments</th>
//               <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</th>
//               <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {customers.map(customer => {
//               const custPayments = payments.filter(p => p.customerId === customer.id && p.status === 'completed');
//               const totalPaid = custPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
              
//               const statusClasses = customer.status === 'active' ? 'bg-green-100 text-green-700 border-green-500' :
//                                     customer.status === 'suspended' ? 'bg-red-100 text-red-700 border-red-500' :
//                                     'bg-yellow-100 text-yellow-700 border-yellow-500';

//               return (
//                 <tr key={customer.id} className="hover:bg-gray-50 transition">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{customer.name}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{customer.plan}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(customer.monthlyFee)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{custPayments.length}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-right text-gray-800">{formatCurrency(totalPaid)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-center">
//                     <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${statusClasses}`}>
//                       {customer.status}
//                     </span>
//                   </td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// // Main App component to simulate the environment and load jsPDF
// const App = () => {
//     // State to hold the dynamic data
//     const [customers] = useState(initialCustomers);
//     const [payments] = useState(initialPayments);

//     const contextValue = { customers, payments };

//     return (
//         <DatabaseContext.Provider value={contextValue}>
//             {/* Load jsPDF for the PDF export function to work in this sandbox environment */}
//             <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
//             <Reports />
//         </DatabaseContext.Provider>
//     );
// };

// export default App;