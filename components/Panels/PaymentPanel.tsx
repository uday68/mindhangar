import React, { useState, useEffect } from 'react';
import { paymentService, PricingTier } from '../../src/services/PaymentService';
import { Icons } from '../Icons';

export const PaymentPanel: React.FC = () => {
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [gateways, setGateways] = useState<any[]>([]);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    const pricingTiers = paymentService.getPricingTiers();
    const paymentGateways = paymentService.getPaymentGateways();
    setTiers(pricingTiers);
    setGateways(paymentGateways);
  };

  const handleSubscribe = async () => {
    if (!selectedTier || !selectedGateway) {
      alert('Please select a plan and payment method');
      return;
    }

    setLoading(true);
    try {
      const result = await paymentService.initiatePayment(
        'user_123', // Replace with actual user ID
        selectedTier,
        selectedGateway
      );

      if (result.success && result.paymentUrl) {
        // In production, redirect to payment gateway
        alert(`Payment initiated! Transaction ID: ${result.transactionId}`);
      } else {
        alert(`Payment failed: ${result.error}`);
      }
    } catch (error) {
      alert('Payment error occurred');
    } finally {
      setLoading(false);
    }
  };

  const applyPromo = async () => {
    if (!promoCode || !selectedTier) return;

    const result = await paymentService.applyPromoCode(promoCode, selectedTier);
    if (result.valid) {
      alert(`Promo applied! ${result.discount}% off. Final price: ${paymentService.formatPrice(result.finalPrice!)}`);
    } else {
      alert(result.error || 'Invalid promo code');
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-purple-50 to-pink-50 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-purple-200 bg-white/80 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-purple-900 flex items-center gap-2">
          <Icons.CreditCard size={28} />
          Subscription Plans
        </h2>
        <p className="text-purple-600 mt-1">Choose the perfect plan for your learning journey</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedTier === tier.id
                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                  : 'border-purple-200 bg-white hover:border-purple-300 hover:shadow-md'
              } ${tier.popular ? 'ring-2 ring-purple-400' : ''}`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 rounded-full text-xs font-bold">
                  MOST POPULAR
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-purple-900">{tier.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold text-purple-600">
                    {paymentService.formatPrice(tier.price)}
                  </span>
                  {tier.duration > 0 && (
                    <span className="text-gray-600 text-sm">
                      /{tier.duration === 7 ? 'week' : tier.duration === 30 ? 'month' : tier.duration === 90 ? 'quarter' : 'year'}
                    </span>
                  )}
                </div>
                {tier.discount && (
                  <div className="mt-1 text-green-600 text-sm font-semibold">
                    Save {tier.discount}%
                  </div>
                )}
              </div>

              <ul className="space-y-2 mb-4">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Icons.Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {selectedTier === tier.id && (
                <div className="absolute top-4 right-4">
                  <Icons.Check size={24} className="text-purple-500" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        {selectedTier && selectedTier !== 'free' && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {gateways.map((gateway) => (
                <button
                  key={gateway.id}
                  onClick={() => setSelectedGateway(gateway.id)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedGateway === gateway.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{gateway.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{gateway.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{gateway.type}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Promo Code */}
        {selectedTier && selectedTier !== 'free' && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Have a Promo Code?</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={applyPromo}
                className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Apply
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Try: STUDENT10, FIRST20, BHARAT50
            </div>
          </div>
        )}

        {/* Subscribe Button */}
        {selectedTier && selectedTier !== 'free' && (
          <button
            onClick={handleSubscribe}
            disabled={loading || !selectedGateway}
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? 'Processing...' : 'Subscribe Now'}
          </button>
        )}

        {/* Free Tier Info */}
        {selectedTier === 'free' && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <Icons.Check size={48} className="text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-900 mb-2">You're on the Free Plan!</h3>
            <p className="text-green-700">
              Enjoy basic features at no cost. Upgrade anytime to unlock premium features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
