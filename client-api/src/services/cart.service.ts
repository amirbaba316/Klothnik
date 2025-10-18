import { Cart, IUser } from '@klothnick/shared/models';
import { NotFoundError } from '@hyperflake/http-errors';

export default class CartService {
    /**
     *  @desc   Get cart for logged-in user
     */
    async getCart(params: { user: IUser }) {
        const { user } = params;
        const cart = await Cart.findOne({ user: user._id })
            .populate({ path: 'items.product', select: 'name price images status' })
            .populate({ path: 'items.variant', select: 'sku price size color status' });
        if (!cart) return { items: [] };
        return cart.toObject();
    }

    /**
     *  @desc   Add item to cart
     */
    async addItem(params: { user: IUser; product: string; variant?: string; quantity: number }) {
        const { user, product, variant, quantity } = params;

        let cart = await Cart.findOne({ user: user._id });
        if (!cart) {
            cart = await Cart.create({
                user: user._id,
                items: [{ product, variant, quantity }],
            });
            return cart.toObject();
        }

        const existingItem = cart.items.find((item) => item.product === product && item.variant === variant);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ product, variant, quantity });
        }

        await cart.save();
        return cart.toObject();
    }

    /**
     *  @desc   Update item quantity in cart
     */
    async updateItem(params: { user: IUser; product: string; variant?: string; quantity: number }) {
        const { user, product, variant, quantity } = params;

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) throw new NotFoundError('Cart not found');

        const item = cart.items.find((i) => i.product === product && i.variant === variant);

        if (!item) throw new NotFoundError('Item not found in cart');

        item.quantity = quantity;

        await cart.save();
        return cart.toObject();
    }

    /**
     *  @desc   Remove item from cart
     */
    async removeItem(params: { user: IUser; product: string; variant?: string }) {
        const { user, product, variant } = params;

        const cart = await Cart.findOne({ user: user._id });
        if (!cart) throw new NotFoundError('Cart not found');

        cart.items = cart.items.filter((i) => !(i.product === product && i.variant === variant));

        await cart.save();
        return cart.toObject();
    }
}
