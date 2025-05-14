import {
  InMemoryDbService,
  RequestInfo,
  ResponseOptions,
} from "angular-in-memory-web-api";
import { Injectable } from "@angular/core";
import { Shipment } from "../models/shipment.model";
import { Observable } from "rxjs";
import { HttpHeaders } from "@angular/common/http";

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
        creationDate: new Date(2024, 0, 1 + i),
        desiredDeliveryDate: new Date(2024, 0, 10 + i),
      });
    }

    this.initialShipments = [...shipments];
    return { shipments };
  }

  genId(shipments: Shipment[]): number {
    return shipments.length > 0
      ? Math.max(...shipments.map((s) => s.id)) + 1
      : 1;
  }

  get(reqInfo: RequestInfo): Observable<any> | undefined {
    if (reqInfo.collectionName === "shipments") {
      return this.getFilteredShipments(reqInfo);
    }
    return undefined;
  }

  private getFilteredShipments(reqInfo: RequestInfo): Observable<any> {
    const db = reqInfo.utils.getDb() as { shipments: Shipment[] };
    let data = [...db.shipments];

    const params = reqInfo.query;

    const searchTerm = params.get("recipientName_like")?.[0];
    if (searchTerm) {
      data = data.filter((s) =>
        s.recipientName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    const status = params.get("status")?.[0];
    if (status) {
      data = data.filter((s) => s.status === status);
    }

    const sortField = params.get("_sort")?.[0];
    const sortOrder = params.get("_order")?.[0];
    if (sortField && sortOrder) {
      data.sort((a, b) => {
        const aVal = (a as any)[sortField];
        const bVal = (b as any)[sortField];
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    const page = parseInt(params.get("_page")?.[0] ?? "1", 10);
    const limit = parseInt(params.get("_limit")?.[0] ?? "10", 10);
    const start = (page - 1) * limit;
    const pagedData = data.slice(start, start + limit);

    const response = reqInfo.utils.createResponse$(() => ({
      body: pagedData,
      status: 200,
      headers: new HttpHeaders({
        "x-total-count": data.length.toString(), // Pagination header
      }),
      url: reqInfo.url,
    }));

    return response;
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
