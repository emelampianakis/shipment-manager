import { Component, ViewChild } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { ShipmentGridComponent } from "./components/shipment-grid/shipment-grid.component";
import { CommonModule } from "@angular/common";
import { ShipmentService } from "./services/shipment.service";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatIconModule } from "@angular/material/icon";
import { MatButtonModule } from "@angular/material/button";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    ShipmentGridComponent,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  @ViewChild(ShipmentGridComponent) shipmentGrid!: ShipmentGridComponent;

  constructor(
    private shipmentService: ShipmentService,
    private snackBar: MatSnackBar
  ) {}

  deleteAll() {
    this.shipmentService.clearAll().subscribe({
      next: () => {
        this.shipmentGrid.loadData();
        this.snackBar.open("All shipments deleted.", "Close", {
          duration: 3000,
        });
      },
      error: () => {
        this.snackBar.open("Failed to delete shipments.", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  resetData() {
    this.shipmentService.resetShipments().subscribe({
      next: () => {
        this.shipmentGrid.loadData();
        this.snackBar.open("Shipments reset to initial state.", "Close", {
          duration: 3000,
        });
      },
      error: () => {
        this.snackBar.open("Failed to reset shipments.", "Close", {
          duration: 3000,
          panelClass: ["error-snackbar"],
        });
      },
    });
  }

  simulateError() {
    this.snackBar.open("❌ Simulated error occurred!", "Close", {
      duration: 4000,
      panelClass: ["error-snackbar"],
    });
  }
}
