// Web Worker for heavy computations
// Handles data processing, filtering, sorting, and analytics calculations

interface WorkerMessage {
  type: 'PROCESS_DATA' | 'CALCULATE_STATS' | 'FILTER_LARGE_SET' | 'SORT_COMPLEX';
  payload: any;
  id: string;
}

interface WorkerResponse {
  type: string;
  result: any;
  id: string;
  error?: string;
}

// Process large datasets
function processLargeDataset(data: any[]): any[] {
  return data.map(item => ({
    ...item,
    processed: true,
    timestamp: Date.now(),
    hash: generateHash(JSON.stringify(item))
  }));
}

// Calculate statistics for analytics
function calculateStatistics(data: number[]): {
  mean: number;
  median: number;
  mode: number;
  stdDev: number;
  min: number;
  max: number;
} {
  if (data.length === 0) {
    return { mean: 0, median: 0, mode: 0, stdDev: 0, min: 0, max: 0 };
  }

  // Sort for median calculation
  const sorted = [...data].sort((a, b) => a - b);
  
  // Mean
  const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
  
  // Median
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 !== 0 
    ? sorted[mid] 
    : (sorted[mid - 1] + sorted[mid]) / 2;
  
  // Mode
  const frequency: Record<number, number> = {};
  let maxFreq = 0;
  let mode = sorted[0];
  
  sorted.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
    if (frequency[num] > maxFreq) {
      maxFreq = frequency[num];
      mode = num;
    }
  });
  
  // Standard Deviation
  const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
  const stdDev = Math.sqrt(variance);
  
  return {
    mean,
    median,
    mode,
    stdDev,
    min: sorted[0],
    max: sorted[sorted.length - 1]
  };
}

// Complex filtering with multiple conditions
function filterComplexDataset(
  data: any[], 
  filters: Array<{ field: string; operator: string; value: any }>
): any[] {
  return data.filter(item => {
    return filters.every(filter => {
      const fieldValue = getNestedProperty(item, filter.field);
      
      switch (filter.operator) {
        case 'equals':
          return fieldValue === filter.value;
        case 'contains':
          return String(fieldValue).toLowerCase().includes(String(filter.value).toLowerCase());
        case 'greater':
          return fieldValue > filter.value;
        case 'less':
          return fieldValue < filter.value;
        case 'between':
          return fieldValue >= filter.value[0] && fieldValue <= filter.value[1];
        case 'in':
          return filter.value.includes(fieldValue);
        default:
          return true;
      }
    });
  });
}

// Complex sorting with multiple keys
function sortComplexDataset(
  data: any[],
  sortKeys: Array<{ field: string; direction: 'asc' | 'desc' }>
): any[] {
  return [...data].sort((a, b) => {
    for (const sortKey of sortKeys) {
      const aVal = getNestedProperty(a, sortKey.field);
      const bVal = getNestedProperty(b, sortKey.field);
      
      if (aVal < bVal) return sortKey.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortKey.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

// Utility: Get nested property from object
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// Utility: Generate simple hash
function generateHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(36);
}

// Handle messages from main thread
self.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
  const { type, payload, id } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'PROCESS_DATA':
        result = processLargeDataset(payload);
        break;
        
      case 'CALCULATE_STATS':
        result = calculateStatistics(payload);
        break;
        
      case 'FILTER_LARGE_SET':
        result = filterComplexDataset(payload.data, payload.filters);
        break;
        
      case 'SORT_COMPLEX':
        result = sortComplexDataset(payload.data, payload.sortKeys);
        break;
        
      default:
        throw new Error(`Unknown worker message type: ${type}`);
    }
    
    const response: WorkerResponse = {
      type,
      result,
      id
    };
    
    self.postMessage(response);
  } catch (error) {
    const response: WorkerResponse = {
      type,
      result: null,
      id,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    
    self.postMessage(response);
  }
});

export {};