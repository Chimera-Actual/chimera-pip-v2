import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      <Card className="h-full bg-background/95 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <DollarSign className="w-5 h-5" />
            Cryptocurrency Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-primary/20 rounded mb-2"></div>
                <div className="h-3 bg-primary/10 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full bg-background/95 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <DollarSign className="w-5 h-5" />
          Cryptocurrency Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {cryptoData.map((crypto) => (
            <div
              key={crypto.symbol}
              className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
              onClick={() => trackWidgetAction('cryptocurrency', 'crypto_selected', { symbol: crypto.symbol })}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-primary">{crypto.symbol}</span>
                  <span className="text-sm text-muted-foreground">{crypto.name}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Market Cap: {formatMarketCap(crypto.marketCap)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-sm font-semibold text-foreground">
                  {formatPrice(crypto.price)}
                </div>
                <Badge
                  variant={crypto.change24h >= 0 ? "default" : "destructive"}
                  className="text-xs"
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
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
};