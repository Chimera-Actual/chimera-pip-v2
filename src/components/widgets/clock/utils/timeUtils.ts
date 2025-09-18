export interface TimeData {
  hours: number;
  minutes: number;
  seconds: number;
  ampm: string;
  date: Date;
  dayOfWeek: string;
  formattedDate: string;
  timezone: string;
}

export const timeUtils = {
  /**
   * Get formatted time data for a given date and timezone
   */
  getTimeData: (date: Date = new Date(), timezone?: string): TimeData => {
    const targetDate = timezone ? 
      new Date(date.toLocaleString("en-US", { timeZone: timezone })) : 
      date;

    const hours24 = targetDate.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = targetDate.getMinutes();
    const seconds = targetDate.getSeconds();
    const ampm = hours24 >= 12 ? 'PM' : 'AM';

    return {
      hours: hours12,
      minutes,
      seconds,
      ampm,
      date: targetDate,
      dayOfWeek: timeUtils.getDayOfWeek(targetDate),
      formattedDate: timeUtils.formatDate(targetDate),
      timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone
    };
  },

  /**
   * Format time as string with options
   */
  formatTime: (date: Date, format24: boolean = false, showSeconds: boolean = true, timezone?: string): string => {
    const timeData = timeUtils.getTimeData(date, timezone);
    const seconds = timeData.seconds.toString().padStart(2, '0');
    
    if (format24) {
      // For 24-hour format, get the actual 24-hour value considering timezone
      const targetDate = timezone ? 
        new Date(date.toLocaleString("en-US", { timeZone: timezone })) : 
        date;
      const hours = targetDate.getHours().toString().padStart(2, '0');
      const minutes = timeData.minutes.toString().padStart(2, '0');
      
      return showSeconds ? `${hours}:${minutes}:${seconds}` : `${hours}:${minutes}`;
    } else {
      // For 12-hour format
      const hours = timeData.hours.toString().padStart(2, '0');
      const minutes = timeData.minutes.toString().padStart(2, '0');
      
      return showSeconds ? 
        `${hours}:${minutes}:${seconds} ${timeData.ampm}` : 
        `${hours}:${minutes} ${timeData.ampm}`;
    }
  },

  /**
   * Format date as readable string
   */
  formatDate: (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  /**
   * Get day of week abbreviation
   */
  getDayOfWeek: (date: Date): string => {
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    return days[date.getDay()];
  },

  /**
   * Get timezone offset in hours
   */
  getTimezoneOffset: (timezone: string): number => {
    const now = new Date();
    const localOffset = now.getTimezoneOffset();
    const targetTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
    const targetOffset = (now.getTime() - targetTime.getTime()) / (1000 * 60);
    
    return (targetOffset - localOffset) / 60;
  },

  /**
   * Check if current time is night (for day/night indicators)
   */
  isNightTime: (date: Date, timezone?: string): boolean => {
    const timeData = timeUtils.getTimeData(date, timezone);
    const hour24 = timezone ? 
      new Date(date.toLocaleString("en-US", { timeZone: timezone })).getHours() :
      date.getHours();
    
    return hour24 < 6 || hour24 >= 20;
  },

  /**
   * Get available timezones for world clock
   */
  getPopularTimezones: (): Array<{ label: string; value: string; region: string }> => [
    // Americas
    { label: 'New York (EDT)', value: 'America/New_York', region: 'Americas' },
    { label: 'Los Angeles (PDT)', value: 'America/Los_Angeles', region: 'Americas' },
    { label: 'Chicago (CDT)', value: 'America/Chicago', region: 'Americas' },
    { label: 'Toronto (EDT)', value: 'America/Toronto', region: 'Americas' },
    { label: 'Mexico City (CST)', value: 'America/Mexico_City', region: 'Americas' },
    { label: 'São Paulo (BRT)', value: 'America/Sao_Paulo', region: 'Americas' },
    
    // Europe
    { label: 'London (GMT)', value: 'Europe/London', region: 'Europe' },
    { label: 'Paris (CET)', value: 'Europe/Paris', region: 'Europe' },
    { label: 'Berlin (CET)', value: 'Europe/Berlin', region: 'Europe' },
    { label: 'Rome (CET)', value: 'Europe/Rome', region: 'Europe' },
    { label: 'Moscow (MSK)', value: 'Europe/Moscow', region: 'Europe' },
    { label: 'Madrid (CET)', value: 'Europe/Madrid', region: 'Europe' },
    
    // Asia & Pacific
    { label: 'Tokyo (JST)', value: 'Asia/Tokyo', region: 'Asia' },
    { label: 'Shanghai (CST)', value: 'Asia/Shanghai', region: 'Asia' },
    { label: 'Singapore (SGT)', value: 'Asia/Singapore', region: 'Asia' },
    { label: 'Mumbai (IST)', value: 'Asia/Kolkata', region: 'Asia' },
    { label: 'Dubai (GST)', value: 'Asia/Dubai', region: 'Asia' },
    { label: 'Sydney (AEDT)', value: 'Australia/Sydney', region: 'Pacific' },
    { label: 'Auckland (NZDT)', value: 'Pacific/Auckland', region: 'Pacific' },
    
    // Africa
    { label: 'Cairo (EET)', value: 'Africa/Cairo', region: 'Africa' },
    { label: 'Lagos (WAT)', value: 'Africa/Lagos', region: 'Africa' },
    { label: 'Johannesburg (SAST)', value: 'Africa/Johannesburg', region: 'Africa' }
  ],

  /**
   * Parse time string to hours and minutes
   */
  parseTimeString: (timeStr: string): { hours: number; minutes: number } => {
    const [time, ampm] = timeStr.split(' ');
    const [hoursStr, minutesStr] = time.split(':');
    let hours = parseInt(hoursStr);
    const minutes = parseInt(minutesStr);

    if (ampm === 'PM' && hours !== 12) {
      hours += 12;
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes };
  },

  /**
   * Convert 24-hour time to 12-hour format
   */
  to12HourFormat: (hours: number, minutes: number): string => {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  },

  /**
   * Convert 12-hour time to 24-hour format
   */
  to24HourFormat: (hours: number, minutes: number): string => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
};