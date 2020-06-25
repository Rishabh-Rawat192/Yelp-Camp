const express=require("express");
const router=express.Router();
const passport=require("passport");
const User=require("../models/user");

//root route
router.get("/",function(req,res){
	res.render("landing");
});

//show register form
router.get("/register",function(req,res){
	res.render("register",{page:"register"});
});

//handle sign up logic
router.post("/register",function(req,res){
	const newUser=new User({username:req.body.username});
	User.register(newUser,req.body.password,function(err,user){
		if(err){
			// req.flash("error",err.message);
			// return res.redirect("/register");
			return res.render("register",{"error":err.message});
		}
		passport.authenticate("local")(req,res,function(){
			req.flash("success","Welcome to YelpCamp "+user.username);
			res.redirect("/campgrounds");
		});
	});
});

//Show login form
router.get("/login",function(req,res){
	res.render("login",{page:"login"});
});

//Handle Login logic
router.post("/login",passport.authenticate("local",
	{
		successRedirect:"/campgrounds",
		failureRedirect:"/login",
		//failureFlash:true
		failureFlash:"Enter valid username and password",
		successFlash:"Welcome back"
	}),function(req,res){
});

//Logout route
router.get("/logout",function(req,res){
	req.logout();
	req.flash("success","logged you out");
	res.redirect("/campgrounds");
	// res.status(200).clearCookie('connect.sid', { 
	// path: '/'
	// });
	// req.session.destroy(function (err) {
	// res.redirect('/');
	// });
});


module.exports=router;