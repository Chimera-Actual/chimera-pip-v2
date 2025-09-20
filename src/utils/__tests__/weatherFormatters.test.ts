import { describe, it, expect } from 'vitest';
import { fmtTemp, fmtWind, fmtVisibility, fmtPressure, getWindDirection } from '../weatherFormatters';

describe('Weather Formatters', () => {
  describe('fmtTemp', () => {
    it('formats temperature in metric', () => {
      expect(fmtTemp(20, 'metric')).toBe('20°C');
      expect(fmtTemp(0, 'metric')).toBe('0°C');
      expect(fmtTemp(-10, 'metric')).toBe('-10°C');
      expect(fmtTemp(20.7, 'metric')).toBe('21°C'); // rounds
    });

    it('formats temperature in imperial', () => {
      expect(fmtTemp(20, 'imperial')).toBe('68°F'); // 20°C = 68°F
      expect(fmtTemp(0, 'imperial')).toBe('32°F'); // 0°C = 32°F
      expect(fmtTemp(-10, 'imperial')).toBe('14°F'); // -10°C = 14°F
      expect(fmtTemp(20.7, 'imperial')).toBe('69°F'); // rounds
    });
  });

  describe('fmtWind', () => {
    it('formats wind speed in metric (km/h)', () => {
      expect(fmtWind(10, 'metric')).toBe('36 km/h'); // 10 m/s = 36 km/h
      expect(fmtWind(5.5, 'metric')).toBe('20 km/h'); // 5.5 m/s = 19.8 km/h, rounds to 20
      expect(fmtWind(0, 'metric')).toBe('0 km/h');
    });

    it('formats wind speed in imperial (mph)', () => {
      expect(fmtWind(10, 'imperial')).toBe('22 mph'); // 10 m/s = 22.37 mph, rounds to 22
      expect(fmtWind(5.5, 'imperial')).toBe('12 mph'); // 5.5 m/s = 12.3 mph, rounds to 12
      expect(fmtWind(0, 'imperial')).toBe('0 mph');
    });
  });

  describe('fmtVisibility', () => {
    it('formats visibility in metric (km)', () => {
      expect(fmtVisibility(10, 'metric')).toBe('10 km');
      expect(fmtVisibility(0.5, 'metric')).toBe('1 km'); // rounds up
      expect(fmtVisibility(15.7, 'metric')).toBe('16 km'); // rounds
    });

    it('formats visibility in imperial (miles)', () => {
      expect(fmtVisibility(10, 'imperial')).toBe('6 mi'); // 10 km = 6.21 mi, rounds to 6
      expect(fmtVisibility(1.6, 'imperial')).toBe('1 mi'); // 1.6 km ≈ 1 mi
      expect(fmtVisibility(16.09, 'imperial')).toBe('10 mi'); // 16.09 km = 10 mi
    });
  });

  describe('fmtPressure', () => {
    it('formats pressure in hPa', () => {
      expect(fmtPressure(1013.25)).toBe('1013 hPa');
      expect(fmtPressure(1000.7)).toBe('1001 hPa');
      expect(fmtPressure(999)).toBe('999 hPa');
    });
  });

  describe('getWindDirection', () => {
    it('returns correct wind direction abbreviations', () => {
      expect(getWindDirection(0)).toBe('N');
      expect(getWindDirection(90)).toBe('E');
      expect(getWindDirection(180)).toBe('S');
      expect(getWindDirection(270)).toBe('W');
      expect(getWindDirection(45)).toBe('NE');
      expect(getWindDirection(135)).toBe('SE');
      expect(getWindDirection(225)).toBe('SW');
      expect(getWindDirection(315)).toBe('NW');
      expect(getWindDirection(360)).toBe('N'); // wraps around
    });

    it('handles edge cases', () => {
      expect(getWindDirection(11)).toBe('N'); // rounds to nearest
      expect(getWindDirection(12)).toBe('NNE'); // rounds to nearest
      expect(getWindDirection(355)).toBe('N'); // close to 360
    });
  });
});