import React, { useState } from 'react';
import { Form, Card } from 'react-bootstrap';
import { CardElement } from '@stripe/react-stripe-js';

const AppPaymentMethod = ({ paymentMethod, setPaymentMethod }) => {
  const [billingAddress, setBillingAddress] = useState('same');

  return (
    <Card className="mt-4">
      <Card.Body>
        <h4>Payment</h4>
        <p className="text-muted">All transactions are secure and encrypted.</p>

        {/* Payment Options */}
        <Form.Group>

          <Form.Check
            type="radio"
            label="Card Payments"
            id="card"
            name="paymentMethod"
            checked={paymentMethod === 'card'}
            onChange={() => setPaymentMethod('card')}
          />
          {paymentMethod === 'card' && (
            <div className="border p-3 mt-2 mb-2 bg-light">
              <p>Enter your card details below. Your payment is processed securely by Stripe.</p>
              <CardElement options={{ hidePostalCode: true }} />
            </div>
          )}
          <Form.Check
            type="radio"
            label="Cash on Delivery (COD)"
            id="cod"
            name="paymentMethod"
            checked={paymentMethod === 'cod'}
            onChange={() => setPaymentMethod('cod')}
          />
        </Form.Group>

        {/* Billing Address */}
        <h4 className="mt-4">Billing address</h4>
        <Form.Group>
          <Form.Check
            type="radio"
            label="Same as shipping address"
            id="sameAddress"
            name="billingAddress"
            checked={billingAddress === 'same'}
            onChange={() => setBillingAddress('same')}
          />
          <Form.Check
            type="radio"
            label="Use a different billing address"
            id="differentAddress"
            name="billingAddress"
            onChange={() => setBillingAddress('different')}
          />
        </Form.Group>
      </Card.Body>
    </Card>
  );
};

export default AppPaymentMethod;
