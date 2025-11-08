export enum OrderStatusEnum {
    PENDING = 'PENDING', // Order placed, payment not done yet
    PAID = 'PAID', // Payment successful
    PROCESSING = 'PROCESSING', // Being packed/prepared
    SHIPPED = 'SHIPPED', // Out for delivery
    DELIVERED = 'DELIVERED', // Delivered to customer
    OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', // Delivered to customer
    PLACED = 'PLACED', // Returned by user
    CONFIRMED = 'CONFIRMED', // Returned by user
    CANCELLED = 'CANCELLED', // Cancelled by user or admin
    RETURNED = 'RETURNED', // Returned by user
}
