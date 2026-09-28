const express=require("express");
const bcrypt=require("bcryptjs");
const {body,validationResult}=require("express-validator");
const User=require("../models/User");
const router=express.Router();

router.get("/login",(req,res)=>res.render("login",{errors:[]}));
router.get("/register",(req,res)=>res.render("register",{errors:[],oldData:{}}));

router.post("/register",[
 body("name").trim().isLength({min:2,max:60}).withMessage("Name must be 2-60 characters").matches(/^[A-Za-z ]+$/).withMessage("Name can contain only letters and spaces"),
 body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
 body("mobile").trim().matches(/^[6-9][0-9]{9}$/).withMessage("Enter a valid 10-digit mobile number"),
 body("age").isInt({min:10,max:100}).withMessage("Age must be between 10 and 100"),
 body("password").isLength({min:6}).withMessage("Password must be at least 6 characters")
],async(req,res,next)=>{
 const errors=validationResult(req);
 if(!errors.isEmpty())return res.status(400).render("register",{errors:errors.array(),oldData:req.body});
 try{
  if(await User.findOne({email:req.body.email}))return res.status(409).render("register",{errors:[{msg:"Email is already registered"}],oldData:req.body});
  await User.create({name:req.body.name,email:req.body.email,mobile:req.body.mobile,age:Number(req.body.age),password:await bcrypt.hash(req.body.password,12)});
  res.redirect("/login");
 }catch(e){next(e);}
});

router.post("/login",[
 body("email").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
 body("password").notEmpty().withMessage("Password is required")
],async(req,res,next)=>{
 const errors=validationResult(req);
 if(!errors.isEmpty())return res.status(400).render("login",{errors:errors.array()});
 try{
  const user=await User.findOne({email:req.body.email});
  if(!user||!(await bcrypt.compare(req.body.password,user.password)))return res.status(401).render("login",{errors:[{msg:"Invalid email or password"}]});
  req.session.user={id:user._id.toString(),name:user.name,email:user.email,mobile:user.mobile,age:user.age,role:user.role};
  res.redirect("/events");
 }catch(e){next(e);}
});
router.get("/logout",(req,res)=>req.session.destroy(()=>res.redirect("/login")));
module.exports=router;