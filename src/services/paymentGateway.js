// Mock Razorpay Payment Gateway Service

const mockRazorpayKey = 'rzp_live_mock_key_123456';

export const PaymentGatewayService = {
  // Generate payment order
  createOrder: async (amount, customerId, customerName) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      orderId: orderId,
      amount: amount,
      currency: 'INR',
      customerId: customerId,
      customerName: customerName,
      paymentLink: `https://rzp.io/i/mock_${orderId}`,
      qrCode: generateMockQR(amount, customerName),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      shortUrl: `rzp.io/i/mock_${orderId}`
    };
  },

  // Verify payment (mock verification)
  verifyPayment: async (paymentId, signature) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock success rate: 90%
    const isSuccess = Math.random() < 0.9;

    return {
      success: isSuccess,
      paymentId: paymentId,
      status: isSuccess ? 'captured' : 'failed',
      message: isSuccess ? 'Payment verified successfully' : 'Payment verification failed',
      timestamp: new Date().toISOString()
    };
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    await new Promise(resolve => setTimeout(resolve, 200));

    return {
      id: paymentId,
      amount: Math.floor(Math.random() * 5000) + 1000,
      status: 'captured',
      method: 'card',
      description: 'RecurringHub Payment',
      email: 'customer@example.com',
      contact: '9876543210',
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      fee: Math.floor(Math.random() * 100) + 20,
      tax: 0,
      notes: {
        businessId: 'biz_001',
        customerId: 'cust_001'
      }
    };
  },

  // Get settlement details
  getSettlement: async (dateRange) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    return {
      period: dateRange,
      totalAmount: Math.floor(Math.random() * 50000) + 10000,
      fee: Math.floor(Math.random() * 2000) + 500,
      tax: Math.floor(Math.random() * 1000) + 100,
      netAmount: Math.floor(Math.random() * 50000),
      status: 'processed',
      dateOfTransfer: new Date().toISOString()
    };
  }
};

function generateMockQR(amount, customerName) {
  // Mock QR code as SVG
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='white' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' font-size='20' text-anchor='middle' dy='.3em'%3E₹${amount}%3C/text%3E%3C/svg%3E`;
}

export default PaymentGatewayService;
