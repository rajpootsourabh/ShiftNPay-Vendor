import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
  COLUMN_PREFERENCES_KEY,
  getDefaultColumnPreferences,
  CLIENT_COLUMNS,
  REQUIRED_COLUMNS,
} from '../config/clientColumnConfig';

const BaseUrl = process.env.REACT_APP_BASH_URL;

/**
 * Custom hook for managing column preferences
 * Handles both localStorage and API persistence
 * 
 * @param {string} userId - Optional user ID for server-side persistence
 * @returns {Object} Column preferences state and handlers
 */
const useColumnPreferences = (userId = null) => {
  const [preferences, setPreferences] = useState(getDefaultColumnPreferences());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Storage key includes userId if available for multi-user support
  const storageKey = useMemo(() => {
    return userId ? `${COLUMN_PREFERENCES_KEY}_${userId}` : COLUMN_PREFERENCES_KEY;
  }, [userId]);

  /**
   * Validate preferences structure
   */
  const isValidPreferences = useCallback((prefs) => {
    if (!prefs || typeof prefs !== 'object') return false;
    if (!Array.isArray(prefs.visibleColumns)) return false;
    if (!Array.isArray(prefs.columnOrder)) return false;
    
    // Check that all required columns are in visibleColumns
    const hasAllRequired = REQUIRED_COLUMNS.every(
      (reqCol) => prefs.visibleColumns.includes(reqCol)
    );
    if (!hasAllRequired) return false;

    // Check that all column IDs are valid
    const validColumnIds = CLIENT_COLUMNS.map((col) => col.id);
    const allColumnsValid = prefs.visibleColumns.every(
      (col) => validColumnIds.includes(col)
    );
    if (!allColumnsValid) return false;

    return true;
  }, []);

  /**
   * Sanitize and validate preferences before saving
   */
  const sanitizePreferences = useCallback((prefs) => {
    const validColumnIds = CLIENT_COLUMNS.map((col) => col.id);
    
    // Filter out invalid column IDs
    let visibleColumns = prefs.visibleColumns.filter(
      (col) => validColumnIds.includes(col)
    );
    
    // Ensure required columns are always included
    REQUIRED_COLUMNS.forEach((reqCol) => {
      if (!visibleColumns.includes(reqCol)) {
        visibleColumns.unshift(reqCol);
      }
    });

    // Remove duplicates
    visibleColumns = [...new Set(visibleColumns)];

    // Filter and sanitize column order
    let columnOrder = prefs.columnOrder.filter(
      (col) => validColumnIds.includes(col)
    );
    
    // Remove duplicates
    columnOrder = [...new Set(columnOrder)];

    // Ensure all visible columns are in the order
    visibleColumns.forEach((col) => {
      if (!columnOrder.includes(col)) {
        columnOrder.push(col);
      }
    });

    return {
      visibleColumns,
      columnOrder,
    };
  }, []);

  /**
   * Fetch preferences from API
   */
  const fetchPreferencesFromAPI = useCallback(async () => {
    try {
      const token = localStorage.getItem('shinpay-vendor-token');
      const response = await axios.get(
        `${BaseUrl}/vendor/preferences/columns/clients`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data?.preferences || null;
    } catch (err) {
      // API might not exist yet, silently fail
      console.log('Column preferences API not available, using localStorage');
      return null;
    }
  }, []);

  /**
   * Save preferences to API
   */
  const savePreferencesToAPI = useCallback(async (preferencesData) => {
    try {
      const token = localStorage.getItem('shinpay-vendor-token');
      await axios.post(
        `${BaseUrl}/vendor/preferences/columns/clients`,
        { preferences: preferencesData },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (err) {
      // API might not exist yet, silently fail
      console.log('Could not save to API, using localStorage only');
    }
  }, []);

  /**
   * Load preferences from localStorage (and optionally from API)
   */
  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // First, try to load from localStorage
      const localData = localStorage.getItem(storageKey);
      
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          // Validate the loaded data
          if (isValidPreferences(parsed)) {
            setPreferences(parsed);
          } else {
            // Invalid data, reset to defaults
            const defaults = getDefaultColumnPreferences();
            setPreferences(defaults);
            localStorage.setItem(storageKey, JSON.stringify(defaults));
          }
        } catch (parseError) {
          console.error('Error parsing stored preferences:', parseError);
          const defaults = getDefaultColumnPreferences();
          setPreferences(defaults);
          localStorage.setItem(storageKey, JSON.stringify(defaults));
        }
      } else {
        // No local data, try API if userId is available
        if (userId) {
          const apiPreferences = await fetchPreferencesFromAPI();
          if (apiPreferences && isValidPreferences(apiPreferences)) {
            setPreferences(apiPreferences);
            // Cache in localStorage
            localStorage.setItem(storageKey, JSON.stringify(apiPreferences));
          } else {
            // Use defaults
            const defaults = getDefaultColumnPreferences();
            setPreferences(defaults);
            localStorage.setItem(storageKey, JSON.stringify(defaults));
          }
        } else {
          // No userId, use defaults
          const defaults = getDefaultColumnPreferences();
          setPreferences(defaults);
          localStorage.setItem(storageKey, JSON.stringify(defaults));
        }
      }
    } catch (err) {
      console.error('Error loading column preferences:', err);
      setError('Failed to load column preferences');
      // Fallback to defaults
      setPreferences(getDefaultColumnPreferences());
    } finally {
      setIsLoading(false);
    }
  }, [storageKey, userId, isValidPreferences, fetchPreferencesFromAPI]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  /**
   * Save preferences to localStorage and optionally to API
   */
  const savePreferences = useCallback(async (newPreferences) => {
    setIsSaving(true);
    setError(null);

    try {
      // Validate and sanitize preferences
      const sanitizedPreferences = sanitizePreferences(newPreferences);
      
      // Save to localStorage first (immediate)
      localStorage.setItem(storageKey, JSON.stringify(sanitizedPreferences));
      setPreferences(sanitizedPreferences);

      // If userId is available, also save to API (async)
      if (userId) {
        await savePreferencesToAPI(sanitizedPreferences);
      }

      return true;
    } catch (err) {
      console.error('Error saving column preferences:', err);
      setError('Failed to save column preferences');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [storageKey, userId, sanitizePreferences, savePreferencesToAPI]);

  /**
   * Reset preferences to defaults
   */
  const resetPreferences = useCallback(async () => {
    const defaults = getDefaultColumnPreferences();
    await savePreferences(defaults);
  }, [savePreferences]);

  /**
   * Update visible columns
   */
  const updateVisibleColumns = useCallback((visibleColumns) => {
    const newPreferences = {
      ...preferences,
      visibleColumns,
    };
    return savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  /**
   * Update column order
   */
  const updateColumnOrder = useCallback((columnOrder) => {
    const newPreferences = {
      ...preferences,
      columnOrder,
    };
    return savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  return {
    // State
    visibleColumns: preferences.visibleColumns,
    columnOrder: preferences.columnOrder,
    isLoading,
    isSaving,
    error,
    
    // Actions
    savePreferences,
    resetPreferences,
    updateVisibleColumns,
    updateColumnOrder,
    loadPreferences,
  };
};

export default useColumnPreferences;
