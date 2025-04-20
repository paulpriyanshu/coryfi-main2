"use client";

import { useEffect, useState } from "react";
import QRCode from "react-qr-code";

export default function GPayButton({ amount }: { amount: number }) {
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeData, setQRCodeData] = useState("");
  const Amount=1

  // Generate UPI payment URL
  const generateUpiUrl = () => {
    const txnRef = "txn" + Date.now();
    return `upi://pay?pa=priyanshu.paul003@okaxis&pn=Coryfi%20Connect&am=${Amount.toFixed(
      2
    )}&cu=INR&tn=Payment%20to%20Coryfi%20Connect&tr=${txnRef}`;
  };

  // Detect if the device is mobile
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  const handlePayment = () => {
    if (isMobile) {
      window.location.href = generateUpiUrl();
    } else {
      setQRCodeData(generateUpiUrl());
      setShowQRModal(true);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        onClick={handlePayment}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Pay {Amount} INR
      </button>

      {showQRModal && qrCodeData && (
        <div className="p-4 bg-white border rounded-lg shadow-md">
          <p className="mb-2 text-center">Scan this QR code to pay:</p>
          <QRCode value={qrCodeData} size={200} />
        </div>
      )}
    </div>
  );
}