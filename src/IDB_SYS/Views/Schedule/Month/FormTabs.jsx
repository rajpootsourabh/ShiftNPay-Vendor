import React from 'react';

const FormTabs = ({ tabs, activeTab, completedTabs, onTabChange }) => {
  return (
    <ul className="nav nav-tabs" role="tablist">
      {tabs.map((tab) => (
        <li key={tab.id} className="nav-item" role="presentation">
          <button
            type="button"
            className={`nav-link ${activeTab === tab.id ? 'active' : ''} ${
              completedTabs.includes(tab.id) ? 'completed' : ''
            }`}
            id={`${tab.id}-tab`}
            data-bs-toggle="tab"
            data-bs-target={`#${tab.id}`}
            role="tab"
            aria-controls={tab.id}
            aria-selected={activeTab === tab.id}
            onClick={() => {
              const currentIndex = tabs.findIndex(t => t.id === activeTab);
              const targetIndex = tabs.findIndex(t => t.id === tab.id);
              
              if (
                completedTabs.includes(tab.id) || 
                targetIndex === currentIndex + 1 ||
                targetIndex < currentIndex
              ) {
                onTabChange(tab.id);
              }
            }}
            disabled={
              !completedTabs.includes(tab.id) && 
              tabs.findIndex(t => t.id === tab.id) > 
              tabs.findIndex(t => t.id === activeTab) + 1
            }
          >
            {tab.label}
            {completedTabs.includes(tab.id) && (
              <span className="completed-check ms-2">✓</span>
            )}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default FormTabs;