const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Campground.findById(req.params.id, function (err, foundCampground) {
            if (err || !foundCampground) {
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                if (foundCampground.author.id.equals(req.user._id)) next();
                else {
                    req.flash("error", "You dont't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You have to login to do that");
        res.redirect("back");
    }
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
    if (req.isAuthenticated()) {
        Comment.findById(req.params.comment_id, function (err, foundComment) {
            if (err || !foundComment) {
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //does owner own this comment?
                if (foundComment.author.id.equals(req.user._id)) next();
                else {
                    req.flash("error", "You dont't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You have to login to do that");
        res.redirect("back");
    }
};

middlewareObj.isLoggedin = function (req, res, next) {
    if (req.isAuthenticated()) return next();

    if (req["headers"]["content-type"] === "application/json") {
        return res.send({ error: "Login required" });
    }

    req.flash("error", "You have to login to do that");
    res.redirect("/login");
};

middlewareObj.isPaid = function (req, res, next) {
    if (req.user.isPaid) return next();

    req.flash("error", "Please pay registration fee before continuing...");
    res.redirect("/checkout");
};

module.exports = middlewareObj;
