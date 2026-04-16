import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmLoading?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmLoading = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 animate-fade-in backdrop-blur-sm">
      <div className="bg-[#F5F4EF] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden animate-fade-up relative">
        <div className="p-6">
          <h3 className="text-xl font-headline font-bold text-[#534AB7] mb-3">{title}</h3>
          <div className="text-gray-700 font-body mb-8 text-sm leading-relaxed">
            {children}
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={confirmLoading}
              className="px-5 py-2.5 rounded-full font-medium text-gray-700 bg-gray-200/80 hover:bg-gray-300 transition-colors text-sm disabled:opacity-50"
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button
                onClick={onConfirm}
                disabled={confirmLoading}
                className="px-5 py-2.5 rounded-full font-medium text-white bg-[#534AB7] hover:opacity-90 transition-opacity flex items-center gap-2 text-sm shadow-md disabled:opacity-70"
              >
                {confirmLoading ? (
                  <span className="material-symbols-outlined animate-spin text-sm">refresh</span>
                ) : null}
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
