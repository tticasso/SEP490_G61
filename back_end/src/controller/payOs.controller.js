const httpErrors = require('http-errors');
const Order = require('../models/order.model');
const OrderDetail = require('../models/order-detail.model');
const PayOS = require('@payos/node');
require('dotenv').config();

// Khởi tạo instance của PayOS
const payOS = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUM_KEY
);

class PayOsController {
    // Khởi tạo thanh toán và tạo payment link
    async createPayment(req, res, next) {
        try {
            const { orderId } = req.body;

            // Tìm thông tin đơn hàng từ database
            const order = await Order.findById(orderId)
                .populate('customer_id', 'name email phone');

            if (!order) {
                throw httpErrors.NotFound('Không tìm thấy đơn hàng');
            }

            // Tìm chi tiết đơn hàng từ bảng OrderDetail
            const orderDetails = await OrderDetail.find({ order_id: orderId })
                .populate('product_id', 'name price');

            if (!orderDetails || orderDetails.length === 0) {
                throw httpErrors.NotFound('Không tìm thấy chi tiết đơn hàng');
            }

            // Tạo mã giao dịch duy nhất
            function generateTransactionCodeFromOrderId(orderId) {
                // Lấy timestamp hiện tại (số giây)
                const timestamp = Math.floor(Date.now() / 1000);
                
                // Lấy 6 ký tự cuối của orderId
                const lastSixChars = orderId.toString().slice(-6);
                
                // Chuyển đổi các ký tự thành mã ASCII và lấy phần dư khi chia cho 10
                // để đảm bảo chỉ có các chữ số
                let numericCode = '';
                for (let i = 0; i < lastSixChars.length; i++) {
                  numericCode += lastSixChars.charCodeAt(i) % 10;
                }
                
                // Lấy 6 chữ số đầu tiên
                numericCode = numericCode.slice(0, 6);
                
                // Tạo mã giao dịch bằng cách kết hợp timestamp với mã số từ orderId
                // Nhưng đảm bảo kết quả không vượt quá MAX_SAFE_INTEGER
                const maxSafePrefix = Math.floor(Number.MAX_SAFE_INTEGER / 1000000);
                const prefix = timestamp % maxSafePrefix;
                
                // Kết hợp prefix với numericCode để tạo thành transaction code
                const transactionCode = parseInt(prefix.toString() + numericCode);
                
                return transactionCode;
              }
            const transactionCode = generateTransactionCodeFromOrderId(orderId);
            console.log('Generated transaction code:', transactionCode);

            // Chuyển đổi dữ liệu chi tiết đơn hàng thành format yêu cầu của PayOS
            const items = orderDetails.map(detail => {
                const productName = detail.product_id && detail.product_id.name 
                    ? detail.product_id.name.substring(0, 25) // Giới hạn tên sản phẩm
                    : 'San pham';
                    
                return {
                    name: productName,
                    quantity: detail.quantity || 1,
                    price: detail.price || 0
                };
            });

            // Tạo dữ liệu thanh toán theo định dạng của PayOS
            const lastSevenDigits = transactionCode.toString().slice(-7);
            const paymentData = {
                orderCode: transactionCode,
                amount: order.total_price,
                description: `PAYOS${lastSevenDigits}`, // Mô tả ngắn gọn không quá 25 ký tự
                returnUrl: `${process.env.FRONTEND_URL}/payment/success?orderCode=${transactionCode}`,
                cancelUrl: `${process.env.FRONTEND_URL}/payment/cancel?orderCode=${transactionCode}`,
                items: items
            };

            // Nếu có thông tin khách hàng, thêm vào paymentData
            if (order.customer_id && order.customer_id.name) {
                paymentData.buyerInfo = {
                    name: order.customer_id.name,
                    email: order.customer_id.email || '',
                    phone: order.customer_id.phone || ''
                };
            }

            // Gọi API PayOS để tạo payment link
            const paymentLinkResponse = await payOS.createPaymentLink(paymentData);

            // Cập nhật đơn hàng với thông tin thanh toán
            order.order_payment_id = transactionCode.toString(); // Lưu transactionCode vào order_payment_id
            order.payment_method = 'payos';
            order.status_id = 'pending';
            await order.save();

            // Chuyển hướng người dùng đến trang thanh toán của PayOS
            return res.status(200).json({
                success: true,
                message: 'Tạo link thanh toán thành công',
                data: {
                    paymentUrl: paymentLinkResponse.checkoutUrl,
                    transactionCode: transactionCode,
                    qrCode: paymentLinkResponse.qrCode // Trả về mã QR code nếu có
                }
            });
        } catch (error) {
            console.error('PayOs payment error:', error);
            next(error.isJoi ? httpErrors.BadRequest(error.message) : error);
        }
    }

