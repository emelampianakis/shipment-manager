export interface Shipment {
  id: number;
  recipientName: string;
  status: "Pending" | "Shipped" | "Delivered";
  creationDate: string; // ISO string
  desiredDeliveryDate: string; // ISO string
}
