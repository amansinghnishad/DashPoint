import { useEffect, useCallback } from "react";

/**
 * Custom hook to set up keyboard shortcuts
 * @param {Array} shortcuts - Array of shortcut objects with key combinations and handlers
 */
export const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback((event) => {
    // Check if we're in an input field
    const activeElement = document.activeElement;
    const isInputField =
      activeElement?.tagName === 'INPUT' ||
      activeElement?.tagName === 'TEXTAREA' ||
      activeElement?.isContentEditable ||
      activeElement?.hasAttribute('contenteditable');

    // Skip shortcuts when typing in input fields (unless it's Escape)
    if (isInputField && event.key !== 'Escape') {
      return;
    }

    // Skip if any modal is open (except for escape key)
    const hasOpenModal = document.querySelector('[role="dialog"]') ||
      document.querySelector('.modal-open') ||
      document.querySelector('[data-modal="true"]');

    if (hasOpenModal && event.key !== 'Escape') {
      return;
    }

    // Find matching shortcut
    const shortcut = shortcuts.find(s => {
      const keys = s.keys.toLowerCase().split('+').map(k => k.trim());

      // Check modifier keys
      const needsCtrl = keys.includes('ctrl') || keys.includes('cmd');
      const needsShift = keys.includes('shift');
      const needsAlt = keys.includes('alt');

      // Get the main key (last one in the combination)
      const mainKey = keys[keys.length - 1];

      // Check if all conditions match
      const ctrlMatch = needsCtrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = needsShift ? event.shiftKey : !event.shiftKey;
      const altMatch = needsAlt ? event.altKey : !event.altKey;
      const keyMatch = event.key.toLowerCase() === mainKey ||
        event.code.toLowerCase() === mainKey.toLowerCase();

      return ctrlMatch && shiftMatch && altMatch && keyMatch;
    });

    if (shortcut && shortcut.action) {
      event.preventDefault();
      event.stopPropagation();

      // Use requestAnimationFrame to ensure smooth interactions
      requestAnimationFrame(() => {
        shortcut.action();
      });
    }
  }, [shortcuts]);

  useEffect(() => {
    // Add event listener with capture phase to ensure we catch events early
    document.addEventListener('keydown', handleKeyDown, true);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);
};
