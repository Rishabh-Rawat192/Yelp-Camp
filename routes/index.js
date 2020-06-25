const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
// Set your secret key. Remember to switch to your live secret key in production!
// See your keys here: https://dashboard.stripe.com/account/apikeys
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//root route
router.get("/", function (req, res) {
    res.render("landing");
});

//show register form
router.get("/register", function (req, res) {
    res.render("register", { page: "register" });
});

//handle sign up logic
router.post("/register", function (req, res) {
    const newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, function (err, user) {
        if (err) {
            // req.flash("error",err.message);
            // return res.redirect("/register");
            return res.render("register", { error: err.message });
        }
        passport.authenticate("local")(req, res, function () {
            req.flash("success", "Welcome to YelpCamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

//Show login form
router.get("/login", function (req, res) {
    res.render("login", { page: "login" });
});

//Handle Login logic
router.post(
    "/login",
    passport.authenticate("local", {
        successRedirect: "/campgrounds",
        failureRedirect: "/login",
        //failureFlash:true
        failureFlash: "Enter valid username and password",
        successFlash: "Welcome back",
    }),
    function (req, res) {}
);

//Logout route
router.get("/logout", function (req, res) {
    req.logout();
    req.flash("success", "logged you out");
    res.redirect("/campgrounds");
    // res.status(200).clearCookie('connect.sid', {
    // path: '/'
    // });
    // req.session.destroy(function (err) {
    // res.redirect('/');
    // });
});

//Checkout
router.get("/checkout", async (req, res) => {
    try {
        let amount = 20;
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount * 100,
            currency: "inr",
            // Verify your integration in this guide by including this parameter
            metadata: { integration_check: "accept_a_payment" },
        });
        const { client_secret } = paymentIntent;
        res.render("checkout", { client_secret, amount });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("back");
    }
});

module.exports = router;
