import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { MatDialogModule, MatDialogRef } from "@angular/material/dialog";
import { ShipmentService } from "../../services/shipment.service";
import { Shipment } from "../../models/shipment.model";
import { MatSnackBar } from "@angular/material/snack-bar";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { MatNativeDateModule, MatOptionModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatSelectModule } from "@angular/material/select";

@Component({
  selector: "app-add-shipment-form",
  templateUrl: "./add-shipment-form.component.html",
  styleUrls: ["./add-shipment-form.component.scss"],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatDialogModule,
  ],
})
export class AddShipmentFormComponent {
  shipmentForm: FormGroup;
  isSubmitting = false;
  today = new Date();

  constructor(
    private fb: FormBuilder,
    private shipmentService: ShipmentService,
    private dialogRef: MatDialogRef<AddShipmentFormComponent>,
    private snackBar: MatSnackBar
  ) {
    this.shipmentForm = this.fb.group({
      recipientName: ["", [Validators.required]],
      desiredDeliveryDate: [
        "",
        [Validators.required, this.futureDateValidator],
      ],
      status: ["Pending", Validators.required],
    });
  }

  futureDateValidator(control: any) {
    const inputDate = new Date(control.value);
    const now = new Date();
    if (inputDate <= now) {
      return { notFutureDate: true };
    }
    return null;
  }

  onSubmit() {
    if (this.shipmentForm.invalid) return;
    this.isSubmitting = true;

    const newShipment: Omit<Shipment, "id"> = {
      recipientName: this.shipmentForm.value.recipientName,
      status: this.shipmentForm.value.status,
      creationDate: new Date().toISOString(),
      desiredDeliveryDate: new Date(
        this.shipmentForm.value.desiredDeliveryDate
      ).toISOString(),
    };

    this.shipmentService.addShipment(newShipment as Shipment).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.snackBar.open("Shipment added successfully!", "Close", {
          duration: 3000,
        });
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSubmitting = false;
        this.snackBar.open("Failed to add shipment", "Close", {
          duration: 3000,
        });
      },
    });
  }

  onCancel() {
    this.dialogRef.close(false);
  }
}
