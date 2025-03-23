const db = require("../models");
const Cart = db.cart;
const CartItem = db.cartItem;
const Product = db.product;
const ProductVariant = db.productVariant;

// Tạo giỏ hàng mới
const createCart = async (req, res) => {
    try {
        const { user_id } = req.body;

        // Kiểm tra xem người dùng đã có giỏ hàng chưa
        const existingCart = await Cart.findOne({ user_id });
        if (existingCart) {
            return res.status(400).json({ message: "User already has a cart" });
        }

        const newCart = new Cart({
            user_id,
            created_at: Date.now(),
            updated_at: Date.now()
        });

        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy giỏ hàng của người dùng kèm theo các sản phẩm
const getCartByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cart = await Cart.findOne({ user_id: userId });

        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Lấy các sản phẩm trong giỏ hàng và populate cả product_id và variant_id
        const cartItems = await CartItem.find({ cart_id: cart._id })
            .populate("product_id")
            .populate("variant_id")
            .populate("discount_id");

        const cartWithItems = {
            ...cart._doc,
            items: cartItems
        };

        res.status(200).json(cartWithItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Thêm sản phẩm vào giỏ hàng
const addItemToCart = async (req, res) => {
    try {
        const { cart_id, product_id, quantity, variant_id, discount_id } = req.body;

        // Kiểm tra giỏ hàng có tồn tại không
        const cartExists = await Cart.findById(cart_id);
        if (!cartExists) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Kiểm tra sản phẩm có tồn tại không
        const productExists = await Product.findById(product_id);
        if (!productExists) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Kiểm tra variant nếu có
        if (variant_id) {
            const variantExists = await ProductVariant.findById(variant_id);
            if (!variantExists) {
                return res.status(404).json({ message: "Variant not found" });
            }
            
            // Kiểm tra xem variant có thuộc về sản phẩm này không
            if (variantExists.product_id.toString() !== product_id) {
                return res.status(400).json({ message: "This variant does not belong to the specified product" });
            }
            
            // Kiểm tra số lượng tồn kho của variant
            if (variantExists.stock < quantity) {
                return res.status(400).json({ 
                    message: "Not enough stock available", 
                    available: variantExists.stock 
                });
            }
        }

        // Kiểm tra sản phẩm đã có trong giỏ hàng chưa - với variant nếu có
        let existingItem;
        
        if (variant_id) {
            existingItem = await CartItem.findOne({ 
                cart_id, 
                product_id,
                variant_id 
            });
        } else {
            existingItem = await CartItem.findOne({ 
                cart_id, 
                product_id,
                variant_id: { $exists: false } 
            });
        }

        if (existingItem) {
            // Cập nhật số lượng nếu sản phẩm đã có trong giỏ hàng
            existingItem.quantity += quantity;
            await existingItem.save();

            // Cập nhật thời gian cập nhật giỏ hàng
            await Cart.findByIdAndUpdate(cart_id, { updated_at: Date.now() });

            return res.status(200).json(existingItem);
        } else {
            // Thêm sản phẩm mới vào giỏ hàng
            const newCartItem = new CartItem({
                cart_id,
                product_id,
                quantity,
                discount_id
            });
            
            // Thêm variant_id nếu có
            if (variant_id) {
                newCartItem.variant_id = variant_id;
            }

            await newCartItem.save();

            // Cập nhật thời gian cập nhật giỏ hàng
            await Cart.findByIdAndUpdate(cart_id, { updated_at: Date.now() });

            return res.status(201).json(newCartItem);
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật số lượng sản phẩm trong giỏ hàng
const updateCartItem = async (req, res) => {
    try {
        const { cart_item_id, quantity } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ message: "Quantity must be at least 1" });
        }

        const cartItem = await CartItem.findById(cart_item_id);
        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }
        
        // Nếu có variant_id, kiểm tra số lượng tồn kho
        if (cartItem.variant_id) {
            const variant = await ProductVariant.findById(cartItem.variant_id);
            if (variant && variant.stock < quantity) {
                return res.status(400).json({ 
                    message: "Not enough stock available", 
                    available: variant.stock 
                });
            }
        }

        cartItem.quantity = quantity;
        await cartItem.save();

        // Cập nhật thời gian cập nhật giỏ hàng
        await Cart.findByIdAndUpdate(cartItem.cart_id, { updated_at: Date.now() });

        res.status(200).json(cartItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa sản phẩm khỏi giỏ hàng
const removeCartItem = async (req, res) => {
    try {
        const cartItemId = req.params.id;
        const cartItem = await CartItem.findById(cartItemId);

        if (!cartItem) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        // Cập nhật thời gian cập nhật giỏ hàng
        await Cart.findByIdAndUpdate(cartItem.cart_id, { updated_at: Date.now() });

        // Xóa sản phẩm khỏi giỏ hàng
        await CartItem.findByIdAndDelete(cartItemId);

        res.status(200).json({ message: "Item removed from cart successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa tất cả sản phẩm khỏi giỏ hàng
const clearCart = async (req, res) => {
    try {
        const cartId = req.params.id;

        // Kiểm tra giỏ hàng có tồn tại không
        const cartExists = await Cart.findById(cartId);
        if (!cartExists) {
            return res.status(404).json({ message: "Cart not found" });
        }

        // Xóa tất cả sản phẩm khỏi giỏ hàng
        await CartItem.deleteMany({ cart_id: cartId });

        // Cập nhật thời gian cập nhật giỏ hàng
        await Cart.findByIdAndUpdate(cartId, { updated_at: Date.now() });

        res.status(200).json({ message: "Cart cleared successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const cartController = {
    createCart,
    getCartByUserId,
    addItemToCart,
    updateCartItem,
    removeCartItem,
    clearCart
};

module.exports = cartController;