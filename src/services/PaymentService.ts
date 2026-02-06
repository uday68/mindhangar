/**
 * Payment Service for Indian Market
 * Supports Indian payment gateways and pricing
 * - Razorpay, Paytm, PhonePe, Google Pay
 * - UPI, Net Banking, Digital Wallets
 * - INR currency with Indian pricing tiers
 * - Prepaid recharge model
 */

export interface PaymentGateway {
  id: string;
  name: string;
  type: 'upi' | 'wallet' | 'netbanking' | 'card';
  enabled: boolean;
  icon: string;
}

export interface PricingTier {
  id: string;
  name: string;
  duration: number; // in days
  price: number; // in INR
  features: string[];
  popular?: boolean;
  discount?: number; // percentage
}

export interface PaymentMethod {
  id: string;
  type: 'upi' | 'wallet' | 'netbanking' | 'card';
  provider: string;
  details: string; // e.g., UPI ID, card last 4 digits
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: 'INR';
  status: 'pending' | 'success' | 'failed' | 'refunded';
  paymentMethod: string;
  tierId: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface Subscription {
  id: string;
  userId: string;
  tierId: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'expired' | 'cancelled';
  autoRenew: boolean;
}

class PaymentService {
  private gateways: Map<string, PaymentGateway> = new Map();
  private pricingTiers: PricingTier[] = [];
  private isInitialized = false;

  /**
   * Initialize payment service
   */
  async initialize(): Promise<void> {
    // Register Indian payment gateways
    this.registerGateway({
      id: 'razorpay',
      name: 'Razorpay',
      type: 'card',
      enabled: true,
      icon: '💳',
    });

    this.registerGateway({
      id: 'paytm',
      name: 'Paytm',
      type: 'wallet',
      enabled: true,
      icon: '💰',
    });

    this.registerGateway({
      id: 'phonepe',
      name: 'PhonePe',
      type: 'upi',
      enabled: true,
      icon: '📱',
    });

    this.registerGateway({
      id: 'googlepay',
      name: 'Google Pay',
      type: 'upi',
      enabled: true,
      icon: 'G',
    });

    this.registerGateway({
      id: 'upi',
      name: 'UPI',
      type: 'upi',
      enabled: true,
      icon: '🔗',
    });

    this.registerGateway({
      id: 'netbanking',
      name: 'Net Banking',
      type: 'netbanking',
      enabled: true,
      icon: '🏦',
    });

    // Set up Indian pricing tiers
    this.setupPricingTiers();

    this.isInitialized = true;
    console.log('✅ Payment service initialized');
  }

  /**
   * Register payment gateway
   */
  private registerGateway(gateway: PaymentGateway): void {
    this.gateways.set(gateway.id, gateway);
  }

  /**
   * Setup pricing tiers for Indian market
   */
  private setupPricingTiers(): void {
    this.pricingTiers = [
      {
        id: 'free',
        name: 'Free',
        duration: 365, // 1 year
        price: 0,
        features: [
          'Basic AI assistance',
          'Limited content access',
          'Offline mode',
          'Multi-language support',
          'Basic analytics',
        ],
      },
      {
        id: 'weekly',
        name: 'Weekly Pass',
        duration: 7,
        price: 49, // ₹49 per week
        features: [
          'Full AI assistance',
          'Unlimited content access',
          'Offline mode',
          'Multi-language support',
          'Advanced analytics',
          'Priority support',
        ],
      },
      {
        id: 'monthly',
        name: 'Monthly Plan',
        duration: 30,
        price: 149, // ₹149 per month
        features: [
          'Full AI assistance',
          'Unlimited content access',
          'Offline mode',
          'Multi-language support',
          'Advanced analytics',
          'Priority support',
          'Exam preparation tools',
        ],
        popular: true,
        discount: 10, // 10% off compared to weekly
      },
      {
        id: 'quarterly',
        name: 'Quarterly Plan',
        duration: 90,
        price: 399, // ₹399 per quarter
        features: [
          'Full AI assistance',
          'Unlimited content access',
          'Offline mode',
          'Multi-language support',
          'Advanced analytics',
          'Priority support',
          'Exam preparation tools',
          'Personalized study plans',
        ],
        discount: 20, // 20% off
      },
      {
        id: 'yearly',
        name: 'Yearly Plan',
        duration: 365,
        price: 1299, // ₹1299 per year
        features: [
          'Full AI assistance',
          'Unlimited content access',
          'Offline mode',
          'Multi-language support',
          'Advanced analytics',
          'Priority support',
          'Exam preparation tools',
          'Personalized study plans',
          'Parent/Teacher dashboard',
          'Certification',
        ],
        discount: 30, // 30% off
      },
    ];
  }

  /**
   * Get available payment gateways
   */
  getPaymentGateways(type?: PaymentGateway['type']): PaymentGateway[] {
    const gateways = Array.from(this.gateways.values()).filter(g => g.enabled);
    return type ? gateways.filter(g => g.type === type) : gateways;
  }

