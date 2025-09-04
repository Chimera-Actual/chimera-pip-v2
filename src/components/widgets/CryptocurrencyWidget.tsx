import React, { useState, useEffect, useCallback, memo } from 'react';
import { BaseWidget, CryptocurrencySettings } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { webhookService } from '@/lib/webhookService';
import { reportError } from '@/lib/errorReporting';
import { ERROR_MESSAGES } from '@/lib/constants';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: string;
}

interface CryptocurrencyWidgetProps {
  widget: BaseWidget;
}

export const CryptocurrencyWidget: React.FC<CryptocurrencyWidgetProps> = memo(({ widget }) => {
  const { settings } = useWidgetState(widget.id, widget.settings);
  const cryptoSettings = settings as CryptocurrencySettings;
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackWidgetAction } = useAnalytics();

  const cryptoSymbols = cryptoSettings?.symbols || ['BTC', 'ETH', 'ATOM', 'CAPS'];
  const currency = cryptoSettings?.currency || 'USD';

  const fetchCryptoData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await webhookService.callCryptoApi({
        symbols: cryptoSymbols,
        currency: currency.toLowerCase()
      });

      if (!response.success) {
        throw new Error(response.error || ERROR_MESSAGES.WEBHOOK_FAILED);
      }

      setCryptoData(response.data || []);
      trackWidgetAction('cryptocurrency', 'data_loaded');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch crypto data';
      setError(errorMessage);
      reportError('Crypto fetch error', { widgetId: widget.id, symbols: cryptoSymbols }, error);
    } finally {
      setIsLoading(false);
    }
  }, [cryptoSymbols, currency, widget.id, trackWidgetAction]);

  useEffect(() => {
    fetchCryptoData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchCryptoData, 30000);
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  const formatPrice = useCallback((price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, []);

  const formatMarketCap = useCallback((marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(1)}T`;
    }
    if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(1)}B`;
    }
    if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(1)}M`;
    }
    return `$${marketCap.toLocaleString()}`;
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-pip-border/50 rounded mb-2"></div>
              <div className="h-3 bg-pip-border/30 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-4 text-center">
        <DollarSign className="h-8 w-8 text-pip-text-muted mb-2" />
        <p className="text-sm text-pip-text-muted font-pip-mono mb-2">Crypto data unavailable</p>
        <p className="text-xs text-pip-text-muted font-pip-mono">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 space-y-4">
        {cryptoData.map((crypto) => (
          <div
            key={crypto.symbol}
            className="flex items-center justify-between p-3 rounded-lg bg-pip-bg-secondary/50 border border-pip-border/50 hover:bg-pip-bg-secondary/80 transition-colors cursor-pointer pip-special-stat"
            onClick={() => trackWidgetAction('cryptocurrency', 'crypto_selected', { symbol: crypto.symbol })}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-primary font-pip-display">{crypto.symbol}</span>
                <span className="text-sm text-pip-text-secondary font-pip-mono">{crypto.name}</span>
              </div>
              <div className="text-xs text-pip-text-muted font-pip-mono">
                Market Cap: {formatMarketCap(crypto.marketCap)}
              </div>
            </div>
            <div className="text-right">
              <div className="font-pip-mono text-sm font-semibold text-primary">
                {formatPrice(crypto.price)}
              </div>
              <Badge
                variant={crypto.change24h >= 0 ? "default" : "destructive"}
                className="text-xs font-pip-mono"
              >
                {crypto.change24h >= 0 ? (
                  <TrendingUp className="w-3 h-3 mr-1" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1" />
                )}
                {crypto.change24h >= 0 ? '+' : ''}{crypto.change24h.toFixed(1)}%
              </Badge>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-auto p-4 text-xs text-pip-text-muted text-center font-pip-mono border-t border-pip-border/30">
        Last updated: {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
});

CryptocurrencyWidget.displayName = 'CryptocurrencyWidget';