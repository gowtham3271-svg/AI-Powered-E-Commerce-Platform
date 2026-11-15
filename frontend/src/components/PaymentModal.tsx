import React, { useState } from 'react';
import { 
  X, 
  Lock, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  Building2, 
  Truck, 
  ArrowRight, 
  Download, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { Order } from '../types';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  discount: number;
  grandTotal: number;
  onSuccess: (order: Order) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  subtotal,
  discount,
  grandTotal,
  onSuccess
}) => {
  const { user } = useAuth();
  const { refreshCart } = useCart();

  const [step, setStep] = useState<'details' | 'payment' | 'processing' | 'success'>('details');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'cod'>('upi');

  // Address fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState('9876543210');
  const [address, setAddress] = useState('Plot 42, Silicon Valley Tech Avenue');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560034');

  // Card fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');

  // UPI fields
  const [upiId, setUpiId] = useState(`${user?.email?.split('@')[0] || 'customer'}@okhdfcbank`);

  // Netbanking bank
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing state
  const [processingStatus, setProcessingStatus] = useState('Connecting to Bank Gateway...');
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  if (!isOpen) return null;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim() || !pincode.trim()) {
      setErrorMessage('Please fill in all shipping details.');
      return;
    }
    setErrorMessage(null);
    setStep('payment');
  };

  const handlePayNow = async () => {
    try {
      setStep('processing');
      setProcessingStatus('Securing 256-Bit SSL connection...');

      setTimeout(() => {
        setProcessingStatus('Authorizing payment with bank server...');
      }, 1000);

      setTimeout(() => {
        setProcessingStatus('Decrementing live inventory & confirming order...');
      }, 2000);

      // Perform real backend checkout
      const order = await api.checkout();
      await refreshCart();

      setTimeout(() => {
        setConfirmedOrder(order);
        setStep('success');
        onSuccess(order);
      }, 2800);

    } catch (err: any) {
      setStep('payment');
      setErrorMessage(err.message || 'Payment processing failed. Please try again.');
    }
  };

  const handleCopyInvoice = () => {
    navigator.clipboard.writeText(`BUYSMART INVOICE #${confirmedOrder?.id}\nTotal: ₹${grandTotal.toLocaleString('en-IN')}\nStatus: Paid & Confirmed\nDelivering to: ${name}, ${city} - ${pincode}`);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={step === 'processing' ? undefined : onClose} 
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10 animate-fade-in flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="p-4 px-6 border-b border-neutral-800 flex items-center justify-between bg-black">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-black text-xs">
              BS
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                BUYSMART CHECKOUT
              </h3>
              <p className="text-[10px] text-neutral-400 flex items-center gap-1">
                <Lock size={10} className="text-emerald-400" /> 256-Bit SSL Secured Payment
              </p>
            </div>
          </div>

          {step !== 'processing' && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-neutral-800 text-[11px] font-bold uppercase tracking-wider text-center">
          <div className={`py-2.5 border-b-2 transition-colors ${step === 'details' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>
            1. Shipping
          </div>
          <div className={`py-2.5 border-b-2 transition-colors ${step === 'payment' || step === 'processing' ? 'border-white text-white' : 'border-transparent text-neutral-500'}`}>
            2. Payment
          </div>
          <div className={`py-2.5 border-b-2 transition-colors ${step === 'success' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-neutral-500'}`}>
            3. Confirmation
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: SHIPPING DETAILS */}
          {step === 'details' && (
            <form onSubmit={handleProceedToPayment} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-black uppercase tracking-wider text-white">Delivery Address</span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                  Free Express Delivery
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Phone Number (+91)</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Delivery Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Flat, building, street, area"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560034"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bengaluru"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-[11px] text-neutral-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <Truck size={14} className="text-emerald-400" /> Express 24-48h Dispatch
                </span>
                <span className="text-emerald-400 font-black">FREE</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-white hover:bg-neutral-200 text-black font-black uppercase tracking-wider text-xs rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all mt-4"
              >
                <span>Continue to Payment Method</span>
                <ArrowRight size={14} />
              </button>
            </form>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION */}
          {step === 'payment' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                <span className="text-xs font-black uppercase tracking-wider text-white">Select Payment Mode</span>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-[11px] text-neutral-400 hover:text-white underline"
                >
                  Edit Address
                </button>
              </div>

              {/* Payment Tabs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'upi'
                      ? 'border-white bg-white text-black font-black'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <QrCode size={18} />
                  <span className="text-xs">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'card'
                      ? 'border-white bg-white text-black font-black'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <CreditCard size={18} />
                  <span className="text-xs">Cards</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'border-white bg-white text-black font-black'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <Building2 size={18} />
                  <span className="text-xs">NetBanking</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-white bg-white text-black font-black'
                      : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                  }`}
                >
                  <Truck size={18} />
                  <span className="text-xs">Cash on Delivery</span>
                </button>
              </div>

              {/* Tab 1: UPI */}
              {paymentMethod === 'upi' && (
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-4">
                  <div className="flex items-center justify-between text-xs text-white">
                    <span className="font-bold">Instant UPI (0% Transaction Fees)</span>
                    <span className="text-[10px] text-emerald-400 font-mono">GPay / PhonePe / Paytm</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-xl bg-black border border-neutral-800">
                    <div className="w-28 h-28 bg-white p-2 rounded-lg flex items-center justify-center shrink-0">
                      {/* Realistic SVG QR Code */}
                      <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect width="100" height="100" fill="#fff" />
                        <rect x="10" y="10" width="25" height="25" fill="#000" />
                        <rect x="15" y="15" width="15" height="15" fill="#fff" />
                        <rect x="18" y="18" width="9" height="9" fill="#000" />
                        <rect x="65" y="10" width="25" height="25" fill="#000" />
                        <rect x="70" y="15" width="15" height="15" fill="#fff" />
                        <rect x="73" y="18" width="9" height="9" fill="#000" />
                        <rect x="10" y="65" width="25" height="25" fill="#000" />
                        <rect x="15" y="70" width="15" height="15" fill="#fff" />
                        <rect x="18" y="73" width="9" height="9" fill="#000" />
                        <rect x="42" y="15" width="15" height="8" fill="#000" />
                        <rect x="42" y="42" width="16" height="16" fill="#000" />
                        <rect x="65" y="42" width="12" height="10" fill="#000" />
                        <rect x="42" y="68" width="15" height="15" fill="#000" />
                        <rect x="68" y="68" width="15" height="15" fill="#000" />
                      </svg>
                    </div>
                    <div className="text-xs space-y-1 text-center sm:text-left">
                      <p className="font-bold text-white">Scan with any UPI App</p>
                      <p className="text-[11px] text-neutral-400">Scan QR Code using Google Pay, PhonePe, Paytm, or BHIM.</p>
                      <span className="inline-block mt-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        Auto-approves on payment
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Or Enter Virtual Payment Address (UPI ID)</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@okhdfcbank"
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>
                </div>
              )}

              {/* Tab 2: CARDS */}
              {paymentMethod === 'card' && (
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4242 4242 4242 4242"
                      className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wide block mb-1">CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="•••"
                        className="w-full bg-black border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: NETBANKING */}
              {paymentMethod === 'netbanking' && (
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-3">
                  <span className="text-xs font-bold text-white block">Choose Popular Bank</span>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                          selectedBank === bank
                            ? 'border-white bg-white text-black'
                            : 'border-neutral-800 bg-black text-neutral-300 hover:border-neutral-700'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 4: COD */}
              {paymentMethod === 'cod' && (
                <div className="p-4 rounded-xl bg-neutral-900/90 border border-neutral-800 space-y-2">
                  <span className="text-xs font-bold text-white block flex items-center gap-1.5">
                    <Truck size={14} className="text-emerald-400" /> Cash on Delivery Available
                  </span>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    Pay safely at your doorstep via Cash, Google Pay, PhonePe, or Cards when our delivery executive arrives.
                  </p>
                </div>
              )}

              {/* Amount Breakdown Summary */}
              <div className="p-4 rounded-xl bg-black border border-neutral-800 space-y-1.5 text-xs text-neutral-400">
                <div className="flex justify-between">
                  <span>Cart Subtotal</span>
                  <span className="text-white font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Festive Discount</span>
                    <span className="font-bold">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Express Shipping</span>
                  <span className="text-emerald-400 font-bold">FREE</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-800 text-sm font-black text-white">
                  <span>Grand Total to Pay</span>
                  <span className="text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Pay Now Button */}
              <button
                type="button"
                onClick={handlePayNow}
                className="w-full py-4 bg-white hover:bg-neutral-200 active:scale-95 text-black font-black uppercase tracking-wider text-sm rounded-xl shadow-2xl flex items-center justify-center gap-2 transition-all"
              >
                <Lock size={15} />
                <span>PAY ₹{grandTotal.toLocaleString('en-IN')} & CONFIRM ORDER</span>
              </button>
            </div>
          )}

          {/* STEP 3: REALISTIC PROCESSING ANIMATION */}
          {step === 'processing' && (
            <div className="py-16 text-center space-y-6 animate-fade-in">
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 border-4 border-neutral-800 border-t-white rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <Lock size={24} />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black uppercase tracking-wider text-white">
                  Processing Payment...
                </h3>
                <p className="text-xs text-neutral-400 font-mono animate-pulse">
                  {processingStatus}
                </p>
              </div>
              <div className="max-w-xs mx-auto p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-[11px] text-neutral-400">
                Please do not refresh or close this window. Your transaction is being secured with bank 3D-Secure.
              </div>
            </div>
          )}

          {/* STEP 4: ORDER SUCCESS */}
          {step === 'success' && confirmedOrder && (
            <div className="py-6 text-center space-y-5 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10">
                <CheckCircle2 size={36} />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black uppercase tracking-wider text-white">
                  Payment Successful!
                </h3>
                <p className="text-xs text-neutral-400">
                  Your order has been officially confirmed and dispatched to our warehouse.
                </p>
              </div>

              {/* Order Receipt Card */}
              <div className="p-4 rounded-xl bg-black border border-neutral-800 text-left text-xs space-y-2.5 font-sans">
                <div className="flex justify-between pb-2 border-b border-neutral-800">
                  <span className="text-neutral-400 font-medium">Order Number:</span>
                  <span className="font-mono font-black text-white">#BS-{confirmedOrder.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Payment Mode:</span>
                  <span className="uppercase text-emerald-400 font-bold">{paymentMethod.toUpperCase()} (Paid)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Total Amount Paid:</span>
                  <span className="font-black text-white">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 font-medium">Estimated Express Delivery:</span>
                  <span className="text-white font-bold">Tomorrow by 5:00 PM</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-neutral-800 text-[11px] text-neutral-400">
                  <span>Shipping Address:</span>
                  <span className="text-white font-medium text-right max-w-[200px] truncate">{address}, {city}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleCopyInvoice}
                  className="flex-1 py-3 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold border border-neutral-800 flex items-center justify-center gap-2 transition-all"
                >
                  {copiedInvoice ? <Check size={14} className="text-emerald-400" /> : <Download size={14} />}
                  <span>{copiedInvoice ? 'Invoice Copied!' : 'Download Tax Invoice'}</span>
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 py-3 px-4 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-black uppercase tracking-wider transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Security Badges */}
        <div className="p-3 bg-black border-t border-neutral-800/80 flex items-center justify-center gap-4 text-[10px] text-neutral-500">
          <span className="flex items-center gap-1">
            <ShieldCheck size={12} className="text-emerald-400" /> 100% Secure Checkout
          </span>
          <span>•</span>
          <span>PCI-DSS Compliant</span>
          <span>•</span>
          <span>Official Brand Warranty</span>
        </div>

      </div>
    </div>
  );
};

