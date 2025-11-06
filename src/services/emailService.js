// Mock Email Notification Service

export const EmailService = {
  // Send payment reminder email
  sendPaymentReminder: async (customer, dueAmount) => {
    await new Promise(resolve => setTimeout(resolve, 400));

    const emailContent = {
      to: customer.email || `${customer.name.replace(/\s/g, '').toLowerCase()}@email.com`,
      subject: `Payment Reminder: ${dueAmount} Due`,
      template: 'payment_reminder',
      variables: {
        customerName: customer.name,
        amount: dueAmount,
        plan: customer.plan,
        dueDate: customer.dueDate,
        businessName: 'RecurringHub'
      }
    };

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      to: emailContent.to,
      subject: emailContent.subject,
      status: 'sent',
      sentAt: new Date().toISOString(),
      template: emailContent.template
    };
  },

  // Send payment confirmation email
  sendPaymentConfirmation: async (payment, customer) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      to: customer.email || `${customer.name.replace(/\s/g, '').toLowerCase()}@email.com`,
      subject: `Payment Confirmation - ₹${payment.amount}`,
      status: 'sent',
      sentAt: new Date().toISOString(),
      paymentDetails: {
        amount: payment.amount,
        date: payment.date,
        method: payment.method,
        reference: payment.referenceId
      }
    };
  },

  // Send invoice email
  sendInvoice: async (customer, payment) => {
    await new Promise(resolve => setTimeout(resolve, 350));

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      to: customer.email || `${customer.name.replace(/\s/g, '').toLowerCase()}@email.com`,
      subject: `Invoice #INV-${payment.id}`,
      status: 'sent',
      attachments: ['invoice.pdf'],
      sentAt: new Date().toISOString()
    };
  },

  // Send batch emails
  sendBatchEmails: async (recipients, subject, template) => {
    await new Promise(resolve => setTimeout(resolve, 500 + recipients.length * 100));

    return {
      success: true,
      batchId: `batch_${Date.now()}`,
      totalRecipients: recipients.length,
      successful: Math.floor(recipients.length * 0.95),
      failed: Math.ceil(recipients.length * 0.05),
      status: 'completed',
      sentAt: new Date().toISOString()
    };
  }
};

export default EmailService;
