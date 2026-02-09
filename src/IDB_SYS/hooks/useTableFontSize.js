import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'shipnpay_client_table_font_size';
const DEFAULT_FONT_SIZE = 14;
const MIN_FONT_SIZE = 12;
const MAX_FONT_SIZE = 20;
const FONT_STEP = 1;

/**
 * Custom hook for managing table font size with localStorage persistence
 * @returns {Object} Font size state and control functions
 */
const useTableFontSize = () => {
  const [fontSize, setFontSize] = useState(() => {
    // Initialize from localStorage or use default
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = parseInt(stored, 10);
        if (parsed >= MIN_FONT_SIZE && parsed <= MAX_FONT_SIZE) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('Error reading font size from localStorage:', error);
    }
    return DEFAULT_FONT_SIZE;
  });

  // Persist to localStorage whenever fontSize changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, fontSize.toString());
    } catch (error) {
      console.warn('Error saving font size to localStorage:', error);
    }
  }, [fontSize]);

  // Increase font size
  const increaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.min(prev + FONT_STEP, MAX_FONT_SIZE));
  }, []);

  // Decrease font size
  const decreaseFontSize = useCallback(() => {
    setFontSize((prev) => Math.max(prev - FONT_STEP, MIN_FONT_SIZE));
  }, []);

  // Reset to default
  const resetFontSize = useCallback(() => {
    setFontSize(DEFAULT_FONT_SIZE);
  }, []);

  // Check if at limits
  const canIncrease = fontSize < MAX_FONT_SIZE;
  const canDecrease = fontSize > MIN_FONT_SIZE;

  return {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    canIncrease,
    canDecrease,
    minFontSize: MIN_FONT_SIZE,
    maxFontSize: MAX_FONT_SIZE,
  };
};

export default useTableFontSize;
