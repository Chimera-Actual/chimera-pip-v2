import { ValidationSchema } from './types';
import { commonRules } from './core';
import { WIDGET_SETTINGS_VALIDATION } from '@/constants/widgets';

export const widgetValidationSchemas = {
  widgetInstance: {
    title: [
      commonRules.required,
      {
        maxLength: WIDGET_SETTINGS_VALIDATION.MAX_TITLE_LENGTH,
        message: `Title must be less than ${WIDGET_SETTINGS_VALIDATION.MAX_TITLE_LENGTH} characters`,
      },
    ],
    customIcon: [
      {
        type: 'string',
        pattern: /^[a-z-]+$/,
        message: 'Icon name must be lowercase with hyphens only',
      },
    ],
  } as ValidationSchema,

  newsTerminalSettings: {
    maxItems: [
      commonRules.required,
      {
        type: 'number',
        min: 1,
        max: WIDGET_SETTINGS_VALIDATION.MAX_ITEMS_PER_WIDGET,
      },
    ],
    refreshInterval: [
      commonRules.required,
      {
        type: 'number',
        min: WIDGET_SETTINGS_VALIDATION.MIN_REFRESH_INTERVAL,
        max: WIDGET_SETTINGS_VALIDATION.MAX_REFRESH_INTERVAL,
      },
    ],
    categories: [
      commonRules.required,
      {
        type: 'array',
        custom: (value: string[]) => value.length > 0,
        message: 'At least one category must be selected',
      },
    ],
  } as ValidationSchema,

  weatherStationSettings: {
    location: [
      commonRules.required,
      {
        minLength: 2,
        maxLength: 50,
        message: 'Location must be between 2 and 50 characters',
      },
    ],
    temperatureUnit: [
      commonRules.required,
      {
        type: 'string',
        pattern: /^[FC]$/,
        message: 'Temperature unit must be F or C',
      },
    ],
    refreshInterval: [
      {
        type: 'number',
        min: WIDGET_SETTINGS_VALIDATION.MIN_REFRESH_INTERVAL,
        max: WIDGET_SETTINGS_VALIDATION.MAX_REFRESH_INTERVAL,
      },
    ],
  } as ValidationSchema,

  aiOracleSettings: {
    selectedAgentId: [
      {
        type: 'string',
        pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
        message: 'Invalid agent ID format',
      },
    ],
    maxTokens: [
      {
        type: 'number',
        min: 100,
        max: 4000,
        message: 'Max tokens must be between 100 and 4000',
      },
    ],
    temperature: [
      {
        type: 'number',
        min: 0,
        max: 2,
        message: 'Temperature must be between 0 and 2',
      },
    ],
    maxHistoryLength: [
      {
        type: 'number',
        min: 1,
        max: 200,
        message: 'History length must be between 1 and 200',
      },
    ],
  } as ValidationSchema,

  systemMonitorSettings: {
    refreshRate: [
      commonRules.required,
      {
        type: 'number',
        min: 1000,
        max: 60000,
        message: 'Refresh rate must be between 1 and 60 seconds',
      },
    ],
    monitoredMetrics: [
      commonRules.required,
      {
        type: 'array',
        custom: (value: string[]) => value.length > 0,
        message: 'At least one metric must be monitored',
      },
    ],
    alertThresholds: [
      {
        type: 'object',
        custom: (value: Record<string, number>) => {
          return Object.values(value).every(threshold => 
            typeof threshold === 'number' && threshold > 0 && threshold <= 100
          );
        },
        message: 'All thresholds must be numbers between 0 and 100',
      },
    ],
  } as ValidationSchema,

  cryptoCurrencySettings: {
    symbols: [
      commonRules.required,
      {
        type: 'array',
        custom: (value: string[]) => value.length > 0 && value.length <= 20,
        message: 'Must select between 1 and 20 cryptocurrencies',
      },
    ],
    currency: [
      commonRules.required,
      {
        type: 'string',
        pattern: /^[A-Z]{3}$/,
        message: 'Currency must be a 3-letter code (e.g., USD, EUR)',
      },
    ],
    refreshInterval: [
      {
        type: 'number',
        min: 30000, // 30 seconds minimum for crypto APIs
        max: WIDGET_SETTINGS_VALIDATION.MAX_REFRESH_INTERVAL,
      },
    ],
  } as ValidationSchema,

  calendarMissionSettings: {
    maxTasks: [
      {
        type: 'number',
        min: 1,
        max: 50,
        message: 'Max tasks must be between 1 and 50',
      },
    ],
    priorityFilter: [
      {
        type: 'array',
        custom: (value: string[]) => {
          const validPriorities = ['low', 'medium', 'high', 'critical'];
          return value.every(priority => validPriorities.includes(priority));
        },
        message: 'Invalid priority levels selected',
      },
    ],
  } as ValidationSchema,
};

export const getWidgetValidationSchema = (widgetType: string, settingsType: string = 'settings') => {
  const schemaKey = `${widgetType}${settingsType.charAt(0).toUpperCase() + settingsType.slice(1)}`;
  return widgetValidationSchemas[schemaKey as keyof typeof widgetValidationSchemas];
};

export const validateWidgetSettings = (widgetType: string, settings: any) => {
  const schema = getWidgetValidationSchema(widgetType);
  if (!schema) {
    return { isValid: true, errors: {} };
  }

  // Use the Validator from core.ts when implemented
  return { isValid: true, errors: {} }; // Placeholder
};