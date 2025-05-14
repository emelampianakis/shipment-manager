import {
  InMemoryDbService,
  RequestInfo,
  ResponseOptions,
} from "angular-in-memory-web-api";
import { Injectable } from "@angular/core";
import { Shipment } from "../models/shipment.model";
import { Observable } from "rxjs";

interface InMemoryDatabase {
  shipments: Shipment[];
}

@Injectable({ providedIn: "root" })
export class InMemoryShipmentService implements InMemoryDbService {
  private initialShipments: Shipment[] = [];

  createDb(): InMemoryDatabase {
    const statuses = ["Pending", "Shipped", "Delivered"] as const;
    const shipments: Shipment[] = [];

    for (let i = 1; i <= 123; i++) {
      shipments.push({
        id: i,
        recipientName: `Recipient ${i}`,
        status: statuses[i % 3],
        creationDate: new Date(2024, 0, 1 + i).toISOString(),
        desiredDeliveryDate: new Date(2024, 0, 10 + i).toISOString(),
      });
    }

    this.initialShipments = [...shipments];
    return { shipments };
  }

  delete(reqInfo: RequestInfo): Observable<ResponseOptions> | undefined {
    if (reqInfo.collectionName === "shipments" && reqInfo.id === "clear") {
      const db = reqInfo.utils.getDb() as { shipments: Shipment[] };
      db.shipments = [];
      return reqInfo.utils.createResponse$(() => ({
        status: 200,
        body: { success: true },
      }));
    }
    return undefined;
  }

  post(reqInfo: RequestInfo): Observable<ResponseOptions> | undefined {
    if (reqInfo.collectionName === "shipments" && reqInfo.id === "reset") {
      const db = reqInfo.utils.getDb() as { shipments: Shipment[] };
      db.shipments = [...this.initialShipments];
      return reqInfo.utils.createResponse$(() => ({
        status: 200,
        body: { success: true },
      }));
    }
    return undefined;
  }
}
