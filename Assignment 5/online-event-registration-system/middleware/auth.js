function isAuthenticated(req,res,next){
 if(req.session.user)return next();
 if(req.path.startsWith("/api"))return res.status(401).json({success:false,message:"Authentication required"});
 res.redirect("/login");
}
function isAdmin(req,res,next){
 if(req.session.user&&req.session.user.role==="admin")return next();
 if(req.path.startsWith("/api"))return res.status(403).json({success:false,message:"Admin access required"});
 res.status(403).render("error",{status:403,message:"Admin access required"});
}
module.exports={isAuthenticated,isAdmin};