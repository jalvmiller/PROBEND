import { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/ui/ToastContainer';

const ToastContext = createContext(null);

/**
 * Provider global de toasts.
 * Envolve a aplicação para que qualquer componente possa chamar
 * useToastContext().showToast('...', 'success')
 */
export function ToastProvider({ children }) {
    const { toasts, showToast, removeToast } = useToast();

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </ToastContext.Provider>
    );
}

export function useToastContext() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToastContext deve ser usado dentro de ToastProvider');
    return ctx;
}
