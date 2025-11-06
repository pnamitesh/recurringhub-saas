import React, { useContext, useState } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { formatCurrency, formatDate, calculateStatus } from '../utils/helpers';
import { DateUtils } from '../utils/dateUtils';
import { User, Phone, Mail, CreditCard, Calendar, FileText } from 'lucide-react';

function CustomerProfiles() {
  const { customers, payments } = useContext(DatabaseContext);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const customerPayments = selectedCustomer
    ? payments.filter(p => p.customerId === selectedCustomer.id)
    : [];

  if (!selectedCustomer) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Customer Profiles</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map(customer => (
            <div
              key={customer.id}
              className="card cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedCustomerId(customer.id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User size={24} className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{customer.name}</h3>
                  <p className="text-sm text-gray-600">{customer.plan}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                  {customer.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const paymentHistory = customerPayments.slice().reverse();
  const totalPaid = customerPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
  const avgPayment = customerPayments.length > 0 ? totalPaid / customerPayments.length : 0;
  const daysOverdue = DateUtils.daysOverdue(selectedCustomer.lastPaymentDate, selectedCustomer.dueDate);

  return (
    <div>
      <button
        className="btn btn-secondary mb-4"
        onClick={() => setSelectedCustomerId(null)}
      >
        ← Back to Profiles
      </button>

      {/* Customer Header */}
      <div className="card mb-6 bg-gradient-to-r from-blue-50 to-blue-100">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{selectedCustomer.name}</h1>
            <p className="text-gray-600">{selectedCustomer.plan} Plan Member</p>
          </div>
          <div className="text-right">
            <span className={`badge ${selectedCustomer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
              {selectedCustomer.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={20} className="text-blue-600" />
            <span className="text-sm text-gray-600">Phone</span>
          </div>
          <p className="font-semibold">{selectedCustomer.phone}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} className="text-green-600" />
            <span className="text-sm text-gray-600">Member Since</span>
          </div>
          <p className="font-semibold">{formatDate(selectedCustomer.startDate)}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard size={20} className="text-purple-600" />
            <span className="text-sm text-gray-600">Monthly Fee</span>
          </div>
          <p className="font-semibold">{formatCurrency(selectedCustomer.monthlyFee)}</p>
        </div>
      </div>

      {/* Payment Information */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="metric-card success">
          <div className="metric-label">Total Paid</div>
          <div className="metric-value">{formatCurrency(totalPaid)}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Payments</div>
          <div className="metric-value">{customerPayments.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Avg Payment</div>
          <div className="metric-value">{formatCurrency(avgPayment)}</div>
        </div>
        <div className={`metric-card ${daysOverdue > 0 ? 'danger' : 'success'}`}>
          <div className="metric-label">Days Overdue</div>
          <div className="metric-value">{daysOverdue}</div>
        </div>
      </div>

      {/* Payment History */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText size={24} />
          Payment History
        </h2>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistory.length > 0 ? (
                paymentHistory.map(payment => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.date)}</td>
                    <td className="font-semibold">{formatCurrency(payment.amount)}</td>
                    <td>{payment.method}</td>
                    <td className="text-sm text-gray-600">{payment.referenceId || 'N/A'}</td>
                    <td>
                      <span className="badge badge-success">{payment.status}</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No payments recorded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CustomerProfiles;
