import React, { useContext, useState } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { BulkOperationsService } from '../services/bulkOperations';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';

function BulkOperations() {
  const { customers, payments, addCustomer, addReminder, updateCustomer } = useContext(DatabaseContext);
  
  const [operation, setOperation] = useState('import');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [reminderTemplate, setReminderTemplate] = useState('Hi {NAME}, your payment of ₹{FEE} is due. Please pay to continue service.');

  const handleFileImport = async (e) => {
    const file = e.target.files;
    if (!file) return;

    setLoading(true);
    try {
      const result = await BulkOperationsService.bulkImportCustomers(file, addCustomer);
      setResult(result);
      toast.success(`Imported ${result.successful} customers successfully!`);
    } catch (err) {
      toast.error('Error importing customers: ' + err.message);
    }
    setLoading(false);
  };

  const handleBulkReminders = async () => {
    if (selectedCustomers.length === 0) {
      toast.warning('Please select customers');
      return;
    }

    setLoading(true);
    try {
      const customersToRemind = customers.filter(c => selectedCustomers.includes(c.id));
      const result = await BulkOperationsService.bulkSendReminders(
        customersToRemind,
        addReminder,
        reminderTemplate
      );
      setResult(result);
      toast.success(`Reminders sent to ${result.successful} customers!`);
    } catch (err) {
      toast.error('Error sending reminders: ' + err.message);
    }
    setLoading(false);
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        <Zap size={32} className="inline mr-2" />
        Bulk Operations
      </h1>

      {/* Operation Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={`btn ${operation === 'import' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setOperation('import')}
        >
          Import Customers
        </button>
        <button
          className={`btn ${operation === 'reminders' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setOperation('reminders')}
        >
          Send Bulk Reminders
        </button>
        <button
          className={`btn ${operation === 'status' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setOperation('status')}
        >
          Update Status
        </button>
      </div>

      {/* Import Customers */}
      {operation === 'import' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Import Customers from CSV</h2>
          
          <div className="mb-4 p-4 bg-blue-50 rounded">
            <p className="text-sm text-blue-900">
              <strong>CSV Format:</strong> Name, Phone, Plan, MonthlyFee, DueDate
            </p>
            <p className="text-sm text-blue-900">
              Example: John Doe,9876543210,Premium,5000,5
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Select CSV File</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileImport}
              disabled={loading}
              className="form-input"
            />
          </div>

          {result && (
            <div className={`p-4 rounded ${result.successful > result.failed ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className={result.successful > 0 ? 'text-green-600' : 'text-yellow-600'} />
                <strong>Import Result</strong>
              </div>
              <p>Successful: {result.successful}</p>
              <p>Failed: {result.failed}</p>
              {result.errors.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Errors:</p>
                  <ul className="text-sm">
                    {result.errors.slice(0, 5).map((err, idx) => (
                      <li key={idx}>- {err}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Send Bulk Reminders */}
      {operation === 'reminders' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Send Bulk Reminders</h2>

          <div className="form-group mb-4">
            <label className="form-label">Message Template</label>
            <textarea
              className="form-textarea"
              rows="3"
              value={reminderTemplate}
              onChange={(e) => setReminderTemplate(e.target.value)}
              placeholder="Use {NAME}, {PLAN}, {FEE} as placeholders"
            />
          </div>

          <div className="mb-4">
            <button
              className="btn btn-secondary mb-2"
              onClick={handleSelectAll}
            >
              {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
            </button>
            <div className="text-sm text-gray-600">
              Selected: {selectedCustomers.length} / {customers.length}
            </div>
          </div>

          <div className="table-container mb-4">
            <table className="table">
              <thead>
                <tr>
                  <th><input type="checkbox" onChange={handleSelectAll} checked={selectedCustomers.length === customers.length} /></th>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Plan</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(customer => (
                  <tr key={customer.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedCustomers([...selectedCustomers, customer.id]);
                          } else {
                            setSelectedCustomers(selectedCustomers.filter(id => id !== customer.id));
                          }
                        }}
                      />
                    </td>
                    <td>{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>{customer.plan}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleBulkReminders}
            disabled={loading || selectedCustomers.length === 0}
          >
            Send to {selectedCustomers.length} Customer(s)
          </button>

          {result && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-green-600" />
                <strong>Reminders Sent</strong>
              </div>
              <p>Successful: {result.successful}</p>
              <p>Failed: {result.failed}</p>
            </div>
          )}
        </div>
      )}

      {/* Update Status */}
      {operation === 'status' && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Update Customer Status</h2>
          <p className="text-gray-600 mb-4">Coming soon: Bulk update customer statuses</p>
        </div>
      )}
    </div>
  );
}

export default BulkOperations;
