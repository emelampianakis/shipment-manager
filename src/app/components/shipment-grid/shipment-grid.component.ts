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
      suppressMovable: true, // ✅ still valid
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
      valueFormatter: this.formatDateTime,
    },
    {
      field: "desiredDeliveryDate",
      headerName: "Delivery Date",
      sortable: true,
      valueFormatter: this.formatDateTime,
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
  error = "";
  sortField: keyof Shipment | null = null;
  sortDirection: "asc" | "desc" | null = null;
  totalPages = 0;
  pageSizes = [5, 10, 20];

  constructor(
    private shipmentService: ShipmentService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private errorHandler: ErrorHandlerService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.addEventListener("sortChanged", () => this.onSortChanged());
    this.gridApi.addEventListener(
      "cellValueChanged",
      this.onCellValueChanged.bind(this)
    );
  }

  formatDateTime(params: any): string {
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
    const sortedColumns = columnState.filter((col) => col.sort != null);
    if (sortedColumns.length > 0) {
      this.sortField = sortedColumns[0].colId as keyof Shipment;
      this.sortDirection = sortedColumns[0].sort as "asc" | "desc";
    } else {
      this.sortField = null;
      this.sortDirection = null;
    }
    this.loadData();
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

  loadData(): void {
    this.loading = true;
    this.error = "";
    this.shipmentService
      .fetchShipments({
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

  onSearch(term: string) {
    this.searchTerm = term;
    this.currentPage = 0;
    this.loadData();
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.onSearch(input.value);
  }

  onStatusFilterChange(status: string) {
    this.statusFilter = status;
    this.currentPage = 0;
    this.loadData();
  }

  onPageChange(delta: number) {
    const nextPage = this.currentPage + delta;
    const maxPage = Math.floor(this.totalRows / this.pageSize);
    if (nextPage >= 0 && nextPage <= maxPage) {
      this.currentPage = nextPage;
      this.loadData();
    }
  }

  onPageSizeChange(newSize: string | number) {
    this.pageSize = Number(newSize);
    this.currentPage = 0;
    this.loadData();
  }

  onDeleteSelected() {
    if (!this.gridApi) return;

    const selected = this.gridApi.getSelectedRows();
    const ids = selected.map((s) => s.id);
    if (!ids.length) return;

    this.shipmentService.deleteShipments(ids).subscribe({
      next: () => {
        this.snackBar.open("Selected shipments deleted.", "Close", {
          duration: 3000,
        });
        this.loadData();
      },
      error: () => {
        this.snackBar.open("Failed to delete shipments", "Close", {
          duration: 3000,
        });
      },
    });
  }

  onAdd() {
    const dialogRef = this.dialog.open(AddShipmentFormComponent, {
      width: "400px",
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadData();
    });
  }
}
