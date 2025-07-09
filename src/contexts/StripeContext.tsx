import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RbzJPGd1YLKOZzsM4zoWHWDmoKzUqgDiQh10O5LrDwYoBxEcx0An8AJTCbGpTmeynAmwoo9pEG4Z7kFNWVVSnzM003smr8kUE');

interface StripeContextType {
  stripePromise: Promise<any>;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (context === undefined) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

interface StripeProviderProps {
  children: ReactNode;
}

export const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  const value = {
    stripePromise
  };

  return (
    <StripeContext.Provider value={value}>
      {children}
    </StripeContext.Provider>
  );
};