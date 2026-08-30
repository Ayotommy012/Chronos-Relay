import { Module } from '@nestjs/common';
import { AssetController } from './assets.controller';
import { AssetService } from './assets.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports:[
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 3,
    })
  ],
  controllers: [AssetController],
  providers: [AssetService],
})
export class AssetsModule {}
