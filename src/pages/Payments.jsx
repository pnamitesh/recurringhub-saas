import React, { useContext, useState } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { formatCurrency, formatDate } from '../utils/helpers';
import { Plus, Download, Link as LinkIcon, Filter } from 'lucide-react';
import jsPDF from 'jspdf';
import { toast } from 'react-toastify';

function Payments() {
  const { customers, payments, addPayment, deletePayment } = useContext(DatabaseContext);
  
  const [showModal, setShowModal] = useState(false);
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [formData, setFormData] = useState({
    customerId: '',
    amount: '',
    date: new Date().toISOString().split('T'),
    method: 'UPI',
    referenceId: '',
    status: 'completed'
  });

  // Filter payments
  let filteredPayments = payments;

  if (filterMethod !== 'all') {
    filteredPayments = filteredPayments.filter(p => p.method === filterMethod);
  }

  if (filterStatus !== 'all') {
    filteredPayments = filteredPayments.filter(p => p.status === filterStatus);
  }

  if (startDate) {
    filteredPayments = filteredPayments.filter(p => new Date(p.date) >= new Date(startDate));
  }

  if (endDate) {
    filteredPayments = filteredPayments.filter(p => new Date(p.date) <= new Date(endDate));
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter valid amount');
      return;
    }

    addPayment(formData);
    
    setFormData({
      customerId: '',
      amount: '',
      date: new Date().toISOString().split('T'),
      method: 'UPI',
      referenceId: '',
      status: 'completed'
    });
    setShowModal(false);
  };

  const generateReceipt = (payment) => {
    try {
      const doc = new jsPDF();
      
      // Colors
      const primaryColor = [0, 102, 204];
      const textColor = [0, 0, 0];
      
      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 30, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text('RecurringHub', 20, 20);
      
      doc.setTextColor(...textColor);
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Receipt', 20, 50);
      
      // Receipt details
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Receipt No: REC-${payment.id}`, 20, 62);
      doc.text(`Date: ${formatDate(payment.date)}`, 20, 72);
      
      // Separator
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 80, 190, 80);
      
      // Customer details
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('Customer Details:', 20, 92);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Name: ${payment.customerName}`, 20, 102);
      
      const customer = customers.find(c => c.id === payment.customerId);
      if (customer) {
        doc.text(`Phone: ${customer.phone}`, 20, 112);
      }
      
      // Payment details
      doc.setFontSize(13);
      doc.setFont(undefined, 'bold');
      doc.text('Payment Details:', 20, 127);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.text(`Amount: ${formatCurrency(payment.amount)}`, 20, 137);
      doc.text(`Method: ${payment.method}`, 20, 147);
      doc.text(`Date: ${formatDate(payment.date)}`, 20, 157);
      doc.text(`Reference: ${payment.referenceId || 'N/A'}`, 20, 167);
      doc.text(`Status: ${payment.status.toUpperCase()}`, 20, 177);
      
      // Separator
      doc.line(20, 185, 190, 185);
      
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your payment!', 20, 200);
      doc.text('This is a computer-generated receipt. No signature required.', 20, 208);
      doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 20, 216);
      
      // Save
      doc.save(`receipt_${payment.id}_${payment.customerName.replace(/\s+/g, '_')}.pdf`);
      toast.success('Receipt downloaded successfully!');
    } catch (err) {
      toast.error('Error generating receipt: ' + err.message);
    }
  };

  const generatePaymentLink = (payment) => {
    const mockLink = `https://rzp.io/i/mock_${Date.now()}_${payment.id}`;
    navigator.clipboard.writeText(mockLink);
    toast.success(`Payment link copied to clipboard!`);
  };

  const handleDeletePayment = (paymentId) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      deletePayment(paymentId);
    }
  };

  // Calculate totals
  const totalCollected = filteredPayments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  const totalPending = filteredPayments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + parseFloat(p.amount), 0);

  return (
    <div>
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="metrics-grid mb-6">
        <div className="metric-card success">
          <div className="metric-label">Total Collected</div>
          <div className="metric-value">{formatCurrency(totalCollected)}</div>
        </div>
        <div className="metric-card warning">
          <div className="metric-label">Pending</div>
          <div className="metric-value">{formatCurrency(totalPending)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Total Payments</div>
          <div className="metric-value">{filteredPayments.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">This Month</div>
          <div className="metric-value">
            {payments.filter(p => {
              const paymentDate = new Date(p.date);
              const now = new Date();
              return paymentDate.getMonth() === now.getMonth() && 
                     paymentDate.getFullYear() === now.getFullYear();
            }).length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} />
          <h2 className="text-lg font-semibold">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Payment Method</label>
            <select
              className="form-select"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="UPI">UPI</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>
          <div>
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div>
            <label className="form-label">From Date</label>
            <input
              type="date"
              className="form-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="form-label">To Date</label>
            <input
              type="date"
              className="form-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Reference</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.slice().reverse().map(payment => (
              <tr key={payment.id}>
                <td className="text-sm">{formatDate(payment.date)}</td>
                <td className="font-semibold">{payment.customerName}</td>
                <td className="font-semibold">{formatCurrency(payment.amount)}</td>
                <td>{payment.method}</td>
                <td className="text-sm text-gray-600">{payment.referenceId || 'N/A'}</td>
                <td>
                  <span className={`badge badge-${payment.status === 'completed' ? 'success' : payment.status === 'pending' ? 'warning' : 'danger'}`}>
                    {payment.status}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => generateReceipt(payment)}
                      title="Download Receipt"
                    >
                      <Download size={16} />
                    </button>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => generatePaymentLink(payment)}
                      title="Generate Payment Link"
                    >
                      <LinkIcon size={16} />
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeletePayment(payment.id)}
                      title="Delete Payment"
                    >
                      ×
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No payments found
          </div>
        )}
      </div>

      {/* Add Payment Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Record New Payment</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className="form-select"
                  value={formData.customerId}
                  onChange={(e) => {
                    const customer = customers.find(c => c.id === parseInt(e.target.value));
                    setFormData({
                      ...formData,
                      customerId: e.target.value,
                      amount: customer?.monthlyFee || ''
                    });
                  }}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {formatCurrency(customer.monthlyFee)} ({customer.plan})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  min="1"
                  step="100"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Date *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-select"
                  value={formData.method}
                  onChange={(e) => setFormData({...formData, method: e.target.value})}
                >
                  <option>UPI</option>
                  <option>Bank Transfer</option>
                  <option>Cash</option>
                  <option>Card</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Reference/Transaction ID</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.referenceId}
                  onChange={(e) => setFormData({...formData, referenceId: e.target.value})}
                  placeholder="Optional (e.g., UPI ID or Bank Reference)"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">
                  Record Payment
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Payments;

// ---------------------------------------------------


// import React, { useState, useMemo, useContext, createContext, useCallback } from 'react';
// import { Plus, Download, Link as LinkIcon, Filter, X, Check, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

// // 0. CDN SCRIPT (jsPDF)
// // We need to tell the App to load the jsPDF script.
// // We'll add this script in the main App component's return.

// // 1. HELPER FUNCTIONS
// // ============================================================================

// /**
//  * Formats a number as Indian Rupees (INR).
//  */
// const formatCurrency = (amount) => {
//   if (typeof amount !== 'number' && typeof amount !== 'string') {
//     amount = 0;
//   }
//   const numericAmount = parseFloat(String(amount).replace(/[^0-9.-]+/g,""));
//   if (isNaN(numericAmount)) {
//     return '₹0';
//   }
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: 'INR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(numericAmount);
// };

// /**
//  * Formats a date string.
//  * @param {string} dateString - The date string to format.
//  * @returns {string} - The formatted date string.
//  */
// const formatDate = (dateString) => {
//   return new Date(dateString).toLocaleDateString('en-IN', {
//     day: '2-digit',
//     month: 'short',
//     year: 'numeric',
//   });
// };

// /**
//  * Gets today's date in 'YYYY-MM-DD' format.
//  */
// const getTodayDate = () => {
//   return new Date().toISOString().split('T')[0];
// };


// // 2. DATABASE CONTEXT (with full CRUD)
// // ============================================================================

// const mockCustomers = [
//   { id: 1, name: 'Rohan Sharma', phone: '98XXXX1234', plan: 'Premium', monthlyFee: '1500', status: 'active', dueDate: '5', lastPaymentDate: '2025-11-01' },
//   { id: 2, name: 'Priya Singh', phone: '99XXXX5678', plan: 'Standard', monthlyFee: '1000', status: 'active', dueDate: '10', lastPaymentDate: '2025-10-11' },
//   { id: 3, name: 'Amit Patel', phone: '97XXXX9012', plan: 'Basic', monthlyFee: '700', status: 'active', dueDate: '15', lastPaymentDate: '2025-11-10' },
//   { id: 4, name: 'Sunita Rao', phone: '96XXXX3456', plan: 'Premium', monthlyFee: '1500', status: 'active', dueDate: '5', lastPaymentDate: '2025-09-05' },
//   { id: 5, name: 'Vikram Reddy', phone: '95XXXX7890', plan: 'Standard', monthlyFee: '1000', status: 'inactive', dueDate: '20', lastPaymentDate: '2025-10-20' },
//   { id: 6, name: 'Anjali Desai', phone: '94XXXX2345', plan: 'Basic', monthlyFee: '700', status: 'active', dueDate: '12', lastPaymentDate: '2025-11-11' },
// ];

// const mockPayments = [
//   { id: 1, customerId: 1, customerName: 'Rohan Sharma', amount: '1500', date: '2025-11-01', method: 'UPI', status: 'completed', referenceId: 'upi-123' },
//   { id: 2, customerId: 3, customerName: 'Amit Patel', amount: '700', date: '2025-11-10', method: 'Card', status: 'completed', referenceId: 'card-456' },
//   { id: 3, customerId: 6, customerName: 'Anjali Desai', amount: '700', date: '2025-11-11', method: 'Cash', status: 'completed', referenceId: 'N/A' },
//   { id: 4, customerId: 2, customerName: 'Priya Singh', amount: '1000', date: '2025-10-11', method: 'UPI', status: 'completed', referenceId: 'upi-789' },
//   { id: 5, customerId: 5, customerName: 'Vikram Reddy', amount: '1000', date: '2025-10-20', method: 'Card', status: 'completed', referenceId: 'card-012' },
//   { id: 6, customerId: 4, customerName: 'Sunita Rao', amount: '1500', date: '2025-09-05', method: 'Cash', status: 'completed', referenceId: 'N/A' },
//   { id: 7, customerId: 2, customerName: 'Priya Singh', amount: '1000', date: '2025-11-12', method: 'UPI', status: 'pending', referenceId: 'upi-345' },
// ];

// const DatabaseContext = createContext();

// const DatabaseProvider = ({ children }) => {
//   const [customers, setCustomers] = useState(mockCustomers);
//   const [payments, setPayments] = useState(mockPayments);
//   const toast = useToast();

//   const addPayment = (paymentData) => {
//     const customer = customers.find(c => c.id === parseInt(paymentData.customerId));
//     if (!customer) {
//       toast.error("Customer not found!");
//       return;
//     }
    
//     const newPayment = {
//       ...paymentData,
//       id: Math.max(0, ...payments.map(p => p.id)) + 1, // Simple ID generation
//       customerName: customer.name,
//       amount: parseFloat(paymentData.amount),
//     };

//     setPayments(prevPayments => [newPayment, ...prevPayments]);
//     toast.success('Payment recorded successfully!');
//   };

//   const deletePayment = (paymentId) => {
//     setPayments(prevPayments => prevPayments.filter(p => p.id !== paymentId));
//     toast.success('Payment deleted successfully.');
//   };

//   const value = { customers, payments, addPayment, deletePayment };

//   return (
//     <DatabaseContext.Provider value={value}>
//       {children}
//     </DatabaseContext.Provider>
//   );
// };

// // 3. TOAST NOTIFICATION SYSTEM (Replaces react-toastify)
// // ============================================================================

// const ToastContext = createContext();

// const ToastProvider = ({ children }) => {
//   const [toasts, setToasts] = useState([]);

//   const toast = useCallback((message, type = 'info') => {
//     const id = Date.now();
//     setToasts(prev => [...prev, { id, message, type }]);
//     setTimeout(() => {
//       setToasts(prev => prev.filter(t => t.id !== id));
//     }, 3000);
//   }, []);

//   const toastControls = {
//     success: (message) => toast(message, 'success'),
//     error: (message) => toast(message, 'error'),
//     info: (message) => toast(message, 'info'),
//     warning: (message) => toast(message, 'warning'),
//   };

//   return (
//     <ToastContext.Provider value={toastControls}>
//       {children}
//       <ToastContainer toasts={toasts} />
//     </ToastContext.Provider>
//   );
// };

// const useToast = () => useContext(ToastContext);

// const ToastContainer = ({ toasts }) => (
//   <div className="fixed top-5 right-5 z-50">
//     {toasts.map(toast => (
//       <Toast key={toast.id} {...toast} />
//     ))}
//   </div>
// );

// const Toast = ({ message, type }) => {
//   const icons = {
//     success: <CheckCircle className="text-green-500" />,
//     error: <XCircle className="text-red-500" />,
//     info: <Info className="text-blue-500" />,
//     warning: <AlertTriangle className="text-amber-500" />,
//   };
  
//   const EMOJIS = {
//     success: '🎉',
//     error: '🚨',
//     info: 'ℹ️',
//     warning: '⚠️'
//   }

//   return (
//     <div className="bg-white rounded-lg shadow-lg p-4 mb-2 flex items-center animate-slide-in">
//       <div className="flex-shrink-0 text-2xl mr-3">{EMOJIS[type]}</div>
//       <div className="text-gray-800">{message}</div>
//     </div>
//   );
// };

// // 4. CONFIRMATION MODAL (Replaces window.confirm)
// // ============================================================================

// const ConfirmationContext = createContext();

// const ConfirmationProvider = ({ children }) => {
//   const [options, setOptions] = useState(null);
//   const resolveRef = React.useRef(null);

//   const confirm = useCallback((options) => {
//     return new Promise((resolve) => {
//       setOptions(options);
//       resolveRef.current = resolve;
//     });
//   }, []);

//   const handleClose = (value) => {
//     if (resolveRef.current) {
//       resolveRef.current(value);
//     }
//     setOptions(null);
//   };

//   return (
//     <ConfirmationContext.Provider value={confirm}>
//       {children}
//       {options && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
//           <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm m-4">
//             <div className="flex items-start">
//               <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-red-100 mr-4">
//                 <AlertTriangle className="w-6 h-6 text-red-600" />
//               </div>
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900">{options.title}</h3>
//                 <p className="text-sm text-gray-600 mt-1">{options.message}</p>
//               </div>
//             </div>
//             <div className="flex justify-end space-x-3 mt-6">
//               <button
//                 onClick={() => handleClose(false)}
//                 className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//               >
//                 {options.cancelText || 'Cancel'}
//               </button>
//               <button
//                 onClick={() => handleClose(true)}
//                 className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
//               >
//                 {options.confirmText || 'Delete'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </ConfirmationContext.Provider>
//   );
// };

// const useConfirm = () => useContext(ConfirmationContext);

// // 5. REUSABLE UI COMPONENTS
// // ============================================================================

// const Card = ({ children, className = '' }) => (
//   <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
//     {children}
//   </div>
// );

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

// const Modal = ({ show, onClose, title, children }) => {
//   if (!show) return null;

//   return (
//     <div 
//       className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
//       onClick={onClose}
//     >
//       <div 
//         className="bg-white rounded-xl shadow-2xl w-full max-w-lg m-4"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="flex justify-between items-center p-5 border-b border-gray-200">
//           <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
//           <button 
//             onClick={onClose} 
//             className="text-gray-400 hover:text-gray-600 rounded-full p-1 hover:bg-gray-100"
//           >
//             <X size={20} />
//           </button>
//         </div>
//         <div className="p-5">
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// const FormLabel = ({ children }) => (
//   <label className="block text-sm font-medium text-gray-700 mb-1">
//     {children}
//   </label>
// );

// const FormInput = (props) => (
//   <input 
//     {...props}
//     className="block w-full text-sm text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
//   />
// );

// const FormSelect = (props) => (
//   <select
//     {...props}
//     className="block w-full text-sm text-gray-900 border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
//   >
//     {props.children}
//   </select>
// );


// // 6. PAYMENTS COMPONENT (Main)
// // ============================================================================

// function Payments() {
//   const { customers, payments, addPayment, deletePayment } = useContext(DatabaseContext);
//   const toast = useToast();
//   const confirm = useConfirm();

//   const [showModal, setShowModal] = useState(false);
//   const [filterMethod, setFilterMethod] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [startDate, setStartDate] = useState('');
//   const [endDate, setEndDate] = useState('');

//   const [formData, setFormData] = useState({
//     customerId: '',
//     amount: '',
//     date: getTodayDate(),
//     method: 'UPI',
//     referenceId: '',
//     status: 'completed'
//   });

//   // Filter payments
//   const filteredPayments = useMemo(() => {
//     let filtered = payments;

//     if (filterMethod !== 'all') {
//       filtered = filtered.filter(p => p.method === filterMethod);
//     }
//     if (filterStatus !== 'all') {
//       filtered = filtered.filter(p => p.status === filterStatus);
//     }
//     if (startDate) {
//       filtered = filtered.filter(p => new Date(p.date) >= new Date(startDate));
//     }
//     if (endDate) {
//       filtered = filtered.filter(p => new Date(p.date) <= new Date(endDate));
//     }
//     return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
//   }, [payments, filterMethod, filterStatus, startDate, endDate]);

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!formData.customerId) {
//       toast.error('Please select a customer');
//       return;
//     }
//     if (!formData.amount || parseFloat(formData.amount) <= 0) {
//       toast.error('Please enter a valid amount');
//       return;
//     }

//     addPayment(formData);
    
//     setFormData({
//       customerId: '',
//       amount: '',
//       date: getTodayDate(),
//       method: 'UPI',
//       referenceId: '',
//       status: 'completed'
//     });
//     setShowModal(false);
//   };

//   const generateReceipt = (payment) => {
//     if (typeof window.jspdf === 'undefined') {
//       toast.error("jsPDF library is not loaded. Please try again.");
//       return;
//     }
    
//     try {
//       const { jsPDF } = window.jspdf;
//       const doc = new jsPDF();
      
//       const primaryColor = [0, 102, 204];
//       const textColor = [0, 0, 0];
      
//       doc.setFillColor(...primaryColor);
//       doc.rect(0, 0, 210, 30, 'F');
      
//       doc.setTextColor(255, 255, 255);
//       doc.setFontSize(24);
//       doc.setFont(undefined, 'bold');
//       doc.text('RecurringHub', 20, 20);
      
//       doc.setTextColor(...textColor);
//       doc.setFontSize(16);
//       doc.setFont(undefined, 'bold');
//       doc.text('Payment Receipt', 20, 50);
      
//       doc.setFontSize(11);
//       doc.setFont(undefined, 'normal');
//       doc.text(`Receipt No: REC-${payment.id}`, 20, 62);
//       doc.text(`Date: ${formatDate(payment.date)}`, 20, 72);
      
//       doc.setDrawColor(200, 200, 200);
//       doc.line(20, 80, 190, 80);
      
//       doc.setFontSize(13);
//       doc.setFont(undefined, 'bold');
//       doc.text('Customer Details:', 20, 92);
//       doc.setFontSize(11);
//       doc.setFont(undefined, 'normal');
//       doc.text(`Name: ${payment.customerName}`, 20, 102);
      
//       const customer = customers.find(c => c.id === payment.customerId);
//       if (customer) {
//         doc.text(`Phone: ${customer.phone}`, 20, 112);
//       }
      
//       doc.setFontSize(13);
//       doc.setFont(undefined, 'bold');
//       doc.text('Payment Details:', 20, 127);
//       doc.setFontSize(11);
//       doc.setFont(undefined, 'normal');
//       doc.text(`Amount: ${formatCurrency(payment.amount)}`, 20, 137);
//       doc.text(`Method: ${payment.method}`, 20, 147);
//       doc.text(`Date: ${formatDate(payment.date)}`, 20, 157);
//       doc.text(`Reference: ${payment.referenceId || 'N/A'}`, 20, 167);
//       doc.text(`Status: ${payment.status.toUpperCase()}`, 20, 177);
      
//       doc.line(20, 185, 190, 185);
      
//       doc.setFontSize(10);
//       doc.setTextColor(100, 100, 100);
//       doc.text('Thank you for your payment!', 20, 200);
//       doc.text('This is a computer-generated receipt.', 20, 208);
      
//       doc.save(`receipt_${payment.id}_${payment.customerName.replace(/\s+/g, '_')}.pdf`);
//       toast.success('Receipt downloaded!');
//     } catch (err) {
//       console.error("Error generating PDF: ", err);
//       toast.error('Error generating receipt: ' + err.message);
//     }
//   };

//   const generatePaymentLink = (payment) => {
//     const mockLink = `https://rzp.io/i/mock_${Date.now()}_${payment.id}`;
    
//     // Fallback for clipboard copy in iFrames
//     try {
//       const ta = document.createElement('textarea');
//       ta.value = mockLink;
//       ta.style.position = 'fixed';
//       ta.style.left = '-9999px';
//       document.body.appendChild(ta);
//       ta.select();
//       document.execCommand('copy');
//       document.body.removeChild(ta);
//       toast.success('Payment link copied to clipboard!');
//     } catch (err) {
//       console.error('Clipboard copy failed:', err);
//       toast.error('Failed to copy link.');
//     }
//   };

//   const handleDeletePayment = async (paymentId) => {
//     const confirmed = await confirm({
//       title: 'Delete Payment?',
//       message: 'Are you sure you want to delete this payment record? This action cannot be undone.',
//       confirmText: 'Delete',
//       cancelText: 'Cancel'
//     });

//     if (confirmed) {
//       deletePayment(paymentId);
//     }
//   };

//   // Calculate totals from *filtered* payments
//   const totalCollected = filteredPayments
//     .filter(p => p.status === 'completed')
//     .reduce((sum, p) => sum + parseFloat(p.amount), 0);

//   const totalPending = filteredPayments
//     .filter(p => p.status === 'pending')
//     .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    
//   const thisMonthCount = payments.filter(p => {
//     const paymentDate = new Date(p.date);
//     const now = new Date();
//     return paymentDate.getMonth() === now.getMonth() && 
//            paymentDate.getFullYear() === now.getFullYear();
//   }).length;

//   return (
//     <div className="p-6 md:p-10">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
//         <button 
//           onClick={() => setShowModal(true)}
//           className="flex items-center gap-2 mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//         >
//           <Plus size={18} />
//           Record Payment
//         </button>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
//         <MetricCard
//           title="Total Collected (Filtered)"
//           value={formatCurrency(totalCollected)}
//           icon={<Check size={24} />}
//           color="green"
//         />
//         <MetricCard
//           title="Total Pending (Filtered)"
//           value={formatCurrency(totalPending)}
//           icon={<AlertTriangle size={24} />}
//           color="amber"
//         />
//         <MetricCard
//           title="Total Payments (Filtered)"
//           value={filteredPayments.length}
//           icon={<Download size={24} />}
//           color="blue"
//         />
//         <MetricCard
//           title="Payments (This Month)"
//           value={thisMonthCount}
//           detail={`Total all time: ${payments.length}`}
//           icon={<Filter size={24} />}
//           color="red" // Using red to match the original 'metric-card'
//         />
//       </div>

//       {/* Filters */}
//       <Card className="mb-6">
//         <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
//           <Filter size={20} className="mr-2" />
//           Filter Payments
//         </h2>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//           <div>
//             <FormLabel>Payment Method</FormLabel>
//             <FormSelect value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)}>
//               <option value="all">All Methods</option>
//               <option value="UPI">UPI</option>
//               <option value="Bank Transfer">Bank Transfer</option>
//               <option value="Cash">Cash</option>
//               <option value="Card">Card</option>
//             </FormSelect>
//           </div>
//           <div>
//             <FormLabel>Status</FormLabel>
//             <FormSelect value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//               <option value="all">All Status</option>
//               <option value="completed">Completed</option>
//               <option value="pending">Pending</option>
//               <option value="failed">Failed</option>
//             </FormSelect>
//           </div>
//           <div>
//             <FormLabel>From Date</FormLabel>
//             <FormInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//           </div>
//           <div>
//             <FormLabel>To Date</FormLabel>
//             <FormInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
//           </div>
//         </div>
//       </Card>

//       {/* Payments Table */}
//       <Card className="overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {filteredPayments.map(payment => (
//                 <tr key={payment.id} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(payment.date)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.customerName}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{payment.method}</td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.referenceId || 'N/A'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <Badge color={payment.status === 'completed' ? 'green' : payment.status === 'pending' ? 'amber' : 'red'}>
//                       {payment.status}
//                     </Badge>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                     <div className="flex space-x-2">
//                       <button 
//                         onClick={() => generateReceipt(payment)}
//                         title="Download Receipt"
//                         className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600"
//                       >
//                         <Download size={16} />
//                       </button>
//                       <button 
//                         onClick={() => generatePaymentLink(payment)}
//                         title="Copy Payment Link"
//                         className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-blue-600"
//                       >
//                         <LinkIcon size={16} />
//                       </button>
//                       <button 
//                         onClick={() => handleDeletePayment(payment.id)}
//                         title="Delete Payment"
//                         className="p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red-600"
//                       >
//                         <X size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {filteredPayments.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               No payments found matching your filters.
//             </div>
//           )}
//         </div>
//       </Card>

//       {/* Add Payment Modal */}
//       <Modal show={showModal} onClose={() => setShowModal(false)} title="Record New Payment">
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <FormLabel>Customer *</FormLabel>
//             <FormSelect
//               value={formData.customerId}
//               onChange={(e) => {
//                 const customer = customers.find(c => c.id === parseInt(e.target.value));
//                 setFormData({
//                   ...formData,
//                   customerId: e.target.value,
//                   amount: customer?.monthlyFee || ''
//                 });
//               }}
//               required
//             >
//               <option value="">Select Customer</option>
//               {customers.filter(c => c.status === 'active').map(customer => (
//                 <option key={customer.id} value={customer.id}>
//                   {customer.name} - {formatCurrency(customer.monthlyFee)} ({customer.plan})
//                 </option>
//               ))}
//             </FormSelect>
//           </div>
          
//           <div>
//             <FormLabel>Amount (₹) *</FormLabel>
//             <FormInput
//               type="number"
//               value={formData.amount}
//               onChange={(e) => setFormData({...formData, amount: e.target.value})}
//               min="1"
//               step="1"
//               required
//             />
//           </div>

//           <div>
//             <FormLabel>Payment Date *</FormLabel>
//             <FormInput
//               type="date"
//               value={formData.date}
//               onChange={(e) => setFormData({...formData, date: e.target.value})}
//               required
//             />
//           </div>

//           <div>
//             <FormLabel>Payment Method *</FormLabel>
//             <FormSelect
//               value={formData.method}
//               onChange={(e) => setFormData({...formData, method: e.target.value})}
//             >
//               <option>UPI</option>
//               <option>Bank Transfer</option>
//               <option>Cash</option>
//               <option>Card</option>
//             </FormSelect>
//           </div>

//           <div>
//             <FormLabel>Reference/Transaction ID</FormLabel>
//             <FormInput
//               type="text"
//               value={formData.referenceId}
//               onChange={(e) => setFormData({...formData, referenceId: e.target.value})}
//               placeholder="Optional (e.g., UPI ID or Bank Reference)"
//             />
//           </div>

//           <div className="flex justify-end gap-3 pt-4">
//             <button 
//               type="button" 
//               onClick={() => setShowModal(false)}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//             >
//               Cancel
//             </button>
//             <button 
//               type="submit" 
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700"
//             >
//               Record Payment
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </div>
//   );
// }

// // 7. MAIN APP COMPONENT
// // ============================================================================

// export default function App() {
  
//   React.useEffect(() => {
//     const script = document.createElement('script');
//     script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
//     script.async = true;
//     document.body.appendChild(script);

//     return () => {
//       // Clean up script if component unmounts
//       if (document.body.contains(script)) {
//         document.body.removeChild(script);
//       }
//     }
//   }, []); // Empty dependency array so it runs once

//   return (
//     <>
//       {/* Load external jspdf script */}
//       {/* <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script> */}
    
//       <ToastProvider>
//         <ConfirmationProvider>
//           <DatabaseProvider>
//             <div className="min-h-screen bg-gray-100 font-inter text-gray-900">
//               <style>{`
//                 /* Simple animations for modal and toasts */
//                 @keyframes fade-in {
//                   from { opacity: 0; }
//                   to { opacity: 1; }
//                 }
//                 @keyframes slide-in {
//                   from { transform: translateX(100%); opacity: 0; }
//                   to { transform: translateX(0); opacity: 1; }
//                 }
//                 .animate-fade-in { animation: fade-in 0.2s ease-out; }
//                 .animate-slide-in { animation: slide-in 0.3s ease-out; }
//               `}</style>
              
//               {/* Here you could have a Sidebar and Header */}
//               <main>
//                 <Payments />
//               </main>
//             </div>
//           </DatabaseProvider>
//         </ConfirmationProvider>
//       </ToastProvider>
//     </>
//   );
// }