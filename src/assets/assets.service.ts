import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

interface ExchangeRateApiResponse {
  rates: Record<string, number>;
}

export interface AssetRateResponse {
  asset: string;
  baseCurrency: string;
  rate: number;
  timestamp: string;
  source: string;
}

@Injectable()
export class AssetService {
  constructor(private readonly httpService: HttpService) {}

  async getAssetPrice(ticker: string): Promise<AssetRateResponse> {
    const formattedTicker = ticker.toUpperCase();

    const apiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';

    try {
      const response = await firstValueFrom(
        this.httpService.get<ExchangeRateApiResponse>(apiUrl),
      );

      const rates = response.data.rates;
      const rate = rates[formattedTicker];

      if (rate === undefined) {
        throw new HttpException(
          `Asset ticker '${formattedTicker}' was not found.`,
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        asset: formattedTicker,
        baseCurrency: 'USD',
        rate,
        timestamp: new Date().toISOString(),
        source: 'external-provider',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Failed to fetch data from upstream provider.',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }
}
