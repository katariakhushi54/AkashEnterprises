import { useEffect } from 'react';

export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string) {
  useEffect(() => {
    if (!isOpen) return;

    // When modal opens, push a state
    window.history.pushState({ modal: modalId }, '');

    const handlePopState = (e: PopStateEvent) => {
      // If the back button is pressed, the state we pushed is popped.
      // We should call onClose()
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // If the component unmounts or isOpen becomes false (e.g. closed via X button),
      // we need to clean up the history if it's still at our modal state.
      if (window.history.state?.modal === modalId) {
        window.history.back();
      }
    };
  }, [isOpen, onClose, modalId]);
}
