import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentGridComponent } from './shipment-grid.component';

describe('ShipmentGridComponent', () => {
  let component: ShipmentGridComponent;
  let fixture: ComponentFixture<ShipmentGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ShipmentGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ShipmentGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
