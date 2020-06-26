const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const Comment = require("../models/comment");
const middleware = require("../middleware");

const multer = require("multer");
const storage = multer.diskStorage({
    filename: function (req, file, callback) {
        callback(null, Date.now() + file.originalname);
    },
});
const imageFilter = function (req, file, cb) {
    // accept image files only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
const upload = multer({ storage: storage, fileFilter: imageFilter });

const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: "dpetxulxq",
    api_key: "545396833488359",
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

//INDEX - show all campgrounds
router.get("/", function (req, res) {
    Campground.find({}, (err, allCampgrounds) => {
        if (err) console.log(err);
        else
            res.render("campgrounds/index", {
                campgrounds: allCampgrounds,
                page: "campgrounds",
            });
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedin, upload.single("image"), function (
    req,
    res
) {
    cloudinary.uploader.upload(req.file.path, function (error, result) {
        if (error) {
            req.flash("error", error.message);
            return res.redirect("back");
        }

        // add cloudinary url for the image to the body object
        req.body.image = result.secure_url;
        // add image's public_id to body object
        req.body.imageId = result.public_id;

        const name = req.body.name;
        const price = req.body.price;
        const image = req.body.image;
        const imageId = req.body.imageId;
        const desc = req.body.description;
        const author = {
            id: req.user._id,
            username: req.user.username,
        };

        const newCampground = {
            name: name,
            price: price,
            image: image,
            imageId: imageId,
            description: desc,
            author: author,
        };
        Campground.create(newCampground, function (err, newlyCreated) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            res.redirect("/campgrounds/" + newlyCreated.id);
        });
    });
});

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedin, function (req, res) {
    res.render("campgrounds/new");
});

// SHOW - shows more info about one campground
router.get("/:id", function (req, res) {
    Campground.findById(req.params.id)
        .populate("comments")
        .exec(function (err, foundCampground) {
            if (err || !foundCampground) {
                console.log(err);
                req.flash("error", "Sorry, that campground does not exist!");
                res.redirect("/campgrounds");
            } else {
                res.render("campgrounds/show", { campground: foundCampground });
            }
        });
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, function (
    req,
    res
) {
    Campground.findById(req.params.id, function (err, foundCampground) {
        res.render("campgrounds/edit", { campground: foundCampground });
    });
});

//UPDATE CAMPGROUND ROUTE
router.put(
    "/:id",
    middleware.checkCampgroundOwnership,
    upload.single("image"),
    function (req, res) {
        Campground.findById(req.params.id, async function (err, campground) {
            if (err) {
                req.flash("error", err.message);
                res.redirect("back");
            } else {
                if (req.file) {
                    try {
                        await cloudinary.uploader.destroy(campground.imageId);
                        const result = await cloudinary.uploader.upload(
                            req.file.path
                        );

                        campground.imageId = result.public_id;
                        campground.image = result.secure_url;
                    } catch (err) {
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                }
                campground.name = req.body.campground.name;
                campground.price = req.body.campground.price;
                campground.description = req.body.campground.description;
                campground.save();
                req.flash("success", "Successfully Updated!");
                res.redirect("/campgrounds/" + campground._id);
            }
        });
    }
);

//DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    //delete comments
    Campground.findById(req.params.id, async function (err, foundCampground) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        } else {
            try {
                await cloudinary.uploader.destroy(foundCampground.imageId);
            } catch (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            foundCampground.comments.forEach(function (comment) {
                Comment.findByIdAndRemove(comment, function (err) {
                    if (err) console.log(err);
                });
            });
        }
    });
    //delete campground
    Campground.findByIdAndRemove(req.params.id, function (err) {
        if (err) res.redirect("/campgrounds");
        else res.redirect("/campgrounds");
    });
});

module.exports = router;
