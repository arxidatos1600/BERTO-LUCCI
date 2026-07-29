import * as React from "react";

/**
 * Recognisable payment-brand marks, drawn as self-contained inline SVGs on white
 * card-shaped chips so they read clearly on the dark footer. Each shares a
 * 40×26 viewBox and renders at a uniform height.
 */
const svgCls = "h-7 w-auto rounded-[3px] shadow-sm ring-1 ring-black/5";

function Visa() {
  return (
    <svg viewBox="0 0 40 26" className={svgCls} role="img" aria-label="Visa">
      <rect width="40" height="26" rx="3" fill="#ffffff" />
      <text x="20" y="14" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontSize="12" fontWeight="700" fontStyle="italic" letterSpacing="0.5" fill="#1434CB">VISA</text>
    </svg>
  );
}

function Mastercard() {
  return (
    <svg viewBox="0 0 40 26" className={svgCls} role="img" aria-label="Mastercard">
      <rect width="40" height="26" rx="3" fill="#ffffff" />
      <circle cx="16" cy="13" r="8" fill="#EB001B" />
      <circle cx="24" cy="13" r="8" fill="#F79E1B" />
      <path d="M20 6.5a8 8 0 0 1 0 13 8 8 0 0 1 0-13Z" fill="#FF5F00" />
    </svg>
  );
}

function Amex() {
  return (
    <svg viewBox="0 0 40 26" className={svgCls} role="img" aria-label="American Express">
      <rect width="40" height="26" rx="3" fill="#1F72CD" />
      <text x="20" y="14" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontSize="8.5" fontWeight="700" letterSpacing="0.4" fill="#ffffff">AMEX</text>
    </svg>
  );
}

function PayPal() {
  return (
    <svg viewBox="0 0 40 26" className={svgCls} role="img" aria-label="PayPal">
      <rect width="40" height="26" rx="3" fill="#ffffff" />
      <text x="20" y="14" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontSize="9.5" fontWeight="700" fontStyle="italic">
        <tspan fill="#003087">Pay</tspan>
        <tspan fill="#009CDE">Pal</tspan>
      </text>
    </svg>
  );
}

function ApplePay() {
  return (
    <svg viewBox="0 0 40 26" className={svgCls} role="img" aria-label="Apple Pay">
      <rect width="40" height="26" rx="3" fill="#ffffff" />
      <g fill="#000000" transform="translate(6 5.2) scale(0.66)">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
      </g>
      <text x="28" y="14" textAnchor="middle" dominantBaseline="central" fontFamily="Arial, Helvetica, sans-serif" fontSize="9" fontWeight="600" fill="#000000">Pay</text>
    </svg>
  );
}

export function PaymentLogos() {
  return (
    <>
      <Visa />
      <Mastercard />
      <Amex />
      <PayPal />
      <ApplePay />
    </>
  );
}
