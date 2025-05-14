import { bootstrapApplication } from "@angular/platform-browser";
import { AppComponent } from "./app/app.component";
import { provideAnimations } from "@angular/platform-browser/animations";
import {
  MAT_DATE_LOCALE,
  MAT_DATE_FORMATS,
  MatNativeDateModule,
} from "@angular/material/core";
import { importProvidersFrom } from "@angular/core";
import { ModuleRegistry } from "ag-grid-community";
import { AllCommunityModule } from "ag-grid-community";
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { HttpClientInMemoryWebApiModule } from "angular-in-memory-web-api";
import { InMemoryShipmentService } from "../src/app/services/in-memory-shipment.service";

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
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimations(),
    importProvidersFrom(MatNativeDateModule),
    importProvidersFrom(
      HttpClientInMemoryWebApiModule.forRoot(InMemoryShipmentService, {
        delay: 300,
        dataEncapsulation: false,
      })
    ),
    { provide: MAT_DATE_LOCALE, useValue: "en-GB" },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
}).catch((err) => console.error(err));
