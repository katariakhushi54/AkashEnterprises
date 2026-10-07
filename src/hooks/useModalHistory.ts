import { useEffect, useRef } from 'react';

export function useModalHistory(isOpen: boolean, onClose: () => void, modalId: string) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // When modal opens, push a state
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, modal: modalId }, '', window.location.href);

    const handlePopState = (e: PopStateEvent) => {
      // If the new state is not this modal's state, it means this modal was popped.
      if (e.state?.modal !== modalId) {
        onCloseRef.current();
      }
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
  }, [isOpen, modalId]);
}
