import { useEffect } from "react";

/**
 * Custom hook to set up keyboard shortcuts
 * @param {Array} shortcuts - Array of shortcut objects with key combinations and handlers
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check if we're in an input field
      const activeElement = document.activeElement;
      const isInputField =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.isContentEditable;

      // Skip shortcuts when typing in input fields (unless it's Escape)
      if (isInputField && event.key !== 'Escape') {
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
        shortcut.action();
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [shortcuts]);
};
