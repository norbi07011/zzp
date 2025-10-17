// ===================================
// PAYMENT METHOD SELECTOR - Dutch Payment Methods
// ===================================

import React from 'react';
import { CreditCard, Building2, Wallet } from 'lucide-react';
import './PaymentMethodSelector.css';

export type PaymentMethodType = 'ideal' | 'credit_card' | 'sepa_debit' | 'bancontact';

interface PaymentMethodSelectorProps {
  selectedMethod: PaymentMethodType;
  onSelectMethod: (method: PaymentMethodType) => void;
  amount?: number;
  showAmount?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onSelectMethod,
  amount,
  showAmount = true,
}) => {
  const formatAmount = (cents: number) => {
    return `€${(cents / 100).toFixed(2)}`;
  };

  const paymentMethods: Array<{
    type: PaymentMethodType;
    name: string;
    icon: React.ReactNode;
    description: string;
    popular?: boolean;
  }> = [
    {
      type: 'ideal',
      name: 'iDEAL',
      icon: <Building2 size={24} />,
      description: 'Direct betalen via uw eigen bank',
      popular: true,
    },
    {
      type: 'credit_card',
      name: 'Credit Card',
      icon: <CreditCard size={24} />,
      description: 'Visa, Mastercard, American Express',
    },
    {
      type: 'sepa_debit',
      name: 'SEPA Incasso',
      icon: <Wallet size={24} />,
      description: 'Automatische incasso vanuit uw bankrekening',
    },
    {
      type: 'bancontact',
      name: 'Bancontact',
      icon: <CreditCard size={24} />,
      description: 'Belgische betaalmethode',
    },
  ];

  return (
    <div className="payment-method-selector">
      {showAmount && amount !== undefined && (
        <div className="payment-amount">
          <span className="label">Betaalbedrag:</span>
          <span className="amount">{formatAmount(amount)}</span>
        </div>
      )}

      <div className="payment-methods-grid">
        {paymentMethods.map((method) => (
          <div
            key={method.type}
            className={`payment-method-card ${
              selectedMethod === method.type ? 'selected' : ''
            } ${method.popular ? 'popular' : ''}`}
            onClick={() => onSelectMethod(method.type)}
          >
            {method.popular && <div className="popular-badge">Meest gebruikt</div>}

            <div className="method-icon">{method.icon}</div>

            <div className="method-content">
              <h4>{method.name}</h4>
              <p>{method.description}</p>
            </div>

            <div className="selection-indicator">
              <div className="radio-circle" />
            </div>
          </div>
        ))}
      </div>

      <div className="payment-security-notice">
        <span className="lock-icon">🔒</span>
        <p>
          Veilige betaling via Stripe. Uw betaalgegevens worden versleuteld en veilig verwerkt.
        </p>
      </div>
    </div>
  );
};
