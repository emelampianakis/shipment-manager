import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Shipment } from "../models/shipment.model";

@Injectable({ providedIn: "root" })
export class ShipmentService {
  private readonly API_URL = "/api/shipments";

  constructor(private http: HttpClient) {}

  fetchShipments(params: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    sortField?: keyof Shipment;
    sortDirection?: "asc" | "desc";
  }): Observable<{ data: Shipment[]; total: number }> {
    return this.http.get<Shipment[]>(this.API_URL).pipe(
      map((shipments) => {
        let data = [...shipments];

        if (params.searchTerm) {
          const term = params.searchTerm.toLowerCase();
          data = data.filter((s) =>
            s.recipientName.toLowerCase().includes(term)
          );
        }

        if (params.statusFilter) {
          data = data.filter((s) => s.status === params.statusFilter);
        }

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

  addShipment(shipment: Shipment): Observable<Shipment> {
    return this.http
      .post<Shipment>(this.API_URL, shipment)
      .pipe(
        catchError(() => throwError(() => new Error("Failed to add shipment")))
      );
  }

  deleteShipments(ids: number[]): Observable<void[]> {
    return new Observable<void[]>((observer) => {
      const requests = ids.map((id) =>
        this.http.delete<void>(`${this.API_URL}/${id}`).toPromise()
      );
      Promise.all(requests)
        .then((res) => {
          observer.next(res);
          observer.complete();
        })
        .catch((err) => observer.error("Failed to delete shipments"));
    });
  }

  clearAll(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/clear`);
  }

  resetShipments(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/reset`, {});
  }
}
