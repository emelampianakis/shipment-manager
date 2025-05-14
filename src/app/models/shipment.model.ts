export interface Shipment {
  id: number;
  recipientName: string;
  status: "Pending" | "Shipped" | "Delivered";
  creationDate: Date;
  desiredDeliveryDate: Date;
}
