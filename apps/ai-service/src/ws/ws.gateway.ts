import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SearchService } from "../modules/search/search.service";

interface SearchPayload {
  query: string;
}

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class SearchGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly searchService: SearchService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("search")
  async handleSearch(@MessageBody() payload: SearchPayload) {
    try {
      const results = await this.searchService.search(payload.query);
      return {
        event: "searchResults",
        data: results,
      };
    } catch (error) {
      return {
        event: "searchError",
        data: { message: error.message },
      };
    }
  }

  @SubscribeMessage("suggestProducts")
  async handleProductSuggestions(
    client: Socket,
    payload: { productId: string; limit?: number },
  ) {
    try {
      const suggestions = await this.searchService.getSimilarProducts(
        payload.productId,
        payload.limit,
      );
      client.emit("productSuggestions", {
        success: true,
        data: suggestions,
      });
    } catch (error) {
      client.emit("productSuggestions", {
        success: false,
        error: error.message,
      });
    }
  }

  @SubscribeMessage("suggestIngredients")
  async handleIngredientSuggestions(
    client: Socket,
    payload: { ingredientId: string; limit?: number },
  ) {
    try {
      const suggestions = await this.searchService.getSimilarIngredients(
        payload.ingredientId,
        payload.limit,
      );
      client.emit("ingredientSuggestions", {
        success: true,
        data: suggestions,
      });
    } catch (error) {
      client.emit("ingredientSuggestions", {
        success: false,
        error: error.message,
      });
    }
  }
}
