import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideAnimations } from "@angular/platform-browser/animations";
import { MatNativeDateModule, MAT_DATE_LOCALE } from "@angular/material/core";
import { MAT_DATE_FORMATS } from "@angular/material/core";
import { importProvidersFrom } from "@angular/core";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";

ModuleRegistry.registerModules([AllCommunityModule]);
export const MY_DATE_FORMATS = {
  parse: {
    dateInput: "l",
  },
  display: {
    dateInput: "YYYY-MM-DD",
    monthYearLabel: "MMM YYYY",
    dateA11yLabel: "LL",
    monthYearA11yLabel: "MMMM YYYY",
  },
};

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    importProvidersFrom(MatNativeDateModule),
    { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
}).catch((err) => console.error(err));
