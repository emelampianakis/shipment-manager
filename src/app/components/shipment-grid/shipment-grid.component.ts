import { Component, OnInit } from "@angular/core";
import { ColDef, GridApi, GridReadyEvent } from "ag-grid-community";
import { ShipmentService } from "../../services/shipment.service";
import { Shipment } from "../../models/shipment.model";
import { MatDialog } from "@angular/material/dialog";
import { AddShipmentFormComponent } from "../add-shipment-form/add-shipment-form.component";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatOptionModule } from "@angular/material/core";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatSelectModule } from "@angular/material/select";
import { AgGridModule } from "ag-grid-angular";
import { MatIconModule } from "@angular/material/icon";
import { ErrorHandlerService } from "../../services/error-handler.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-shipment-grid",
  standalone: true,
  templateUrl: "./shipment-grid.component.html",
  styleUrls: ["./shipment-grid.component.scss"],
  imports: [
    CommonModule,
    AgGridModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
  ],
})
export class ShipmentGridComponent implements OnInit {
  columnDefs: ColDef[] = [
    {
      headerName: "",
      field: "select",
      checkboxSelection: true,
      headerCheckboxSelection: true,
      width: 40,
      suppressMovable: true,
    },
    { field: "id", headerName: "ID", sortable: true },
    { field: "recipientName", headerName: "Recipient", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: true,
      editable: true,
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["Pending", "Shipped", "Delivered"],
      },
    },
    {
      field: "creationDate",
      headerName: "Created At",
      sortable: true,
      valueFormatter: ShipmentGridComponent.formatDateTime,
    },
    {
      field: "desiredDeliveryDate",
      headerName: "Delivery Date",
      sortable: true,
      valueFormatter: ShipmentGridComponent.formatDateTime,
    },
  ];

  rowData: Shipment[] = [];
  gridApi!: GridApi;
  pageSize = 10;
  currentPage = 0;
  totalRows = 0;
  displayedCount = 0;
  searchTerm = "";
  statusFilter = "";
  loading = false;
  sortField: keyof Shipment | null = null;
  sortDirection: "asc" | "desc" | null = null;
  totalPages = 0;
  pageSizes = [5, 10, 20];
  hasSelection = false;
  private subscription = new Subscription();

  constructor(
    private shipmentService: ShipmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.updateFilters();
    // No server side simulation with delay
    // this.shipmentService.fetchAndCacheShipments().subscribe({
    //   next: () => {
    //     this.subscription.add(
    //       this.shipmentService.filteredShipments$.subscribe({
    //         next: (res) => {
    //           this.rowData = res.data;
    //           this.totalRows = res.total;
    //           this.displayedCount = res.data.length;
    //           this.totalPages = Math.ceil(this.totalRows / this.pageSize);
    //           this.loading = false;
    //         },
    //         error: (err) => {
    //           this.errorHandler.handle(err.message);
    //           this.loading = false;
    //         },
    //       })
    //     );
    //   },
    //   error: (err) => {
    //     this.errorHandler.handle(err.message);
    //     this.loading = false;
    //   },
    // });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.addEventListener("sortChanged", () => this.onSortChanged());
    this.gridApi.addEventListener(
      "cellValueChanged",
      this.onCellValueChanged.bind(this)
    );
    this.gridApi.addEventListener(
      "selectionChanged",
      this.onSelectionChanged.bind(this)
    );
  }

  onSelectionChanged() {
    this.hasSelection = this.gridApi.getSelectedRows().length > 0;
  }

  static formatDateTime(params: any): string {
    const raw = params.value;
    if (!raw) return "";
    const date = new Date(raw);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  onSortChanged() {
    const columnState = this.gridApi.getColumnState();
    const sorted = columnState.find((col) => col.sort);
    this.sortField = sorted ? (sorted.colId as keyof Shipment) : null;
    this.sortDirection = sorted ? (sorted.sort as "asc" | "desc") : null;

    this.updateFilters();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.currentPage = 0;
    this.updateFilters();
  }

  onStatusFilterChange(status: string) {
    this.statusFilter = status;
    this.currentPage = 0;
    this.updateFilters();
  }

  onPageChange(delta: number) {
    const nextPage = this.currentPage + delta;
    if (nextPage >= 0 && nextPage < this.totalPages) {
      this.currentPage = nextPage;
      this.updateFilters();
    }
  }

  onPageSizeChange(newSize: string | number) {
    this.pageSize = Number(newSize);
    this.currentPage = 0;
    this.updateFilters();
  }

  // No server side simulation with delay
  // updateFilters() {
  //   this.shipmentService.updateFilters({
  //     page: this.currentPage,
  //     pageSize: this.pageSize,
  //     searchTerm: this.searchTerm,
  //     statusFilter: this.statusFilter,
  //     sortField: this.sortField ?? undefined,
  //     sortDirection: this.sortDirection ?? undefined,
  //   });
  // }

  updateFilters() {
    this.loading = true;
    this.shipmentService
      .fetchShipmentsWithParams({
        page: this.currentPage,
        pageSize: this.pageSize,
        searchTerm: this.searchTerm,
        statusFilter: this.statusFilter,
        sortField: this.sortField ?? undefined,
        sortDirection: this.sortDirection ?? undefined,
      })
      .subscribe({
        next: (res) => {
          this.rowData = res.data;
          this.totalRows = res.total;
          this.displayedCount = res.data.length;
          this.totalPages = Math.ceil(this.totalRows / this.pageSize);
          this.loading = false;
        },
        error: (err) => {
          this.errorHandler.handle(err.message);
          this.loading = false;
        },
      });
  }

  onDeleteSelected() {
    const selected = this.gridApi.getSelectedRows();
    const ids = selected.map((s) => s.id);
    if (!ids.length) return;

    this.shipmentService.deleteShipments(ids).subscribe({
      next: () => {
        this.snackBar.open("Selected shipments deleted.", "Close", {
          duration: 3000,
        });
        this.updateFilters();
      },
      error: () => {
        this.snackBar.open("Failed to delete shipments", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  onCellValueChanged(event: any) {
    const updatedShipment: Shipment = event.data;
    this.snackBar.open(
      `Status updated to "${updatedShipment.status}"`,
      "Close",
      {
        duration: 2000,
      }
    );
  }

  onAdd() {
    const dialogRef = this.dialog.open(AddShipmentFormComponent, {
      width: "400px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.updateFilters();
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  refreshGridData() {
    this.updateFilters();
  }
}
