// Accessibility Utilities for Chimera-PIP 4000 mk2

// ARIA label generators
export const generateAriaLabel = {
  widgetCollapse: (title: string, collapsed: boolean) => 
    `${collapsed ? 'Expand' : 'Collapse'} ${title} widget`,
  
  widgetSettings: (title: string) => 
    `Open settings for ${title} widget`,
  
  widgetDelete: (title: string) => 
    `Delete ${title} widget`,
  
  tabSwitch: (tabName: string) => 
    `Switch to ${tabName} tab`,
  
  addWidget: (widgetType: string) => 
    `Add ${widgetType} widget to current tab`,
  
  searchWidget: () => 
    'Search available widgets',
  
  filterTags: (tagName: string) => 
    `Toggle ${tagName} filter`,
};

// Focus management utilities
export const focusManagement = {
  trapFocus: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKey);
    firstElement.focus();
    
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },
  
  restoreFocus: (previousElement: HTMLElement | null) => {
    if (previousElement && document.contains(previousElement)) {
      previousElement.focus();
    }
  }
};

// Color contrast validation
export const validateContrast = (background: string, foreground: string): boolean => {
  // This is a simplified contrast check
  // In a real app, you'd use a proper color contrast library
  const getLuminance = (color: string): number => {
    // Simplified luminance calculation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(background);
  const l2 = getLuminance(foreground);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  
  return ratio >= 4.5; // WCAG AA standard
};

// Screen reader announcements
export const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
};

// Keyboard navigation helpers
export const keyboardNavigation = {
  handleArrowKeys: (
    event: KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    onIndexChange: (newIndex: number) => void
  ) => {
    let newIndex = currentIndex;
    
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      default:
        return;
    }
    
    onIndexChange(newIndex);
    (items[newIndex] as HTMLElement).focus();
  }
};

// Touch accessibility helpers
export const touchAccessibility = {
  // Ensure minimum touch target size (44x44px)
  getTouchTargetStyle: (size: 'small' | 'medium' | 'large' = 'medium') => {
    const sizes = {
      small: 'min-h-[44px] min-w-[44px]',
      medium: 'min-h-[48px] min-w-[48px]', 
      large: 'min-h-[56px] min-w-[56px]'
    };
    return sizes[size];
  }
};