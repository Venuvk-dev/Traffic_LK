import React, { useState, useEffect } from 'react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, Lock, X } from 'lucide-react';
import { useStripe as useStripeContext } from '../contexts/StripeContext';
import axios from 'axios';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  type: string;
  relatedId?: string;
  description: string;
  metadata?: any;
  onSuccess: () => void;
}

const PaymentForm: React.FC<Omit<PaymentModalProps, 'isOpen'>> = ({
  onClose,
  amount,
  type,
  relatedId,
  description,
  metadata,
  onSuccess
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      const response = await axios.post('/api/stripe/create-payment-intent', {
        amount,
        type,
        relatedId,
        description,
        metadata
      });
      
      setClientSecret(response.data.clientSecret);
      setPaymentId(response.data.paymentId);
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      setError('Failed to initialize payment');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card element not found');
      setLoading(false);
      return;
    }

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      }
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
      setLoading(false);
    } else if (paymentIntent.status === 'succeeded') {
      try {
        await axios.post('/api/stripe/confirm-payment', {
          paymentIntentId: paymentIntent.id,
          paymentId
        });
        
        onSuccess();
        onClose();
      } catch (error) {
        setError('Payment succeeded but failed to update records');
      }
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Complete Payment
        </h3>
        <p className="text-gray-600">{description}</p>
        <p className="text-2xl font-bold text-emerald-600 mt-2">
          Rs. {amount.toLocaleString()}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border border-gray-300 rounded-lg p-3 bg-white">
            <CardElement options={cardElementOptions} />
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center text-sm text-gray-600">
            <Lock className="h-4 w-4 mr-2" />
            Your payment information is secure and encrypted
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1 px-4 py-2 text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay Rs. {amount.toLocaleString()}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, ...props }) => {
  const { stripePromise } = useStripeContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Secure Payment</h2>
          <button
            onClick={props.onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <Elements stripe={stripePromise}>
          <PaymentForm {...props} />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentModal;