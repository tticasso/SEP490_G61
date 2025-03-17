const db = require("../models");
const Order = db.order;
const OrderDetail = db.orderDetail;
const Product = db.product;
const Discount = db.discount;
const Coupon = db.coupon;  // Add Coupon model

// Lấy tất cả đơn đặt hàng
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ is_delete: false })
            .populate({
                path: 'customer_id',
                model: 'users', // Đảm bảo tên model đúng
                select: 'firstName lastName email phone' // Chọn các trường cần lấy
            })
            .populate('shipping_id')
            .populate('payment_id')
            .populate('discount_id')
            .populate('coupon_id')
            .populate('user_address_id');
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đơn đặt hàng theo ID
const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate({
                path: 'customer_id',
                model: 'users',
                select: 'firstName lastName email phone'
            })
            .populate('shipping_id')
            .populate('payment_id')
            .populate('discount_id')
            .populate('coupon_id')
            .populate('user_address_id');

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Lấy chi tiết đơn hàng
        const orderDetails = await OrderDetail.find({ order_id: order._id })
            .populate('product_id')
            .populate('discount_id');

        res.status(200).json({ order, orderDetails });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy đơn đặt hàng theo ID người dùng
const getOrdersByUserId = async (req, res) => {
    try {
        const orders = await Order.find({
            customer_id: req.params.userId,
            is_delete: false
        })
            .populate({
                path: 'customer_id',
                model: 'users',
                select: 'firstName lastName email phone'
            })
            .populate('shipping_id')
            .populate('payment_id')
            .populate('discount_id')
            .populate('coupon_id')
            .populate('user_address_id')
            .sort({ created_at: -1 });

        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Tạo đơn đặt hàng mới
const createOrder = async (req, res) => {
    try {
        const {
            customer_id,
            shipping_id,
            payment_id,
            order_payment_id,
            discount_id,
            coupon_id,  // Add coupon_id to request
            orderItems,
            user_address_id,
        } = req.body;

        // Kiểm tra xem có sản phẩm không
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        // Tính toán tổng giá trị đơn hàng
        let totalPrice = 0;
        let categoryIds = [];
        let productIds = [];

        // Kiểm tra tồn kho và tính tổng giá trị
        for (const item of orderItems) {
            const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${item.product_id} not found` });
            }

            // Kiểm tra tồn kho
            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Not enough stock for product ${product.name}. Available: ${product.stock}`
                });
            }

            totalPrice += product.price * item.quantity;
            productIds.push(product._id.toString());

            // Collect category IDs for coupon validation
            if (product.category_id) {
                if (Array.isArray(product.category_id)) {
                    categoryIds = [...categoryIds, ...product.category_id.map(cat => cat.toString())];
                } else {
                    categoryIds.push(product.category_id.toString());
                }
            }
        }

        // Remove duplicates from arrays
        categoryIds = [...new Set(categoryIds)];
        productIds = [...new Set(productIds)];

        // Variables for discount calculation
        let discountAmount = 0;
        let couponAmount = 0;
        let finalTotalPrice = totalPrice;

        // Áp dụng mã giảm giá nếu có
        if (discount_id) {
            const discount = await Discount.findById(discount_id);
            if (discount) {
                // Kiểm tra điều kiện áp dụng mã giảm giá
                const now = new Date();
                if (discount.is_active &&
                    !discount.is_delete &&
                    new Date(discount.start_date) <= now &&
                    new Date(discount.end_date) >= now &&
                    totalPrice >= discount.min_order_value) {

                    // Tính số tiền giảm giá
                    if (discount.type_price === 'fixed') {
                        discountAmount = discount.value;
                    } else {
                        discountAmount = (totalPrice * discount.value) / 100;
                    }

                    // Giới hạn số lần sử dụng
                    if (discount.max_uses > 0) {
                        const usageHistory = discount.history || {};
                        const totalUsed = Object.values(usageHistory).reduce((sum, current) => sum + current, 0);

                        if (totalUsed >= discount.max_uses) {
                            return res.status(400).json({ message: "Discount code has reached maximum uses" });
                        }
                    }

                    // Kiểm tra số lần sử dụng của người dùng
                    if (discount.max_uses_per_user > 0) {
                        const usageHistory = discount.history || {};
                        const userUsage = usageHistory[customer_id] || 0;

                        if (userUsage >= discount.max_uses_per_user) {
                            return res.status(400).json({
                                message: "You have reached maximum uses for this discount code"
                            });
                        }
                    }

                    // Cập nhật lịch sử sử dụng
                    const usageHistory = discount.history || {};
                    usageHistory[customer_id] = (usageHistory[customer_id] || 0) + 1;
                    discount.history = usageHistory;
                    await discount.save();
                }
            }
        }

        // Áp dụng mã coupon nếu có
        if (coupon_id) {
            const coupon = await Coupon.findById(coupon_id);
            if (coupon) {
                // Kiểm tra điều kiện áp dụng coupon
                const now = new Date();
                if (coupon.is_active &&
                    !coupon.is_delete &&
                    new Date(coupon.start_date) <= now &&
                    new Date(coupon.end_date) >= now &&
                    totalPrice >= coupon.min_order_value) {

                    // Kiểm tra áp dụng cho sản phẩm cụ thể
                    if (coupon.product_id && !productIds.includes(coupon.product_id.toString())) {
                        return res.status(400).json({
                            message: "This coupon only applies to specific products"
                        });
                    }

                    // Kiểm tra áp dụng cho danh mục cụ thể
                    if (coupon.category_id && !categoryIds.includes(coupon.category_id.toString())) {
                        return res.status(400).json({
                            message: "This coupon only applies to specific categories"
                        });
                    }

                    // Tính số tiền giảm giá từ coupon
                    if (coupon.type === 'fixed') {
                        couponAmount = coupon.value;
                    } else {
                        // Percentage discount
                        couponAmount = (totalPrice * coupon.value) / 100;
                        // Apply max discount if specified
                        if (coupon.max_discount_value && couponAmount > coupon.max_discount_value) {
                            couponAmount = coupon.max_discount_value;
                        }
                    }

                    // Kiểm tra giới hạn số lần sử dụng
                    if (coupon.max_uses > 0) {
                        const totalUsed = Array.from(coupon.history.values()).reduce((sum, count) => sum + count, 0);
                        if (totalUsed >= coupon.max_uses) {
                            return res.status(400).json({
                                message: "This coupon has reached its maximum usage limit"
                            });
                        }
                    }

                    // Kiểm tra giới hạn sử dụng của người dùng
                    if (coupon.max_uses_per_user > 0) {
                        const userUsage = coupon.history.get(customer_id.toString()) || 0;
                        if (userUsage >= coupon.max_uses_per_user) {
                            return res.status(400).json({
                                message: "You have reached the maximum usage limit for this coupon"
                            });
                        }
                    }

                    // Cập nhật lịch sử sử dụng coupon
                    const usageHistory = coupon.history || new Map();
                    usageHistory.set(customer_id.toString(), (usageHistory.get(customer_id.toString()) || 0) + 1);
                    coupon.history = usageHistory;
                    await coupon.save();
                }
            }
        }

        // Tính tổng giá cuối cùng sau khi áp dụng cả discount và coupon
        finalTotalPrice = totalPrice - discountAmount - couponAmount;

        // Đảm bảo giá không âm
        if (finalTotalPrice < 0) finalTotalPrice = 0;

        // Tạo đơn hàng mới
        const newOrder = new Order({
            customer_id,
            shipping_id,
            payment_id,
            order_payment_id,
            total_price: finalTotalPrice,
            discount_id,
            coupon_id,  // Add coupon_id to order
            coupon_amount: couponAmount,  // Add coupon amount to track separately
            discount_amount: discountAmount,  // Add discount amount to track separately
            user_address_id,
            original_price: totalPrice  // Add original price before discounts
        });

        const savedOrder = await newOrder.save();

        // Tạo chi tiết đơn hàng và cập nhật tồn kho
        const orderDetailItems = [];
        for (const item of orderItems) {
            const product = await Product.findById(item.product_id);

            // Tạo chi tiết đơn hàng
            const orderDetail = new OrderDetail({
                id: `OD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                order_id: savedOrder._id,
                product_id: item.product_id,
                quantity: item.quantity,
                discount_id: item.discount_id,
                cart_id: item.cart_id,
                price: product.price
            });

            const savedOrderDetail = await orderDetail.save();
            orderDetailItems.push(savedOrderDetail);

            // Cập nhật tồn kho
            product.stock -= item.quantity;
            await product.save();
        }

        res.status(201).json({
            message: "Order created successfully",
            order: savedOrder,
            orderDetails: orderDetailItems
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật trạng thái đơn hàng
const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status_id } = req.body;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        order.status_id = status_id;

        // Nếu đơn hàng đã giao, cập nhật thời gian giao hàng
        if (status_id === 'delivered') {
            order.order_delivered_at = new Date();
        }

        await order.save();

        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hủy đơn hàng
const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Chỉ hủy đơn hàng khi đang ở trạng thái chờ xử lý hoặc đang xử lý
        if (order.status_id !== 'pending' && order.status_id !== 'processing') {
            return res.status(400).json({
                message: "Cannot cancel order that has been shipped or delivered"
            });
        }

        // Cập nhật trạng thái đơn hàng
        order.status_id = 'cancelled';
        await order.save();

        // Hoàn trả tồn kho
        const orderDetails = await OrderDetail.find({ order_id: order._id });
        for (const detail of orderDetails) {
            const product = await Product.findById(detail.product_id);
            if (product) {
                product.stock += detail.quantity;
                await product.save();
            }
        }

        // Nếu có sử dụng mã giảm giá, hoàn trả lượt sử dụng
        if (order.discount_id) {
            const discount = await Discount.findById(order.discount_id);
            if (discount) {
                const usageHistory = discount.history || {};
                if (usageHistory[order.customer_id]) {
                    usageHistory[order.customer_id] -= 1;
                    if (usageHistory[order.customer_id] <= 0) {
                        delete usageHistory[order.customer_id];
                    }
                    discount.history = usageHistory;
                    await discount.save();
                }
            }
        }

        // Nếu có sử dụng coupon, hoàn trả lượt sử dụng
        if (order.coupon_id) {
            const coupon = await Coupon.findById(order.coupon_id);
            if (coupon) {
                const usageHistory = coupon.history || new Map();
                if (usageHistory.has(order.customer_id.toString())) {
                    const currentCount = usageHistory.get(order.customer_id.toString());
                    if (currentCount <= 1) {
                        usageHistory.delete(order.customer_id.toString());
                    } else {
                        usageHistory.set(order.customer_id.toString(), currentCount - 1);
                    }
                    coupon.history = usageHistory;
                    await coupon.save();
                }
            }
        }

        res.status(200).json({
            message: "Order cancelled successfully",
            order
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Xóa đơn hàng (xóa mềm)
const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Xóa mềm
        order.is_delete = true;
        await order.save();

        res.status(200).json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Lấy thống kê đơn hàng
const getOrderStatistics = async (req, res) => {
    try {
        // Tổng số đơn hàng
        const totalOrders = await Order.countDocuments({ is_delete: false });

        // Số đơn hàng theo trạng thái
        const pendingOrders = await Order.countDocuments({ status_id: 'pending', is_delete: false });
        const processingOrders = await Order.countDocuments({ status_id: 'processing', is_delete: false });
        const shippedOrders = await Order.countDocuments({ status_id: 'shipped', is_delete: false });
        const deliveredOrders = await Order.countDocuments({ status_id: 'delivered', is_delete: false });
        const cancelledOrders = await Order.countDocuments({ status_id: 'cancelled', is_delete: false });

        // Tổng doanh thu
        const revenue = await Order.aggregate([
            { $match: { status_id: 'delivered', is_delete: false } },
            { $group: { _id: null, total: { $sum: "$total_price" } } }
        ]);

        // Tổng tiền giảm giá
        const discountTotal = await Order.aggregate([
            { $match: { status_id: 'delivered', is_delete: false } },
            {
                $group: {
                    _id: null,
                    discountAmount: { $sum: "$discount_amount" },
                    couponAmount: { $sum: "$coupon_amount" }
                }
            }
        ]);

        // Tổng số đơn hàng sử dụng mã giảm giá
        const ordersWithDiscount = await Order.countDocuments({
            discount_id: { $exists: true, $ne: null },
            is_delete: false
        });

        // Tổng số đơn hàng sử dụng coupon
        const ordersWithCoupon = await Order.countDocuments({
            coupon_id: { $exists: true, $ne: null },
            is_delete: false
        });

        const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
        const totalDiscountAmount = discountTotal.length > 0 ? discountTotal[0].discountAmount || 0 : 0;
        const totalCouponAmount = discountTotal.length > 0 ? discountTotal[0].couponAmount || 0 : 0;

        res.status(200).json({
            totalOrders,
            ordersByStatus: {
                pending: pendingOrders,
                processing: processingOrders,
                shipped: shippedOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders
            },
            totalRevenue,
            totalDiscountAmount,
            totalCouponAmount,
            ordersWithDiscount,
            ordersWithCoupon
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Lấy đơn đặt hàng theo ID shop
const getOrdersByShopId = async (req, res) => {
    try {
        const { shopId } = req.params;

        // Tìm tất cả các đơn hàng có chứa sản phẩm thuộc shop này
        const orderDetails = await OrderDetail.find()
            .populate({
                path: 'product_id',
                match: { shop_id: shopId },
                select: 'name price shop_id'
            });

        // Lọc ra các orderDetail có product_id không null (tức là thuộc shop)
        const validOrderDetails = orderDetails.filter(detail => detail.product_id !== null);

        // Lấy ra các order_id duy nhất
        const orderIds = [...new Set(validOrderDetails.map(detail => detail.order_id))];

        // Lấy thông tin đầy đủ của các đơn hàng
        const orders = await Order.find({
            _id: { $in: orderIds },
            is_delete: false
        })
            .populate({
                path: 'customer_id',
                model: 'users',
                select: 'firstName lastName email phone'
            })
            .populate('shipping_id')
            .populate('payment_id')
            .populate('discount_id')
            .populate('coupon_id')
            .populate('user_address_id')
            .sort({ created_at: -1 });

        // Nhóm các orderDetail theo order_id để gửi kèm chi tiết
        const orderDetailsMap = {};
        validOrderDetails.forEach(detail => {
            if (!orderDetailsMap[detail.order_id]) {
                orderDetailsMap[detail.order_id] = [];
            }
            orderDetailsMap[detail.order_id].push(detail);
        });

        // Kết hợp order và orderDetail
        const result = orders.map(order => {
            return {
                order,
                orderDetails: orderDetailsMap[order._id] || []
            };
        });

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const orderController = {
    getAllOrders,
    getOrderById,
    getOrdersByUserId,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
    getOrderStatistics,
    getOrdersByShopId
};

module.exports = orderController;