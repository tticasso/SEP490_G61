// src/controller/shop-revenue.controller.js
const db = require('../models');
const ShopRevenue = db.shopRevenue;
const PaymentBatch = db.paymentBatch;
const Order = db.order;
const Shop = db.shop;
const mongoose = require('mongoose');
const moment = require('moment');
const createHttpError = require('http-errors');



// Get system revenue overview statistics
const getSystemRevenueOverview = async (req, res) => {
    try {
        const { period = 'all' } = req.query;
        
        // Build date filter
        let dateFilter = {};
        
        if (period !== 'all') {
            const now = new Date();
            let startOfPeriod;
            
            switch (period) {
                case 'today':
                    startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    const day = now.getDay();
                    startOfPeriod = new Date(now.setDate(now.getDate() - day));
                    startOfPeriod.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startOfPeriod = new Date(now.getFullYear(), 0, 1);
                    break;
                case 'last30':
                    startOfPeriod = new Date(now.setDate(now.getDate() - 30));
                    break;
                default:
                    startOfPeriod = new Date(now.setDate(now.getDate() - 30));
            }
            
            dateFilter.transaction_date = { $gte: startOfPeriod };
        }
        
        // Get overall statistics
        const overallStats = await ShopRevenue.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    total_shop_earnings: { $sum: "$shop_earning" },
                    paid_to_shops: { 
                        $sum: { $cond: [{ $eq: ["$is_paid", true] }, "$shop_earning", 0] } 
                    },
                    unpaid_to_shops: { 
                        $sum: { $cond: [{ $eq: ["$is_paid", false] }, "$shop_earning", 0] } 
                    },
                    orders_count: { $sum: 1 }
                }
            }
        ]);
        
        // Get revenue by shop category
        const shopCategoryRevenue = await ShopRevenue.aggregate([
            { $match: dateFilter },
            { 
                $lookup: {
                    from: 'shops',
                    localField: 'shop_id',
                    foreignField: '_id',
                    as: 'shop_info'
                }
            },
            { $unwind: "$shop_info" },
            {
                $group: {
                    _id: "$shop_info.category",
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    shops_count: { $addToSet: "$shop_id" },
                    orders_count: { $sum: 1 }
                }
            },
            { 
                $project: {
                    category: "$_id",
                    total_revenue: 1,
                    total_commission: 1,
                    shops_count: { $size: "$shops_count" },
                    orders_count: 1,
                    avg_order_value: { $divide: ["$total_revenue", "$orders_count"] }
                }
            },
            { $sort: { total_revenue: -1 } }
        ]);
        
        // Get revenue trend (last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const revenueTrend = await ShopRevenue.aggregate([
            { 
                $match: { 
                    transaction_date: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$transaction_date" },
                        month: { $month: "$transaction_date" }
                    },
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    orders_count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    year_month: { 
                        $concat: [
                            { $toString: "$_id.year" }, 
                            "-", 
                            { $toString: { $cond: [{ $lt: ["$_id.month", 10] }, { $concat: ["0", { $toString: "$_id.month" }] }, { $toString: "$_id.month" }] } }
                        ]
                    },
                    total_revenue: 1,
                    total_commission: 1,
                    commission_percentage: { 
                        $multiply: [
                            { $divide: ["$total_commission", "$total_revenue"] }, 
                            100
                        ] 
                    },
                    orders_count: 1
                }
            },
            { $sort: { year_month: 1 } }
        ]);
        
        // Format the response
        const response = {
            period,
            summary: overallStats.length > 0 ? {
                total_revenue: overallStats[0].total_revenue,
                total_commission: overallStats[0].total_commission,
                total_shop_earnings: overallStats[0].total_shop_earnings,
                paid_to_shops: overallStats[0].paid_to_shops,
                unpaid_to_shops: overallStats[0].unpaid_to_shops,
                orders_count: overallStats[0].orders_count,
                platform_revenue_percentage: (overallStats[0].total_commission / overallStats[0].total_revenue * 100).toFixed(2) + '%',
                avg_order_value: (overallStats[0].total_revenue / overallStats[0].orders_count).toFixed(2)
            } : {
                total_revenue: 0,
                total_commission: 0,
                total_shop_earnings: 0,
                paid_to_shops: 0,
                unpaid_to_shops: 0,
                orders_count: 0,
                platform_revenue_percentage: '0%',
                avg_order_value: '0'
            },
            revenue_by_shop_category: shopCategoryRevenue,
            revenue_trend: revenueTrend
        };
        
        res.status(200).json(response);
        
    } catch (error) {
        console.error("Error getting system revenue overview:", error);
        res.status(500).json({ message: error.message });
    }
};

