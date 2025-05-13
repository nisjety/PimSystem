import { Module } from "@nestjs/common";
import { SearchGateway } from "./ws.gateway";
import { SearchModule } from "../modules/search/search.module";

@Module({
  imports: [SearchModule],
  providers: [SearchGateway],
})
export class WsModule {}
