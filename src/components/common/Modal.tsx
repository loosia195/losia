'use client'; // <--- Quan trọng, để Modal chạy ở client


import React from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-black/40
        bg-opacity-50
      "
    >
      <div className="relative">{children}</div>
    </div>,
    document.getElementById("modal-root")!
  );
}