    // Xử lý webhook từ PayOs
    async handleWebhook(req, res, next) {
        try {
            // Xác thực webhook từ PayOS
            const webhookIsValid = await payOS.validateWebhookSignature(
                req.headers['x-signature'],
                req.body
            );

            if (!webhookIsValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid webhook signature'
                });
            }

            // Xử lý dữ liệu webhook
            const { orderCode, status, amount } = req.body;
            const transactionCode = orderCode;

            // Tìm đơn hàng theo transaction code (được lưu trong order_payment_id)
            const order = await Order.findOne({ order_payment_id: transactionCode.toString() });

            if (!order) {
                throw httpErrors.NotFound('Không tìm thấy đơn hàng');
            }

            // Nếu thanh toán thành công, cập nhật thêm thông tin
            if (status === 'PAID') {
                order.status_id = 'processing'; // Chuyển đơn hàng sang trạng thái đang xử lý
                order.updated_at = new Date();
            } else if (status === 'CANCELLED' || status === 'FAILED') {
                order.status_id = 'cancelled';
                order.updated_at = new Date();
            }

            await order.save();

            res.status(200).json({ success: true });
        } catch (error) {
            console.error('PayOs webhook error:', error);
            next(error);
        }
    }

    // Kiểm tra trạng thái thanh toán
    async checkPaymentStatus(req, res, next) {
        try {
            const { transactionCode } = req.params;
            console.log('Checking payment status for transaction:', transactionCode);

            // Tìm đơn hàng theo transaction_code (được lưu trong order_payment_id)
            const order = await Order.findOne({ order_payment_id: transactionCode.toString() });

            if (!order) {
                console.log('Order not found for transaction code:', transactionCode);
                throw httpErrors.NotFound('Không tìm thấy đơn hàng với mã giao dịch này');
            }

            console.log('Found order:', order._id);

            let paymentStatus;
            try {
                // Gọi API PayOS để kiểm tra trạng thái thanh toán
                paymentStatus = await payOS.getPaymentLinkInfoByOrderCode(parseInt(transactionCode));
                console.log('PayOS payment status:', paymentStatus);
            } catch (payosError) {
                console.error('Error getting payment status from PayOS:', payosError);
                
                // Nếu không lấy được từ PayOS, sử dụng thông tin từ cơ sở dữ liệu
                paymentStatus = {
                    status: order.status_id === 'processing' ? 'PAID' : 
                            order.status_id === 'cancelled' ? 'CANCELLED' : 'PENDING'
                };
                console.log('Using local payment status:', paymentStatus);
            }

            // Cập nhật trạng thái đơn hàng dựa vào kết quả từ PayOs
            if (paymentStatus.status === 'PAID' && order.status_id !== 'processing') {
                order.status_id = 'processing';
                order.updated_at = new Date();
                await order.save();
            } else if ((paymentStatus.status === 'CANCELLED' || paymentStatus.status === 'FAILED') 
                       && order.status_id !== 'cancelled') {
                order.status_id = 'cancelled';
                order.updated_at = new Date();
                await order.save();
            }

            // Lấy số lượng items từ chi tiết đơn hàng
            const orderDetails = await OrderDetail.find({ order_id: order._id });
            const itemCount = orderDetails ? orderDetails.length : 0;

            res.status(200).json({
                success: true,
                data: {
                    order: {
                        id: order._id,
                        status: order.status_id,
                        total: order.total_price || 0,
                        items: itemCount
                    },
                    payment: {
                        status: paymentStatus.status,
                        transactionCode: transactionCode,
                        updated_at: order.updated_at
                    }
                }
            });
        } catch (error) {
            console.error('Check payment status error:', error);
            next(error);
        }
    }
}

module.exports = new PayOsController();