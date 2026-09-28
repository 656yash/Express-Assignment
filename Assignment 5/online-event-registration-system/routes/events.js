const express=require("express");
const {body,validationResult}=require("express-validator");
const Event=require("../models/Event");
const Registration=require("../models/Registration");
const {isAuthenticated,isAdmin}=require("../middleware/auth");
const router=express.Router();

const validation=[
 body("title").trim().isLength({min:3,max:120}).withMessage("Event title must be 3-120 characters"),
 body("description").trim().isLength({min:5,max:1000}).withMessage("Description must be 5-1000 characters"),
 body("date").isISO8601().withMessage("Enter a valid event date"),
 body("venue").trim().notEmpty().withMessage("Venue is required"),
 body("category").trim().notEmpty().withMessage("Category is required"),
 body("capacity").isInt({min:1}).withMessage("Capacity must be a positive integer"),
 body("registrationFee").isFloat({min:0}).withMessage("Registration fee cannot be negative")
];

router.get("/",isAuthenticated,async(req,res,next)=>{
 try{res.render("events",{events:await Event.find().sort({date:1})});}catch(e){next(e);}
});
router.get("/add",isAuthenticated,isAdmin,(req,res)=>res.render("event-form",{mode:"add",event:{},errors:[]}));

router.post("/add",isAuthenticated,isAdmin,validation,async(req,res,next)=>{
 const errors=validationResult(req);
 if(!errors.isEmpty())return res.status(400).render("event-form",{mode:"add",event:req.body,errors:errors.array()});
 try{
  await Event.create({title:req.body.title,description:req.body.description,date:new Date(req.body.date),venue:req.body.venue,category:req.body.category,capacity:Number(req.body.capacity),registrationFee:Number(req.body.registrationFee)});
  res.redirect("/events");
 }catch(e){next(e);}
});

router.get("/edit/:id",isAuthenticated,isAdmin,async(req,res,next)=>{
 try{
  const event=await Event.findById(req.params.id);
  if(!event)return res.status(404).render("error",{status:404,message:"Event not found"});
  res.render("event-form",{mode:"edit",event,errors:[]});
 }catch(e){res.status(400).render("error",{status:400,message:"Invalid event ID"});}
});

router.post("/edit/:id",isAuthenticated,isAdmin,validation,async(req,res,next)=>{
 const errors=validationResult(req);
 try{
  const event=await Event.findById(req.params.id);
  if(!event)return res.status(404).render("error",{status:404,message:"Event not found"});
  if(!errors.isEmpty())return res.status(400).render("event-form",{mode:"edit",event:{...event.toObject(),...req.body},errors:errors.array()});
  Object.assign(event,{title:req.body.title,description:req.body.description,date:new Date(req.body.date),venue:req.body.venue,category:req.body.category,capacity:Number(req.body.capacity),registrationFee:Number(req.body.registrationFee)});
  await event.save();res.redirect("/events");
 }catch(e){next(e);}
});

router.post("/delete/:id",isAuthenticated,isAdmin,async(req,res,next)=>{
 try{
  const event=await Event.findById(req.params.id);
  if(!event)return res.status(404).render("error",{status:404,message:"Event not found"});
  await Registration.deleteMany({event:event._id});
  await Event.findByIdAndDelete(event._id);
  res.redirect("/events");
 }catch(e){next(e);}
});
module.exports=router;