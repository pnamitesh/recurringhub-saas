// Bulk Operations Service

export const BulkOperationsService = {
  // Bulk create customers from file
  bulkImportCustomers: async (file, addCustomer) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const text = e.target.result;
          const lines = text.split('\n').slice(1); // Skip header

          let successful = 0;
          let failed = 0;
          const errors = [];

          for (const line of lines) {
            if (!line.trim()) continue;

            const [name, phone, plan, fee, dueDate] = line.split(',');

            if (!name || !phone || !plan) {
              failed++;
              errors.push(`Row "${name}": Missing required fields`);
              continue;
            }

            try {
              addCustomer({
                name: name.trim(),
                phone: phone.trim(),
                plan: plan.trim() || 'Standard',
                monthlyFee: parseFloat(fee) || 3000,
                dueDate: parseInt(dueDate) || 5,
                startDate: new Date().toISOString().split('T')
              });
              successful++;
            } catch (err) {
              failed++;
              errors.push(`Row "${name}": ${err.message}`);
            }

            // Simulate delay
            await new Promise(r => setTimeout(r, 50));
          }

          resolve({
            successful,
            failed,
            total: successful + failed,
            errors
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.readAsText(file);
    });
  },

  // Bulk send reminders
  bulkSendReminders: async (customers, addReminder, template) => {
    const results = {
      successful: 0,
      failed: 0,
      total: customers.length,
      failedCustomers: []
    };

    for (const customer of customers) {
      try {
        addReminder({
          customerId: customer.id,
          customerName: customer.name,
          type: 'sms',
          message: template,
          reminderType: 'bulk'
        });
        results.successful++;

        // Simulate delay
        await new Promise(r => setTimeout(r, 100));
      } catch (err) {
        results.failed++;
        results.failedCustomers.push({
          customerId: customer.id,
          name: customer.name,
          error: err.message
        });
      }
    }

    return results;
  },

  // Bulk update payment status
  bulkUpdatePaymentStatus: async (paymentIds, status, updatePayment) => {
    const results = {
      successful: 0,
      failed: 0
    };

    for (const paymentId of paymentIds) {
      try {
        updatePayment(paymentId, { status });
        results.successful++;

        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        results.failed++;
      }
    }

    return results;
  },

  // Bulk update customer status
  bulkUpdateCustomerStatus: async (customerIds, status, updateCustomer) => {
    const results = {
      successful: 0,
      failed: 0
    };

    for (const customerId of customerIds) {
      try {
        updateCustomer(customerId, { status });
        results.successful++;

        await new Promise(r => setTimeout(r, 50));
      } catch (err) {
        results.failed++;
      }
    }

    return results;
  },

  // Export data with filters
  exportFilteredData: (data, filters) => {
    let filtered = [...data];

    if (filters.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }

    if (filters.plan) {
      filtered = filtered.filter(item => item.plan === filters.plan);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(item => 
        new Date(item.createdAt || item.date) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(item => 
        new Date(item.createdAt || item.date) <= new Date(filters.dateTo)
      );
    }

    return filtered;
  }
};

export default BulkOperationsService;
