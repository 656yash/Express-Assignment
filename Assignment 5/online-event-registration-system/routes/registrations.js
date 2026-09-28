const express=require("express");
const {body,validationResult}=require("express-validator");
const Event=require("../models/Event");
const Registration=require("../models/Registration");
const {isAuthenticated,isAdmin}=require("../middleware/auth");
const router=express.Router();

router.get("/new/:eventId",isAuthenticated,async(req,res,next)=>{
 try{
  const event=await Event.findById(req.params.eventId);
  if(!event)return res.status(404).render("error",{status:404,message:"Event not found"});
  const count=await Registration.countDocuments({event:event._id,status:{$ne:"Cancelled"}});
  if(count>=event.capacity)return res.status(409).render("error",{status:409,message:"This event is full"});
  res.render("registration-form",{event,user:req.session.user,errors:[]});
 }catch(e){next(e);}
});

const regValidation=[
 body("attendeeName").trim().isLength({min:2,max:60}).withMessage("Name must be 2-60 characters").matches(/^[A-Za-z ]+$/).withMessage("Name can contain only letters and spaces"),
 body("attendeeEmail").trim().isEmail().withMessage("Enter a valid email").normalizeEmail(),
 body("attendeeMobile").trim().matches(/^[6-9][0-9]{9}$/).withMessage("Enter a valid 10-digit mobile number"),
 body("attendeeAge").isInt({min:10,max:100}).withMessage("Age must be between 10 and 100")
];

router.post("/register/:eventId",isAuthenticated,regValidation,async(req,res,next)=>{
 const errors=validationResult(req);
 try{
  const event=await Event.findById(req.params.eventId);
  if(!event)return res.status(404).render("error",{status:404,message:"Event not found"});
  if(!errors.isEmpty())return res.status(400).render("registration-form",{event,user:req.session.user,errors:errors.array()});
  const existing=await Registration.findOne({user:req.session.user.id,event:event._id});
  if(existing&&existing.status!=="Cancelled")return res.status(409).render("error",{status:409,message:"You are already registered for this event"});
  const count=await Registration.countDocuments({event:event._id,status:{$ne:"Cancelled"}});
  if(count>=event.capacity)return res.status(409).render("error",{status:409,message:"This event is full"});
  const data={attendeeName:req.body.attendeeName,attendeeEmail:req.body.attendeeEmail,attendeeMobile:req.body.attendeeMobile,attendeeAge:Number(req.body.attendeeAge)};
  if(existing){Object.assign(existing,data,{status:"Registered"});await existing.save();}
  else await Registration.create({user:req.session.user.id,event:event._id,...data});
  res.redirect("/registrations/my");
 }catch(e){next(e);}
});

router.get("/my",isAuthenticated,async(req,res,next)=>{
 try{res.render("my-registrations",{registrations:await Registration.find({user:req.session.user.id}).populate("event").sort({createdAt:-1})});}catch(e){next(e);}
});

router.post("/cancel/:id",isAuthenticated,async(req,res,next)=>{
 try{
  const r=await Registration.findOne({_id:req.params.id,user:req.session.user.id});
  if(!r)return res.status(404).render("error",{status:404,message:"Registration not found"});
  r.status="Cancelled";await r.save();res.redirect("/registrations/my");
 }catch(e){next(e);}
});

router.get("/admin",isAuthenticated,isAdmin,async(req,res,next)=>{
 try{
  const registrations=await Registration.find().populate("user","name email").populate("event").sort({createdAt:-1});
  res.render("admin-registrations",{registrations});
 }catch(e){next(e);}
});

router.post("/admin/:id/status",isAuthenticated,isAdmin,[
 body("status").isIn(["Registered","Confirmed","Cancelled"]).withMessage("Invalid registration status")
],async(req,res,next)=>{
 const errors=validationResult(req);
 if(!errors.isEmpty())return res.status(400).render("error",{status:400,message:errors.array()[0].msg});
 try{
  const r=await Registration.findById(req.params.id);
  if(!r)return res.status(404).render("error",{status:404,message:"Registration not found"});
  r.status=req.body.status;await r.save();res.redirect("/registrations/admin");
 }catch(e){next(e);}
});
module.exports=router;