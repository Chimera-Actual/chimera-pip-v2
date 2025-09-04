import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface CryptoData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  marketCap: number;
}

export const CryptocurrencyWidget: React.FC = () => {
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { trackWidgetAction } = useAnalytics();

  useEffect(() => {
    // Simulate crypto data - in real implementation, this would fetch from a crypto API
    const mockData: CryptoData[] = [
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 65432.10,
        change24h: 2.5,
        marketCap: 1280000000000
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: 3456.78,
        change24h: -1.2,
        marketCap: 416000000000
      },
      {
        symbol: 'ATOM',
        name: 'Cosmos',
        price: 12.34,
        change24h: 5.7,
        marketCap: 4800000000
      },
      {
        symbol: 'CAPS',
        name: 'Bottle Caps',
        price: 0.001,
        change24h: 15.3,
        marketCap: 100000000
      }
    ];

    setTimeout(() => {
      setCryptoData(mockData);
      setIsLoading(false);
      trackWidgetAction('cryptocurrency', 'data_loaded');
    }, 1000);
  }, [trackWidgetAction]);

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatMarketCap = (marketCap: number) => {
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
  };

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
};