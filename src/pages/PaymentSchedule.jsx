import React, { useContext, useState } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { DateUtils } from '../utils/dateUtils';
import { formatCurrency } from '../utils/helpers';
import { Calendar, Send } from 'lucide-react';

function PaymentSchedule() {
  const { customers, addReminder } = useContext(DatabaseContext);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const getPaymentSchedule = (customer) => {
    return DateUtils.getPaymentSchedule(customer);
  };

  const sendScheduleReminder = (customer, scheduleItem) => {
    const message = `Payment reminder: ${formatCurrency(customer.monthlyFee)} due on ${scheduleItem.dueDate}`;
    addReminder({
      customerId: customer.id,
      customerName: customer.name,
      type: 'sms',
      message: message,
      reminderType: 'schedule'
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment Schedule</h1>

      {/* Customer Selector */}
      <div className="card mb-6">
        <div className="form-group">
          <label className="form-label">Select Customer</label>
          <select
            className="form-select"
            value={selectedCustomer?.id || ''}
            onChange={(e) => {
              const customer = customers.find(c => c.id === parseInt(e.target.value));
              setSelectedCustomer(customer);
            }}
          >
            <option value="">Choose a customer...</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.plan}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedCustomer && (
        <div>
          {/* Customer Info */}
          <div className="card mb-6">
            <h2 className="text-xl font-semibold mb-4">
              <Calendar size={24} className="inline mr-2" />
              {selectedCustomer.name}'s Payment Schedule
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600">Plan</div>
                <div className="font-semibold">{selectedCustomer.plan}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Monthly Fee</div>
                <div className="font-semibold">{formatCurrency(selectedCustomer.monthlyFee)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Due Date</div>
                <div className="font-semibold">{selectedCustomer.dueDate}th of month</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Member Since</div>
                <div className="font-semibold">{new Date(selectedCustomer.startDate).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
          </div>

          {/* Schedule Table */}
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Due Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {getPaymentSchedule(selectedCustomer).map((schedule, idx) => (
                  <tr key={idx}>
                    <td className="font-semibold">
                      {schedule.month} {schedule.year}
                      {schedule.isThisMonth && <span className="ml-2 badge badge-info">Current</span>}
                    </td>
                    <td>{schedule.dueDate}</td>
                    <td>{formatCurrency(schedule.amount)}</td>
                    <td>
                      <span className={`badge ${schedule.isPast ? 'badge-danger' : 'badge-warning'}`}>
                        {schedule.isPast ? 'Past' : 'Upcoming'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => sendScheduleReminder(selectedCustomer, schedule)}
                      >
                        <Send size={16} />
                        Remind
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="card mt-6">
            <h3 className="text-lg font-semibold mb-3">6-Month Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-gray-600">Total Due (6 months)</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(selectedCustomer.monthlyFee * 6)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Months</div>
                <div className="text-2xl font-bold">6</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Monthly Amount</div>
                <div className="text-2xl font-bold">
                  {formatCurrency(selectedCustomer.monthlyFee)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedCustomer && (
        <div className="card text-center py-12 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a customer to view their payment schedule</p>
        </div>
      )}
    </div>
  );
}

export default PaymentSchedule;
