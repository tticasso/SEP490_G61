const express = require('express');
const bodyParser = require('body-parser');
const shopFollowController = require('../controller/shop-follow.controller');
const VerifyJwt = require('../middlewares/verifyJwt');

const shopFollowRouter = express.Router();
shopFollowRouter.use(bodyParser.json());

// Follow a shop (requires authentication)
shopFollowRouter.post("/follow",
    [VerifyJwt.verifyToken],
    shopFollowController.followShop
);

// Unfollow a shop (requires authentication)
shopFollowRouter.delete("/unfollow/:shop_id",
    [VerifyJwt.verifyToken],
    shopFollowController.unfollowShop
);

// Get all shops followed by the logged-in user
shopFollowRouter.get("/followed",
    [VerifyJwt.verifyToken],
    shopFollowController.getFollowedShops
);

// Check if the logged-in user follows a specific shop
shopFollowRouter.get("/status/:shop_id",
    [VerifyJwt.verifyToken],
    shopFollowController.checkFollowStatus
);

// Get all followers of a shop (for shop owners and admins)
shopFollowRouter.get("/followers/:shop_id",
    [VerifyJwt.verifyToken, VerifyJwt.isAdminOrSeller],
    shopFollowController.getShopFollowers
);

module.exports = shopFollowRouter;