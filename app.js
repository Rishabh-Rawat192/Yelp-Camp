require("dotenv").config();
const express		=		require("express"),
 	  app			=		express(),
	  bodyParser	=		require("body-parser"),
	  mongoose		=		require("mongoose"),
	  passport		=		require("passport"),
	  LocalStrategy =  		require("passport-local"),
	  methodOverride=		require("method-override"),
	  flash			=		require("connect-flash"),
	  Campground    =		require("./models/campground"),
	  Comment  		=		require("./models/comment"),
	  User			=		require("./models/user"),
	  seedDB    	=		require("./seeds");

//Requiring routes
const campgroundRoutes	=	require("./routes/campgrounds"),
	  commentRoutes		=	require("./routes/comments"),
	  indexRoutes		=	require("./routes/index");

mongoose.set('useNewUrlParser', true);
mongoose.set('useUnifiedTopology', true);
mongoose.set('useFindAndModify', false);

const url=process.env.DATABASEURL||"mongodb://localhost/yelp_camp";
mongoose.connect(url);

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine","ejs");
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();

app.locals.moment = require('moment');
//PASSPORT CONFRIGUATION
app.use(require("express-session")({
	secret:"I am again back in the game",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// caching disabled for every route
app.use(function(req, res, next) {
  res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
  next();
});
//Pass currentUser from every route
app.use(function(req,res,next){
	res.locals.currentUser=req.user;
	res.locals.error=req.flash("error");
	res.locals.success=req.flash("success");
	next();
});

app.use("/",indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds",campgroundRoutes);

const port = process.env.PORT || 3000;

app.listen(port,function(){
	console.log("YELP Camp server started");
});