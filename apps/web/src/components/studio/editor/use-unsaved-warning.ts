import { useEffect } from 'react';

/**
 * Asks before the tab is closed or reloaded while there are edits that have
 * not been saved. The browser words the question itself. This is a real
 * subscription to something outside React, which is what an effect is for.
 */
export function useUnsavedWarning(unsaved: boolean): void {
  useEffect(() => {
    if (!unsaved) return undefined;
    const warn = (event: BeforeUnloadEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
    };
  }, [unsaved]);
}
