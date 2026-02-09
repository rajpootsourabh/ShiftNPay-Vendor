import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaArrowUp, FaArrowDown, FaColumns, FaCheck, FaTimes, FaSearch, FaChevronRight, FaChevronDown } from 'react-icons/fa';
import PropTypes from 'prop-types';
import {
  CLIENT_COLUMNS,
  COLUMN_CATEGORIES,
  REQUIRED_COLUMNS,
  getColumnsByCategory,
} from '../../config/clientColumnConfig';
import './ColumnChooser.css';

/**
 * ColumnChooser Component
 * A modal-based UI for selecting and ordering table columns
 * Features:
 * - Checkbox selection for visible columns
 * - Drag-free up/down reordering controls
 * - Search/filter functionality
 * - Category grouping
 * - Select All / Remove All
 * - Keyboard accessibility
 */
const ColumnChooser = ({
  isOpen,
  onClose,
  visibleColumns,
  columnOrder,
  onApply,
}) => {
  // Local state for working with selections before applying
  const [localVisibleColumns, setLocalVisibleColumns] = useState([]);
  const [localColumnOrder, setLocalColumnOrder] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState({});
  const [activeTab, setActiveTab] = useState('select'); // 'select' or 'order'
  
  const searchInputRef = useRef(null);
  const modalBodyRef = useRef(null);

  // Initialize local state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalVisibleColumns([...visibleColumns]);
      setLocalColumnOrder([...columnOrder]);
      setSearchTerm('');
      // Expand all categories by default
      const allCategories = Object.values(COLUMN_CATEGORIES).reduce((acc, cat) => {
        acc[cat] = true;
        return acc;
      }, {});
      setExpandedCategories(allCategories);
    }
  }, [isOpen, visibleColumns, columnOrder]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Get columns grouped by category
  const columnsByCategory = useMemo(() => getColumnsByCategory(), []);

  // Filter columns based on search term
  const filteredColumnsByCategory = useMemo(() => {
    if (!searchTerm.trim()) return columnsByCategory;

    const lowerSearch = searchTerm.toLowerCase();
    const filtered = {};

    Object.entries(columnsByCategory).forEach(([category, columns]) => {
      const matchingColumns = columns.filter(
        (col) =>
          col.label.toLowerCase().includes(lowerSearch) ||
          col.id.toLowerCase().includes(lowerSearch)
      );
      if (matchingColumns.length > 0) {
        filtered[category] = matchingColumns;
      }
    });

    return filtered;
  }, [columnsByCategory, searchTerm]);

  // Get ordered columns for the order tab
  const orderedSelectedColumns = useMemo(() => {
    return localColumnOrder
      .filter((id) => localVisibleColumns.includes(id))
      .map((id) => CLIENT_COLUMNS.find((col) => col.id === id))
      .filter(Boolean);
  }, [localColumnOrder, localVisibleColumns]);

  // Handle checkbox toggle
  const handleColumnToggle = useCallback((columnId, isRequired) => {
    if (isRequired) return; // Cannot toggle required columns

    setLocalVisibleColumns((prev) => {
      const isCurrentlyVisible = prev.includes(columnId);
      if (isCurrentlyVisible) {
        return prev.filter((id) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });

    // Add to order if not present
    setLocalColumnOrder((prev) => {
      if (!prev.includes(columnId)) {
        return [...prev, columnId];
      }
      return prev;
    });
  }, []);

  // Handle Select All
  const handleSelectAll = useCallback(() => {
    const allColumnIds = CLIENT_COLUMNS.map((col) => col.id);
    setLocalVisibleColumns(allColumnIds);
    
    // Add any missing columns to order
    setLocalColumnOrder((prev) => {
      const newOrder = [...prev];
      allColumnIds.forEach((id) => {
        if (!newOrder.includes(id)) {
          newOrder.push(id);
        }
      });
      return newOrder;
    });
  }, []);

  // Handle Remove All (except required)
  const handleRemoveAll = useCallback(() => {
    setLocalVisibleColumns([...REQUIRED_COLUMNS]);
  }, []);

  // Handle moving column up in order
  const handleMoveUp = useCallback((columnId) => {
    setLocalColumnOrder((prev) => {
      const index = prev.indexOf(columnId);
      if (index <= 0) return prev;
      
      const newOrder = [...prev];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      return newOrder;
    });
  }, []);

  // Handle moving column down in order
  const handleMoveDown = useCallback((columnId) => {
    setLocalColumnOrder((prev) => {
      const index = prev.indexOf(columnId);
      if (index < 0 || index >= prev.length - 1) return prev;
      
      const newOrder = [...prev];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      return newOrder;
    });
  }, []);

  // Handle category expand/collapse
  const toggleCategory = useCallback((category) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  }, []);

  // Handle Apply
  const handleApply = useCallback(() => {
    // Ensure at least required columns are visible
    const finalVisibleColumns = [...new Set([...REQUIRED_COLUMNS, ...localVisibleColumns])];
    
    // Filter order to only include visible columns, maintaining order
    const finalOrder = localColumnOrder.filter((id) => finalVisibleColumns.includes(id));
    
    // Add any visible columns that might not be in order (shouldn't happen, but safety check)
    finalVisibleColumns.forEach((id) => {
      if (!finalOrder.includes(id)) {
        finalOrder.push(id);
      }
    });

    onApply({
      visibleColumns: finalVisibleColumns,
      columnOrder: finalOrder,
    });
    onClose();
  }, [localVisibleColumns, localColumnOrder, onApply, onClose]);

  // Handle Cancel
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e, columnId, isInOrderList = false) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isInOrderList) {
        const col = CLIENT_COLUMNS.find((c) => c.id === columnId);
        handleColumnToggle(columnId, col?.required);
      }
    } else if (isInOrderList) {
      if (e.key === 'ArrowUp' && e.altKey) {
        e.preventDefault();
        handleMoveUp(columnId);
      } else if (e.key === 'ArrowDown' && e.altKey) {
        e.preventDefault();
        handleMoveDown(columnId);
      }
    }
  }, [handleColumnToggle, handleMoveUp, handleMoveDown]);

  // Count selected columns
  const selectedCount = localVisibleColumns.length;
  const totalCount = CLIENT_COLUMNS.length;

  if (!isOpen) return null;

  return (
    <Modal
      show={isOpen}
      onHide={handleCancel}
      size="lg"
      centered
      className="column-chooser-modal"
      aria-labelledby="column-chooser-title"
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title id="column-chooser-title">
          <FaColumns className="me-2" />
          Column Chooser
          <span className="ms-2 badge bg-secondary">
            {selectedCount} / {totalCount} selected
          </span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body ref={modalBodyRef}>
        {/* Tab Navigation */}
        <ul className="nav nav-tabs mb-3" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'select' ? 'active' : ''}`}
              onClick={() => setActiveTab('select')}
              type="button"
              role="tab"
              aria-selected={activeTab === 'select'}
              aria-controls="select-panel"
            >
              Select Columns
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'order' ? 'active' : ''}`}
              onClick={() => setActiveTab('order')}
              type="button"
              role="tab"
              aria-selected={activeTab === 'order'}
              aria-controls="order-panel"
            >
              Column Order
            </button>
          </li>
        </ul>

        {/* Select Columns Tab */}
        {activeTab === 'select' && (
          <div id="select-panel" role="tabpanel">
            {/* Search Input */}
            <div className="column-chooser-search mb-3">
              <div className="input-group">
                <span className="input-group-text">
                  <FaSearch />
                </span>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="form-control"
                  placeholder="Search columns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search columns"
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => setSearchTerm('')}
                    aria-label="Clear search"
                  >
                    <FaTimes />
                  </button>
                )}
              </div>
            </div>

            {/* Select All / Remove All Buttons */}
            <div className="d-flex gap-2 mb-3">
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleSelectAll}
                disabled={selectedCount === totalCount}
              >
                <FaCheck className="me-1" /> Select All
              </Button>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={handleRemoveAll}
                disabled={selectedCount === REQUIRED_COLUMNS.length}
              >
                <FaTimes className="me-1" /> Remove All
              </Button>
            </div>

            {/* Column List by Category */}
            <div className="column-chooser-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {Object.entries(filteredColumnsByCategory).length === 0 ? (
                <div className="text-center text-muted py-4">
                  No columns match your search.
                </div>
              ) : (
                Object.entries(filteredColumnsByCategory).map(([category, columns]) => (
                  <div key={category} className="column-category mb-2">
                    <button
                      className="column-category-header btn btn-link text-start w-100 p-2"
                      onClick={() => toggleCategory(category)}
                      aria-expanded={expandedCategories[category]}
                      aria-controls={`category-${category.replace(/\s+/g, '-')}`}
                    >
                      {expandedCategories[category] ? (
                        <FaChevronDown className="category-arrow-icon" />
                      ) : (
                        <FaChevronRight className="category-arrow-icon" />
                      )}
                      <span className="fw-bold ms-2">{category}</span>
                      <span className="badge bg-light text-dark ms-2">
                        {columns.filter((col) => localVisibleColumns.includes(col.id)).length} / {columns.length}
                      </span>
                    </button>

                    {expandedCategories[category] && (
                      <div
                        id={`category-${category.replace(/\s+/g, '-')}`}
                        className="column-category-items ps-4"
                      >
                        {columns.map((column) => {
                          const isRequired = REQUIRED_COLUMNS.includes(column.id);
                          const isChecked = localVisibleColumns.includes(column.id);

                          return (
                            <div
                              key={column.id}
                              className={`column-item d-flex align-items-center py-1 ${isRequired ? 'required-column' : ''}`}
                            >
                              <Form.Check
                                type="checkbox"
                                id={`column-${column.id}`}
                                label={column.label}
                                checked={isChecked}
                                disabled={isRequired}
                                onChange={() => handleColumnToggle(column.id, isRequired)}
                                onKeyDown={(e) => handleKeyDown(e, column.id)}
                                className="flex-grow-1"
                              />
                              {isRequired && (
                                <span className="badge bg-warning text-dark ms-2" title="Required column">
                                  Required
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Column Order Tab */}
        {activeTab === 'order' && (
          <div id="order-panel" role="tabpanel">
            <p className="text-muted small mb-3">
              Use the arrow buttons to reorder columns. Press Alt+↑ or Alt+↓ for keyboard navigation.
            </p>

            <div className="column-order-list" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {orderedSelectedColumns.length === 0 ? (
                <div className="text-center text-muted py-4">
                  No columns selected. Please select columns in the "Select Columns" tab.
                </div>
              ) : (
                orderedSelectedColumns.map((column, index) => {
                  const isFirst = index === 0;
                  const isLast = index === orderedSelectedColumns.length - 1;
                  const isRequired = REQUIRED_COLUMNS.includes(column.id);

                  return (
                    <div
                      key={column.id}
                      className={`column-order-item d-flex align-items-center p-2 border rounded mb-2 ${
                        isRequired ? 'border-warning' : ''
                      }`}
                      tabIndex={0}
                      onKeyDown={(e) => handleKeyDown(e, column.id, true)}
                      role="listitem"
                      aria-label={`${column.label}, position ${index + 1} of ${orderedSelectedColumns.length}`}
                    >
                      <span className="column-order-number badge bg-secondary me-2">
                        {index + 1}
                      </span>
                      <span className="flex-grow-1">
                        {column.label}
                        {isRequired && (
                          <span className="badge bg-warning text-dark ms-2" title="Required column">
                            Required
                          </span>
                        )}
                      </span>
                      <div className="column-order-controls">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          className="me-1"
                          onClick={() => handleMoveUp(column.id)}
                          disabled={isFirst}
                          aria-label={`Move ${column.label} up`}
                          title="Move up"
                        >
                          <FaArrowUp />
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleMoveDown(column.id)}
                          disabled={isLast}
                          aria-label={`Move ${column.label} down`}
                          title="Move down"
                        >
                          <FaArrowDown />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleApply}>
          <FaCheck className="me-1" /> Apply
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ColumnChooser.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  visibleColumns: PropTypes.arrayOf(PropTypes.string).isRequired,
  columnOrder: PropTypes.arrayOf(PropTypes.string).isRequired,
  onApply: PropTypes.func.isRequired,
};

export default React.memo(ColumnChooser);