  /**
   * Get pricing tiers
   */
  getPricingTiers(): PricingTier[] {
    return this.pricingTiers;
  }

  /**
   * Get specific pricing tier
   */
  getPricingTier(tierId: string): PricingTier | undefined {
    return this.pricingTiers.find(t => t.id === tierId);
  }

  /**
   * Format price in INR
   */
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate discounted price
   */
  calculateDiscountedPrice(tierId: string): number {
    const tier = this.getPricingTier(tierId);
    if (!tier) return 0;

    if (tier.discount) {
      return tier.price * (1 - tier.discount / 100);
    }

    return tier.price;
  }

  /**
   * Initiate payment
   */
  async initiatePayment(
    userId: string,
    tierId: string,
    gatewayId: string
  ): Promise<{
    success: boolean;
    transactionId?: string;
    paymentUrl?: string;
    error?: string;
  }> {
    const tier = this.getPricingTier(tierId);
    const gateway = this.gateways.get(gatewayId);

    if (!tier || !gateway) {
      return {
        success: false,
        error: 'Invalid tier or gateway',
      };
    }

    try {
      // In production, this would integrate with actual payment gateway APIs
      console.log(`Initiating payment: ${tier.name} via ${gateway.name}`);

      const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Mock payment URL (in production, this would be from gateway)
      const paymentUrl = `https://payment.example.com/${transactionId}`;

      // Create transaction record
      const transaction: Transaction = {
        id: transactionId,
        userId,
        amount: this.calculateDiscountedPrice(tierId),
        currency: 'INR',
        status: 'pending',
        paymentMethod: gateway.name,
        tierId,
        createdAt: new Date(),
      };

      // Store transaction (in production, save to database)
      console.log('Transaction created:', transaction);

      return {
        success: true,
        transactionId,
        paymentUrl,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed',
      };
    }
  }

  /**
   * Verify payment status
   */
  async verifyPayment(transactionId: string): Promise<{
    success: boolean;
    status: Transaction['status'];
    error?: string;
  }> {
    try {
      // In production, this would verify with payment gateway
      console.log(`Verifying payment: ${transactionId}`);

      // Mock successful payment
      return {
        success: true,
        status: 'success',
      };
    } catch (error) {
      return {
        success: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Process successful payment
   */
  async processSuccessfulPayment(
    transactionId: string,
    userId: string,
    tierId: string
  ): Promise<Subscription | null> {
    const tier = this.getPricingTier(tierId);
    if (!tier) return null;

    const subscription: Subscription = {
      id: `sub_${Date.now()}`,
      userId,
      tierId,
      startDate: new Date(),
      endDate: new Date(Date.now() + tier.duration * 24 * 60 * 60 * 1000),
      status: 'active',
      autoRenew: false,
    };

    // In production, save to database
    console.log('Subscription created:', subscription);

    return subscription;
  }

  /**
   * Get user subscription
   */
  async getUserSubscription(userId: string): Promise<Subscription | null> {
    // In production, fetch from database
    // For now, return mock data
    return null;
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    
    if (!subscription) return false;
    
    return (
      subscription.status === 'active' &&
      subscription.endDate > new Date()
    );
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // In production, update database and notify payment gateway
      console.log(`Cancelling subscription: ${subscriptionId}`);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Cancellation failed',
      };
    }
  }

  /**
   * Request refund
   */
  async requestRefund(
    transactionId: string,
    reason: string
  ): Promise<{
    success: boolean;
    refundId?: string;
    error?: string;
  }> {
    try {
      // In production, process refund through payment gateway
      console.log(`Requesting refund for ${transactionId}: ${reason}`);

      const refundId = `ref_${Date.now()}`;

      return {
        success: true,
        refundId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Refund request failed',
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(
    userId: string,
    method: Omit<PaymentMethod, 'id'>
  ): Promise<PaymentMethod> {
    const paymentMethod: PaymentMethod = {
      id: `pm_${Date.now()}`,
      ...method,
    };

    // In production, save to database
    console.log('Payment method added:', paymentMethod);

    return paymentMethod;
  }

  /**
   * Get saved payment methods
   */
  async getPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Apply promo code
   */
  async applyPromoCode(
    code: string,
    tierId: string
  ): Promise<{
    valid: boolean;
    discount?: number;
    finalPrice?: number;
    error?: string;
  }> {
    // Mock promo codes
    const promoCodes: Record<string, number> = {
      'STUDENT10': 10,
      'FIRST20': 20,
      'BHARAT50': 50,
    };

    const discount = promoCodes[code.toUpperCase()];

    if (!discount) {
      return {
        valid: false,
        error: 'Invalid promo code',
      };
    }

    const tier = this.getPricingTier(tierId);
    if (!tier) {
      return {
        valid: false,
        error: 'Invalid tier',
      };
    }

    const basePrice = this.calculateDiscountedPrice(tierId);
    const finalPrice = basePrice * (1 - discount / 100);

    return {
      valid: true,
      discount,
      finalPrice,
    };
  }
}

export const paymentService = new PaymentService();
