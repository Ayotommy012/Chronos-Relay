import { Controller,Get, Param } from '@nestjs/common';
import { AssetService, AssetRateResponse } from './assets.service';

@Controller('api/v1/assets')
export class AssetController {
    constructor(private readonly assetsService: AssetService) {}

    @Get(':ticker')
    async getAsset(@Param('ticker') ticker:string): Promise<AssetRateResponse>{
        return this.assetsService.getAssetPrice(ticker);
    }
}