// Create revenue record when an order is delivered
const createRevenueRecord = async (req, res) => {
    try {
        const { order_id } = req.body;

        // Check if revenue record already exists for this order
        const existingRecord = await ShopRevenue.findOne({ order_id });
        if (existingRecord) {
            return res.status(400).json({ message: "Revenue record for this order already exists" });
        }

        // Get order details
        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Check if order is delivered
        if (order.order_status !== 'delivered') {
            return res.status(400).json({ message: "Only delivered orders can generate revenue" });
        }

        // Get shop details from order details
        const orderDetails = await db.orderDetail.findOne({ order_id }).populate('product_id');
        if (!orderDetails || !orderDetails.product_id) {
            return res.status(404).json({ message: "Order details or product not found" });
        }

        const shop_id = orderDetails.product_id.shop_id;

        // Calculate commission (10% of total price)
        const commission_rate = 0.1; // 10%
        const total_amount = order.total_price;
        const commission_amount = total_amount * commission_rate;
        const shop_earning = total_amount - commission_amount;

        // Create revenue record
        const newRevenue = new ShopRevenue({
            shop_id,
            order_id,
            total_amount,
            commission_rate,
            commission_amount,
            shop_earning,
            transaction_date: order.order_delivered_at || order.updated_at
        });

        await newRevenue.save();

        res.status(201).json({
            message: "Revenue record created successfully",
            revenue: newRevenue
        });
    } catch (error) {
        console.error("Error creating revenue record:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get revenue statistics for a shop
const getShopRevenueStats = async (req, res) => {
    try {
        const { shop_id } = req.params;
        const { period, start_date, end_date } = req.query;

        // Validate shop_id
        if (!mongoose.Types.ObjectId.isValid(shop_id)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        // Check if shop exists
        const shop = await Shop.findById(shop_id);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Build date filter
        let dateFilter = { shop_id };

        if (start_date && end_date) {
            dateFilter.transaction_date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        } else if (period) {
            const now = new Date();
            let startOfPeriod;

            switch (period) {
                case 'day':
                    startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    const day = now.getDay();
                    startOfPeriod = new Date(now.setDate(now.getDate() - day));
                    startOfPeriod.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startOfPeriod = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startOfPeriod = new Date(now.setDate(now.getDate() - 30)); // Last 30 days by default
            }

            dateFilter.transaction_date = { $gte: startOfPeriod };
        }

        // Get revenue statistics
        const stats = await ShopRevenue.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    total_earnings: { $sum: "$shop_earning" },
                    orders_count: { $sum: 1 },
                    paid_amount: {
                        $sum: {
                            $cond: [{ $eq: ["$is_paid", true] }, "$shop_earning", 0]
                        }
                    },
                    unpaid_amount: {
                        $sum: {
                            $cond: [{ $eq: ["$is_paid", false] }, "$shop_earning", 0]
                        }
                    }
                }
            }
        ]);

        // Get daily breakdown if requested
        let dailyStats = [];
        if (req.query.daily === 'true') {
            dailyStats = await ShopRevenue.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$transaction_date" }
                        },
                        total_revenue: { $sum: "$total_amount" },
                        total_commission: { $sum: "$commission_amount" },
                        total_earnings: { $sum: "$shop_earning" },
                        orders_count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        }

        // Get monthly breakdown if requested
        let monthlyStats = [];
        if (req.query.monthly === 'true') {
            monthlyStats = await ShopRevenue.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m", date: "$transaction_date" }
                        },
                        total_revenue: { $sum: "$total_amount" },
                        total_commission: { $sum: "$commission_amount" },
                        total_earnings: { $sum: "$shop_earning" },
                        orders_count: { $sum: 1 }
                    }
                },
                { $sort: { _id: 1 } }
            ]);
        }

        // Format the response
        const response = {
            shop_id,
            shop_name: shop.name,
            period: period || 'custom',
            summary: stats.length > 0 ? {
                total_revenue: stats[0].total_revenue,
                total_commission: stats[0].total_commission,
                total_earnings: stats[0].total_earnings,
                orders_count: stats[0].orders_count,
                paid_amount: stats[0].paid_amount,
                unpaid_amount: stats[0].unpaid_amount
            } : {
                total_revenue: 0,
                total_commission: 0,
                total_earnings: 0,
                orders_count: 0,
                paid_amount: 0,
                unpaid_amount: 0
            }
        };

        if (dailyStats.length > 0) {
            response.daily_breakdown = dailyStats.map(day => ({
                date: day._id,
                total_revenue: day.total_revenue,
                total_commission: day.total_commission,
                total_earnings: day.total_earnings,
                orders_count: day.orders_count
            }));
        }

        if (monthlyStats.length > 0) {
            response.monthly_breakdown = monthlyStats.map(month => ({
                month: month._id,
                total_revenue: month.total_revenue,
                total_commission: month.total_commission,
                total_earnings: month.total_earnings,
                orders_count: month.orders_count
            }));
        }

        return res.status(200).json(response);
    } catch (error) {
        console.error("Error getting shop revenue statistics:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get unpaid revenue details for a shop
const getUnpaidRevenue = async (req, res) => {
    try {
        const { shop_id } = req.params;

        // Validate shop ID
        if (!mongoose.Types.ObjectId.isValid(shop_id)) {
            return res.status(400).json({ message: "Invalid shop ID" });
        }

        // Check if shop exists
        const shop = await Shop.findById(shop_id);
        if (!shop) {
            return res.status(404).json({ message: "Shop not found" });
        }

        // Get unpaid revenue records
        const unpaidRevenue = await ShopRevenue.find({
            shop_id,
            is_paid: false
        }).sort({ transaction_date: 1 });

        // Calculate total unpaid amount
        const total = unpaidRevenue.reduce((sum, record) => sum + record.shop_earning, 0);

        res.status(200).json({
            shop_id,
            shop_name: shop.name,
            unpaid_records: unpaidRevenue,
            total_unpaid: total,
            count: unpaidRevenue.length
        });
    } catch (error) {
        console.error("Error getting unpaid revenue:", error);
        res.status(500).json({ message: error.message });
    }
};

// Create payment batch for shops (every 3 days)
const createPaymentBatch = async (req, res) => {
    try {
        // Generate a unique batch ID
        const timestamp = moment().format('YYYYMMDD-HHmmss');
        const batchId = `BATCH-${timestamp}`;

        // Calculate date range (current date minus 3 days)
        const endDate = new Date();
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 3);

        // Find all unpaid revenue records within date range
        const unpaidRecords = await ShopRevenue.find({
            is_paid: false,
            transaction_date: { $lt: endDate }
        });

        if (unpaidRecords.length === 0) {
            return res.status(400).json({ message: "No unpaid revenues found to process" });
        }

        // Calculate total amount
        const totalAmount = unpaidRecords.reduce((sum, record) => sum + record.shop_earning, 0);

        // Group by shop to count total shops
        const uniqueShops = new Set(unpaidRecords.map(record => record.shop_id.toString()));

        // Create payment batch
        const newBatch = new PaymentBatch({
            batch_id: batchId,
            start_date: startDate,
            end_date: endDate,
            total_shops: uniqueShops.size,
            total_amount: totalAmount
        });

        await newBatch.save();

        // Update revenue records with batch ID
        await ShopRevenue.updateMany(
            { _id: { $in: unpaidRecords.map(record => record._id) } },
            { payment_batch: batchId }
        );

        res.status(201).json({
            message: "Payment batch created successfully",
            batch: newBatch,
            records_count: unpaidRecords.length
        });
    } catch (error) {
        console.error("Error creating payment batch:", error);
        res.status(500).json({ message: error.message });
    }
};

// Process payment batch (mark as paid)
const processPaymentBatch = async (req, res) => {
    try {
        const { batch_id } = req.params;
        const { transaction_id } = req.body;

        if (!batch_id || !transaction_id) {
            return res.status(400).json({ message: "Batch ID and transaction ID are required" });
        }

        // Find batch
        const batch = await PaymentBatch.findOne({ batch_id });
        if (!batch) {
            return res.status(404).json({ message: "Payment batch not found" });
        }

        if (batch.status === 'completed') {
            return res.status(400).json({ message: "Batch already processed" });
        }

        // Update batch status
        batch.status = 'completed';
        batch.processed_at = new Date();
        await batch.save();

        // Update all revenue records in this batch
        const result = await ShopRevenue.updateMany(
            { payment_batch: batch_id },
            {
                is_paid: true,
                payment_date: new Date(),
                payment_id: transaction_id
            }
        );

        res.status(200).json({
            message: "Payment batch processed successfully",
            batch: batch,
            records_updated: result.modifiedCount
        });
    } catch (error) {
        console.error("Error processing payment batch:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get payment batch details
const getPaymentBatchDetails = async (req, res) => {
    try {
        const { batch_id } = req.params;

        // Find batch
        const batch = await PaymentBatch.findOne({ batch_id });
        if (!batch) {
            return res.status(404).json({ message: "Payment batch not found" });
        }

        // Get all records in this batch
        const records = await ShopRevenue.find({ payment_batch: batch_id })
            .populate('shop_id', 'name email phone')
            .populate('order_id');

        // Group by shop
        const shopPayments = {};
        records.forEach(record => {
            const shopId = record.shop_id._id.toString();
            if (!shopPayments[shopId]) {
                shopPayments[shopId] = {
                    shop: record.shop_id,
                    total_amount: 0,
                    records: []
                };
            }

            shopPayments[shopId].total_amount += record.shop_earning;
            shopPayments[shopId].records.push(record);
        });

        res.status(200).json({
            batch: batch,
            shop_payments: Object.values(shopPayments),
            total_records: records.length
        });
    } catch (error) {
        console.error("Error getting batch details:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get all payment batches with pagination
const getAllPaymentBatches = async (req, res) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Build filter
        const filter = {};
        if (status) {
            filter.status = status;
        }

        // Get batches with pagination
        const batches = await PaymentBatch.find(filter)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Count total
        const total = await PaymentBatch.countDocuments(filter);

        res.status(200).json({
            batches,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            totalItems: total
        });
    } catch (error) {
        console.error("Error getting payment batches:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get platform revenue statistics
const getPlatformRevenue = async (req, res) => {
    try {
        const { period, start_date, end_date } = req.query;

        // Build date filter
        let dateFilter = {};

        if (start_date && end_date) {
            dateFilter.transaction_date = {
                $gte: new Date(start_date),
                $lte: new Date(end_date)
            };
        } else if (period) {
            const now = new Date();
            let startOfPeriod;

            switch (period) {
                case 'day':
                    startOfPeriod = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    const day = now.getDay();
                    startOfPeriod = new Date(now.setDate(now.getDate() - day));
                    startOfPeriod.setHours(0, 0, 0, 0);
                    break;
                case 'month':
                    startOfPeriod = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startOfPeriod = new Date(now.getFullYear(), 0, 1);
                    break;
                default:
                    startOfPeriod = new Date(now.setDate(now.getDate() - 30)); // Last 30 days by default
            }

            dateFilter.transaction_date = { $gte: startOfPeriod };
        }

        // Get platform revenue statistics
        const stats = await ShopRevenue.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    total_shop_earnings: { $sum: "$shop_earning" },
                    orders_count: { $sum: 1 }
                }
            }
        ]);

        // Get daily breakdown
        const dailyStats = await ShopRevenue.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$transaction_date" }
                    },
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    orders_count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get monthly breakdown
        const monthlyStats = await ShopRevenue.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m", date: "$transaction_date" }
                    },
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    orders_count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get top shops by revenue
        const topShops = await ShopRevenue.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: "$shop_id",
                    total_revenue: { $sum: "$total_amount" },
                    total_commission: { $sum: "$commission_amount" },
                    orders_count: { $sum: 1 }
                }
            },
            { $sort: { total_revenue: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'shops',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'shop_info'
                }
            },
            {
                $project: {
                    shop_id: "$_id",
                    shop_name: { $arrayElemAt: ["$shop_info.name", 0] },
                    total_revenue: 1,
                    total_commission: 1,
                    orders_count: 1
                }
            }
        ]);

        // Format the response
        const response = {
            period: period || 'custom',
            summary: stats.length > 0 ? {
                total_revenue: stats[0].total_revenue,
                total_commission: stats[0].total_commission,
                total_shop_earnings: stats[0].total_shop_earnings,
                orders_count: stats[0].orders_count,
                platform_revenue_percentage: (stats[0].total_commission / stats[0].total_revenue * 100).toFixed(2) + '%'
            } : {
                total_revenue: 0,
                total_commission: 0,
                total_shop_earnings: 0,
                orders_count: 0,
                platform_revenue_percentage: '0%'
            },
            daily_breakdown: dailyStats.map(day => ({
                date: day._id,
                total_revenue: day.total_revenue,
                total_commission: day.total_commission,
                orders_count: day.orders_count
            })),
            monthly_breakdown: monthlyStats.map(month => ({
                month: month._id,
                total_revenue: month.total_revenue,
                total_commission: month.total_commission,
                orders_count: month.orders_count
            })),
            top_shops: topShops
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error getting platform revenue statistics:", error);
        res.status(500).json({ message: error.message });
    }
};
// API để lấy danh sách shop và số tiền phải trả
const getShopsPaymentSummary = async (req, res) => {
    try {
        const {
            min_amount,
            max_amount,
            sort_by = 'total_amount',
            sort_order = 'desc',
            page = 1,
            limit = 10,
            shop_name,
            payment_status
        } = req.query;

        // Xây dựng filter
        const filter = { is_paid: false }; // Mặc định lấy các thanh toán chưa trả

        if (payment_status && payment_status !== 'all') {
            filter.is_paid = payment_status === 'paid';
        }

        // Tính năng phân trang
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Lấy dữ liệu ShopRevenue từ database và tính tổng theo shop_id
        const aggregationPipeline = [
            { $match: filter },
            {
                $group: {
                    _id: "$shop_id",
                    total_amount: { $sum: "$shop_earning" },
                    orders_count: { $sum: 1 },
                    last_transaction_date: { $max: "$transaction_date" }
                }
            },
            // Lookup để lấy thông tin shop
            {
                $lookup: {
                    from: 'shops',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'shop_info'
                }
            },
            {
                $project: {
                    shop_id: "$_id",
                    shop_name: { $arrayElemAt: ["$shop_info.name", 0] },
                    shop_email: { $arrayElemAt: ["$shop_info.email", 0] },
                    shop_phone: { $arrayElemAt: ["$shop_info.phone", 0] },
                    total_amount: 1,
                    orders_count: 1,
                    last_transaction_date: 1
                }
            }
        ];

        // Thêm filter theo tên shop nếu có
        if (shop_name) {
            aggregationPipeline.splice(2, 0, {
                $match: {
                    shop_name: { $regex: shop_name, $options: 'i' }
                }
            });
        }

        // Thêm filter theo khoảng tiền nếu có
        if (min_amount !== undefined || max_amount !== undefined) {
            const amountFilter = {};
            if (min_amount !== undefined) {
                amountFilter.$gte = parseFloat(min_amount);
            }
            if (max_amount !== undefined) {
                amountFilter.$lte = parseFloat(max_amount);
            }

            aggregationPipeline.splice(2, 0, {
                $match: {
                    total_amount: amountFilter
                }
            });
        }

        // Thêm sắp xếp
        aggregationPipeline.push({
            $sort: {
                [sort_by]: sort_order === 'asc' ? 1 : -1
            }
        });

        // Đếm tổng số bản ghi trước khi phân trang
        const countPipeline = [...aggregationPipeline];
        const countResult = await ShopRevenue.aggregate(countPipeline);
        const totalItems = countResult.length;

        // Thêm phân trang
        aggregationPipeline.push({ $skip: skip });
        aggregationPipeline.push({ $limit: parseInt(limit) });

        // Thực hiện truy vấn
        const shopsPayment = await ShopRevenue.aggregate(aggregationPipeline);

        // Tính tổng tiền phải trả cho tất cả các shop
        const totalAmountSum = countResult.reduce((sum, shop) => sum + shop.total_amount, 0);

        res.status(200).json({
            shops: shopsPayment,
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            currentPage: parseInt(page),
            totalItems: totalItems,
            totalAmountSum: totalAmountSum
        });
    } catch (error) {
        console.error("Error getting shops payment summary:", error);
        res.status(500).json({ message: error.message });
    }
};
const shopRevenueController = {
    createRevenueRecord,
    getShopRevenueStats,
    getUnpaidRevenue,
    createPaymentBatch,
    processPaymentBatch,
    getPaymentBatchDetails,
    getAllPaymentBatches,
    getPlatformRevenue,
    getShopsPaymentSummary,
    getSystemRevenueOverview  
};

module.exports = shopRevenueController;