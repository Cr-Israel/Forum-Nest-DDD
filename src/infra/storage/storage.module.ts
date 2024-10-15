import { Module } from "@nestjs/common";

import { EnvModule } from "../env/env.module";
import { TebiStorage } from "./tebi-storage";
import { Uploader } from "@/domain/forum/application/storage/uploader";

@Module({
  imports: [EnvModule],
  providers: [
    {
      provide: Uploader,
      useClass: TebiStorage,
    },
  ],
  exports: [Uploader],
})
export class StorageModule { }