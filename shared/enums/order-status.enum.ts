export enum OrderStatusEnum {
    PENDING = 'PENDING', // Order placed, payment not done yet
    PAID = 'PAID', // Payment successful
    PROCESSING = 'PROCESSING', // Being packed/prepared
    SHIPPED = 'SHIPPED', // Out for delivery
    DELIVERED = 'DELIVERED', // Delivered to customer
    CANCELLED = 'CANCELLED', // Cancelled by user or admin
    RETURNED = 'RETURNED', // Returned by user
}
