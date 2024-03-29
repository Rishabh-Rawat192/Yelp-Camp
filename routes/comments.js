const express=require("express");
const router=express.Router({mergeParams:true});
const Campground=require("../models/campground");
const Comment=require("../models/comment");
const middleware=require("../middleware");

//Comments New
router.get("/new",middleware.isLoggedin,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err)
			console.log(err);
		else
			res.render("comments/new",{campground:campground});
	});
});
//Comments Create
router.post("/",middleware.isLoggedin,function(req,res){
	Campground.findById(req.params.id,function(err,campground){
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}
		else{
			Comment.create(req.body.comment,function(err,comment){
				if(err){
					req.flash("error","Something went wrong");
					console.log(err);
				}
				else{
					//Add id and username
					comment.author.id=req.user._id;
					comment.author.username=req.user.username;
					//save commet
					comment.save();
					campground.comments.push(comment);
					campground.save();
				
					req.flash("success","Successfully added comment");
					res.redirect("/campgrounds/"+campground._id);
				}
			});
		}
	});
});

//COMMENTS EDIT ROUTE
router.get("/:comment_id/edit",middleware.checkCommentOwnership,function(req,res){
	Campground.findById(req.params.id,function(err,foundCampground){
		if(err||!foundCampground){
			req.flash("error","No campground found");
			return res.redirect("back");
		}
		Comment.findById(req.params.comment_id,function(err,foundComment){
			if(err)
				res.redirect("back");
			else{
				res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
			}
		});
	});

});

//COMMENTS UPDATE ROUTE
router.put("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,function(err,updatedComment){
		if(err)
			res.redirect("back");
		else{
			res.redirect("/campgrounds/"+req.params.id);
		}
	});
});

//COMMENTS DESTROY ROUTE
router.delete("/:comment_id",middleware.checkCommentOwnership,function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id,function(err){
		if(err)
			res.redirect("back");
		else{
			req.flash("success","Comment deleted");
			res.redirect("/campgrounds/"+req.params.id);
		}
			
	})
});

module.exports=router;
