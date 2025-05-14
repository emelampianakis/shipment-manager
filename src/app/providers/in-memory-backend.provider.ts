import {
  HttpClientInMemoryWebApiModule,
  InMemoryBackendConfigArgs,
} from "angular-in-memory-web-api";
import { InMemoryShipmentService } from "../services/in-memory-shipment.service";
import { EnvironmentProviders, importProvidersFrom } from "@angular/core";

export function provideInMemoryBackend(): EnvironmentProviders {
  return importProvidersFrom(
    HttpClientInMemoryWebApiModule.forRoot(InMemoryShipmentService, {
      delay: 300,
      dataEncapsulation: false,
    } as InMemoryBackendConfigArgs)
  );
}
