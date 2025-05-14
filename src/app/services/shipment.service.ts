import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, of, throwError } from "rxjs";
import { catchError, delay, map, tap } from "rxjs/operators";
import { Shipment } from "../models/shipment.model";

@Injectable({ providedIn: "root" })
export class ShipmentService {
  private shipments: Shipment[] = [];
  private shipmentsSubject = new BehaviorSubject<Shipment[]>([]);
  public shipments$ = this.shipmentsSubject.asObservable();

  constructor() {
    this.seedShipments();
  }

  private seedShipments() {
    const statuses = ["Pending", "Shipped", "Delivered"] as const;
    for (let i = 1; i <= 123; i++) {
      this.shipments.push({
        id: i,
        recipientName: `Recipient ${i}`,
        status: statuses[i % 3],
        creationDate: new Date(2024, 0, 1 + i).toISOString(),
        desiredDeliveryDate: new Date(2024, 0, 10 + i).toISOString(),
      });
    }
    this.shipmentsSubject.next(this.shipments);
  }

  fetchShipments(params: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    sortField?: keyof Shipment;
    sortDirection?: "asc" | "desc";
  }): Observable<{ data: Shipment[]; total: number }> {
    return of(this.shipments).pipe(
      delay(300),
      map((allShipments) => {
        let data = [...allShipments];

        // Search
        if (params.searchTerm) {
          const term = params.searchTerm.toLowerCase();
          data = data.filter((s) =>
            s.recipientName.toLowerCase().includes(term)
          );
        }

        // Filter
        if (params.statusFilter) {
          data = data.filter((s) => s.status === params.statusFilter);
        }

        // Sort
        if (params.sortField) {
          data.sort((a, b) => {
            const aVal = a[params.sortField!];
            const bVal = b[params.sortField!];
            return (
              (aVal! < bVal! ? -1 : 1) *
              (params.sortDirection === "asc" ? 1 : -1)
            );
          });
        }

        const total = data.length;
        const start = params.page * params.pageSize;
        const end = start + params.pageSize;
        const pagedData = data.slice(start, end);

        return { data: pagedData, total };
      }),
      catchError((err) => {
        console.error("Fetch shipments failed:", err);
        return throwError(() => new Error("Failed to fetch shipments."));
      })
    );
  }

  addShipment(shipment: Shipment): Observable<void> {
    return of(void 0).pipe(
      delay(300),
      tap(() => {
        shipment.id = this.shipments.length + 1;
        shipment.creationDate = new Date().toISOString();
        this.shipments.push(shipment);
        this.shipmentsSubject.next(this.shipments);
      }),
      catchError(() => throwError(() => new Error("Failed to add shipment")))
    );
  }

  deleteShipments(ids: number[]): Observable<void> {
    return of(void 0).pipe(
      delay(300),
      tap(() => {
        this.shipments = this.shipments.filter((s) => !ids.includes(s.id));
        this.shipmentsSubject.next(this.shipments);
      }),
      catchError(() =>
        throwError(() => new Error("Failed to delete shipments"))
      )
    );
  }

  clearAll(): Observable<void> {
    return of(void 0).pipe(
      delay(300),
      tap(() => {
        this.shipments = [];
        this.shipmentsSubject.next([]);
      })
    );
  }

  resetShipments(): Observable<void> {
    return of(void 0).pipe(
      delay(300),
      tap(() => {
        this.seedShipments(); // or whatever method resets initial data
        this.shipmentsSubject.next(this.shipments);
      })
    );
  }
  // updateShipment(shipment: Shipment): Observable<void> {
  //   return of(void 0).pipe(
  //     delay(300),
  //     tap(() => {
  //       const index = this.shipments.findIndex((s) => s.id === shipment.id);
  //       if (index > -1) {
  //         this.shipments[index] = shipment;
  //         this.shipmentsSubject.next(this.shipments);
  //       }
  //     }),
  //     catchError(() => throwError(() => new Error("Failed to update shipment")))
  //   );
  // }
}
