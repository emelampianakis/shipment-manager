import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({ providedIn: "root" })
export class ErrorHandlerService {
  constructor(private snackBar: MatSnackBar) {}

  handle(message: string = "Something went wrong") {
    this.snackBar.open(`❌ ${message}`, "Close", {
      duration: 4000,
      panelClass: ["error-snackbar"],
    });
  }
}
