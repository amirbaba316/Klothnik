export enum InventoryAdjustmentTypeEnum {
    PURCHASE = 'purchase', // Stock added via supplier purchase
    RETURN = 'return', // Customer returned item
    RESTOCK = 'restock', // Manual restock
    SALE = 'sale', // Item sold (deducts stock)
    DAMAGED = 'damaged', // Item marked as damaged
    LOST = 'lost', // Item lost in inventory
    ADJUSTMENT = 'adjustment', // Manual correction
}
