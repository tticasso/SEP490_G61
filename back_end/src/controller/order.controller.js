const db = require("../models");
const Order = db.order;
const OrderDetail = db.orderDetail;
const Product = db.product;
const Discount = db.discount;

// Lấy tất cả đơn đặt hàng
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({ is_delete: false })
            .populate('customer_id', 'name email')
            .populate('shipping_id')
            .populate('payment_id')
            .populate('discount_id')
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
            .populate('customer_id', 'name email')
            .populate('shipping_id')
            .populate('payment_id')
            .populate('discount_id')
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
        .populate('customer_id', 'name email')
        .populate('shipping_id')
        .populate('payment_id')
        .populate('discount_id')
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
            orderItems,
            user_address_id,
        } = req.body;

        // Kiểm tra xem có sản phẩm không
        if (!orderItems || orderItems.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        // Tính toán tổng giá trị đơn hàng
        let totalPrice = 0;
        
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
        }

        // Áp dụng mã giảm giá nếu có
        let discountAmount = 0;
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
        
        // Tính tổng giá cuối cùng
        const finalTotalPrice = totalPrice - discountAmount;

        // Tạo đơn hàng mới
        const newOrder = new Order({
            customer_id,
            shipping_id,
            payment_id,
            order_payment_id,
            total_price: finalTotalPrice,
            discount_id
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
        
        const totalRevenue = revenue.length > 0 ? revenue[0].total : 0;
        
        res.status(200).json({
            totalOrders,
            ordersByStatus: {
                pending: pendingOrders,
                processing: processingOrders,
                shipped: shippedOrders,
                delivered: deliveredOrders,
                cancelled: cancelledOrders
            },
            totalRevenue
        });
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
    getOrderStatistics
};

module.exports = orderController;