// Widget Validation
import { ValidationResult } from './types';
import { WIDGET_DIMENSIONS } from '@/constants/widgets';

export const widgetValidation = {
  title: (title: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!title || title.trim().length === 0) {
      errors.push('Widget title is required');
    } else if (title.length > 50) {
      errors.push('Widget title must not exceed 50 characters');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  dimensions: (width: number, height: number): ValidationResult => {
    const errors: string[] = [];
    
    if (width < WIDGET_DIMENSIONS.MIN_WIDTH) {
      errors.push(`Width must be at least ${WIDGET_DIMENSIONS.MIN_WIDTH}px`);
    }
    
    if (height < WIDGET_DIMENSIONS.MIN_HEIGHT) {
      errors.push(`Height must be at least ${WIDGET_DIMENSIONS.MIN_HEIGHT}px`);
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  settings: (settings: Record<string, any>): ValidationResult => {
    const errors: string[] = [];
    
    if (!settings || typeof settings !== 'object') {
      errors.push('Widget settings must be a valid object');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  widgetType: (type: string): ValidationResult => {
    const errors: string[] = [];
    const validTypes = [
      'character-profile',
      'special-stats',
      'system-monitor',
      'weather-station',
      'achievement-gallery',
      'file-explorer',
      'secure-vault',
      'news-terminal',
      'audio-player',
      'calendar-mission',
      'ai-oracle',
      'cryptocurrency',
      'terminal',
    ];
    
    if (!type) {
      errors.push('Widget type is required');
    } else if (!validTypes.includes(type)) {
      errors.push('Invalid widget type');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};