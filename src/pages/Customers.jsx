import React, { useContext, useState } from 'react';
import { DatabaseContext } from '../contexts/DatabaseContext';
import { formatCurrency, validatePhone, calculateStatus, getStatusBadgeClass } from '../utils/helpers';
import { Plus, Search, Edit, Trash2, FileDown, FileUp } from 'lucide-react';
import Papa from 'papaparse';

function Customers() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useContext(DatabaseContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    plan: 'Premium',
    monthlyFee: '',
    dueDate: '1',
    startDate: new Date().toISOString().split('T')
  });
  const [errors, setErrors] = useState({});

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm);
    const status = calculateStatus(customer);
    const matchesStatus = statusFilter === 'all' || status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate
    const newErrors = {};
    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }
    if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Invalid phone number (must be 10 digits starting with 6-9)';
    }
    if (!formData.monthlyFee || formData.monthlyFee < 100) {
      newErrors.monthlyFee = 'Monthly fee must be at least ₹100';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      plan: 'Premium',
      monthlyFee: '',
      dueDate: '1',
      startDate: new Date().toISOString().split('T')
    });
    setErrors({});
    setEditingCustomer(null);
    setShowModal(false);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      phone: customer.phone,
      plan: customer.plan,
      monthlyFee: customer.monthlyFee,
      dueDate: customer.dueDate,
      startDate: customer.startDate
    });
    setShowModal(true);
  };

  const handleDelete = (customer) => {
    if (window.confirm(`Are you sure you want to delete ${customer.name}?`)) {
      deleteCustomer(customer.id);
    }
  };

  const handleCSVImport = (e) => {
    const file = e.target.files;
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        results.data.forEach(row => {
          if (row.name && row.phone) {
            addCustomer({
              name: row.name,
              phone: row.phone,
              plan: row.plan || 'Standard',
              monthlyFee: row.monthlyFee || row.fee || 3000,
              dueDate: row.dueDate || 5,
              startDate: row.startDate || new Date().toISOString().split('T')
            });
          }
        });
      }
    });
  };

  const handleCSVExport = () => {
    const csv = Papa.unparse(customers.map(c => ({
      name: c.name,
      phone: c.phone,
      plan: c.plan,
      monthlyFee: c.monthlyFee,
      dueDate: c.dueDate,
      status: c.status,
      startDate: c.startDate,
      lastPaymentDate: c.lastPaymentDate
    })));

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `customers_${new Date().toISOString().split('T')}.csv`;
    link.click();
  };

  return (
    <div>
      <div className="flex-between mb-6">
        <h1 className="text-2xl font-bold">Customer Management</h1>
        <div className="flex gap-2">
          <label className="btn btn-secondary btn-sm cursor-pointer">
            <FileUp size={16} />
            Import CSV
            <input type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
          </label>
          <button className="btn btn-secondary btn-sm" onClick={handleCSVExport}>
            <FileDown size={16} />
            Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Add Customer
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="search-filter-bar">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="     Search by name or phone..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="form-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Customer Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Monthly Fee</th>
              <th>Due Date</th>
              <th>Payment Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map(customer => {
              const status = calculateStatus(customer);
              return (
                <tr key={customer.id}>
                  <td className="font-semibold">{customer.name}</td>
                  <td>{customer.phone}</td>
                  <td>
                    <span className="badge badge-info">{customer.plan}</span>
                  </td>
                  <td>{formatCurrency(customer.monthlyFee)}</td>
                  <td>{customer.dueDate}th</td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(status)}`}>
                      {status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleEdit(customer)}
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(customer)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No customers found
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => resetForm()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h2>
              <button className="modal-close" onClick={resetForm}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone *</label>
                <input
                  type="tel"
                  className="form-input"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="10-digit number"
                  required
                />
                {errors.phone && <div className="form-error">{errors.phone}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Plan *</label>
                <select
                  className="form-select"
                  value={formData.plan}
                  onChange={(e) => setFormData({...formData, plan: e.target.value})}
                >
                  <option>Premium</option>
                  <option>Standard</option>
                  <option>Basic</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Monthly Fee (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={formData.monthlyFee}
                  onChange={(e) => setFormData({...formData, monthlyFee: e.target.value})}
                  min="100"
                  required
                />
                {errors.monthlyFee && <div className="form-error">{errors.monthlyFee}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Due Date (Day of Month)</label>
                <select
                  className="form-select"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                >
                  {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingCustomer ? 'Update' : 'Add'} Customer
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
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

export default Customers;

