import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError, combineLatest } from "rxjs";
import { catchError, map } from "rxjs/operators";
import { Shipment } from "../models/shipment.model";
import { InMemoryShipmentService } from "./in-memory-shipment.service";

@Injectable({ providedIn: "root" })
export class ShipmentService {
  private readonly API_URL = "/api/shipments";

  private shipmentsSubject = new BehaviorSubject<Shipment[]>([]);
  public shipments$ = this.shipmentsSubject.asObservable();

  private filtersSubject = new BehaviorSubject<{
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    sortField?: keyof Shipment;
    sortDirection?: "asc" | "desc";
  }>({
    page: 0,
    pageSize: 10,
    searchTerm: "",
    statusFilter: "",
    sortField: undefined,
    sortDirection: undefined,
  });
  private initialShipments: Shipment[] = [];

  public filteredShipments$ = combineLatest([
    this.shipments$,
    this.filtersSubject,
  ]).pipe(
    map(([shipments, filters]) => {
      let data = [...shipments];

      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        data = data.filter((s) => s.recipientName.toLowerCase().includes(term));
      }

      if (filters.statusFilter) {
        data = data.filter((s) => s.status === filters.statusFilter);
      }

      if (filters.sortField) {
        data.sort((a, b) => {
          const aVal = a[filters.sortField!];
          const bVal = b[filters.sortField!];
          return (
            (aVal! < bVal! ? -1 : 1) *
            (filters.sortDirection === "asc" ? 1 : -1)
          );
        });
      }

      const total = data.length;
      const start = filters.page * filters.pageSize;
      const end = start + filters.pageSize;
      const pagedData = data.slice(start, end);

      return { data: pagedData, total };
    })
  );

  constructor(
    private http: HttpClient,
    private inMemoryShipmentService: InMemoryShipmentService
  ) {
    this.initialShipments = this.inMemoryShipmentService.createDb().shipments;
  }

  // No server side simulation with delay
  // fetchAndCacheShipments(): Observable<Shipment[]> {
  //   return this.http.get<Shipment[]>(this.API_URL).pipe(
  //     map((shipments) => {
  //       this.shipmentsSubject.next(shipments);
  //       return shipments;
  //     }),
  //     catchError((err) => {
  //       console.error("Fetch shipments failed:", err);
  //       return throwError(() => new Error("Failed to fetch shipments."));
  //     })
  //   );
  // }

  fetchShipmentsWithParams(params: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    sortField?: keyof Shipment;
    sortDirection?: "asc" | "desc";
  }): Observable<{ data: Shipment[]; total: number }> {
    const {
      page,
      pageSize,
      searchTerm,
      statusFilter,
      sortField,
      sortDirection,
    } = params;
    let query = `_page=${page + 1}&_limit=${pageSize}`;

    if (searchTerm) query += `&recipientName_like=${searchTerm}`;
    if (statusFilter) query += `&status=${statusFilter}`;
    if (sortField && sortDirection)
      query += `&_sort=${sortField}&_order=${sortDirection}`;

    return this.http
      .get<Shipment[]>(`${this.API_URL}?${query}`, { observe: "response" })
      .pipe(
        map((res) => {
          const total = Number(res.headers.get("x-total-count"));
          return { data: res.body ?? [], total };
        }),
        catchError((err) => {
          console.error("Server-side fetch failed:", err);
          return throwError(() => new Error("Failed to fetch shipments."));
        })
      );
  }

  updateFilters(filters: {
    page: number;
    pageSize: number;
    searchTerm?: string;
    statusFilter?: string;
    sortField?: keyof Shipment;
    sortDirection?: "asc" | "desc";
  }) {
    this.filtersSubject.next(filters);
  }

  addShipment(shipment: Shipment): Observable<Shipment> {
    return this.http.post<Shipment>(this.API_URL, shipment).pipe(
      map((newShipment) => {
        const current = this.shipmentsSubject.getValue();
        this.shipmentsSubject.next([...current, newShipment]);
        return newShipment;
      }),
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
          const current = this.shipmentsSubject.getValue();
          this.shipmentsSubject.next(
            current.filter((s) => !ids.includes(s.id))
          );
          observer.next(res);
          observer.complete();
        })
        .catch(() => observer.error("Failed to delete shipments"));
    });
  }

  // clearAll(): Observable<void> {
  //   return this.http.delete<void>(`${this.API_URL}/clear`).pipe(
  //     map(() => {
  //       this.shipmentsSubject.next([]);
  //     }),
  //     catchError((err) => {
  //       console.error("Clear shipments failed:", err);
  //       return throwError(() => new Error("Failed to clear shipments."));
  //     })
  //   );
  // }

  // resetShipments(): Observable<void> {
  //   return this.http.post<void>(`${this.API_URL}/reset`, {}).pipe(
  //     map(() => {
  //       this.fetchAndCacheShipments().subscribe();
  //     }),
  //     catchError((err) => {
  //       console.error("Reset shipments failed:", err);
  //       return throwError(() => new Error("Failed to reset shipments."));
  //     })
  //   );
  // }

  clearAll(): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/clear`).pipe(
      map(() => {
        this.shipmentsSubject.next([]);
      }),
      catchError((err) => {
        console.error("Clear shipments failed:", err);
        return throwError(() => new Error("Failed to clear shipments."));
      })
    );
  }

  resetShipments(): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/reset`, {}).pipe(
      map(() => {
        this.shipmentsSubject.next([...this.initialShipments]);
      }),
      catchError((err) => {
        console.error("Reset shipments failed:", err);
        return throwError(() => new Error("Failed to reset shipments."));
      })
    );
  }
}
