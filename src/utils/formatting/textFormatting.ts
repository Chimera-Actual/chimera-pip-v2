// Text Formatting Utilities  
export const textFormatting = {
  truncate: (text: string, maxLength: number, suffix: string = '...'): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  capitalizeWords: (text: string): string => {
    return text.replace(/\b\w/g, (char) => char.toUpperCase());
  },

  camelToKebab: (text: string): string => {
    return text.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  },

  kebabToCamel: (text: string): string => {
    return text.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
  },

  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  stripHtml: (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
  },

  highlightText: (text: string, query: string): string => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  extractInitials: (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  },

  wordCount: (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  },
};