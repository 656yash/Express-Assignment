const express=require("express");
const {body,validationResult}=require("express-validator");
const Event=require("../models/Event");
const Registration=require("../models/Registration");
const {isAuthenticated,isAdmin}=require("../middleware/auth");
const router=express.Router();

const eventValidation=[
 body("title").trim().isLength({min:3,max:120}).withMessage("Invalid event title"),
 body("description").trim().isLength({min:5,max:1000}).withMessage("Invalid description"),
 body("date").isISO8601().withMessage("Invalid event date"),
 body("venue").trim().notEmpty().withMessage("Venue is required"),
 body("category").trim().notEmpty().withMessage("Category is required"),
 body("capacity").isInt({min:1}).withMessage("Capacity must be positive"),
 body("registrationFee").isFloat({min:0}).withMessage("Fee cannot be negative")
];

router.get("/events",async(req,res,next)=>{
 try{const events=await Event.find().sort({date:1});res.status(200).json({success:true,count:events.length,data:events});}catch(e){next(e);}
});
router.get("/events/:id",async(req,res,next)=>{
 try{const event=await Event.findById(req.params.id);if(!event)return res.status(404).json({success:false,message:"Event not found"});res.json({success:true,data:event});}
 catch(e){res.status(400).json({success:false,message:"Invalid event ID"});}
});
router.post("/events",isAuthenticated,isAdmin,eventValidation,async(req,res,next)=>{
 const errors=validationResult(req);if(!errors.isEmpty())return res.status(400).json({success:false,errors:errors.array()});
 try{
  const event=await Event.create({title:req.body.title,description:req.body.description,date:new Date(req.body.date),venue:req.body.venue,category:req.body.category,capacity:Number(req.body.capacity),registrationFee:Number(req.body.registrationFee)});
  res.status(201).json({success:true,message:"Event created successfully",data:event});
 }catch(e){next(e);}
});
router.put("/events/:id",isAuthenticated,isAdmin,eventValidation,async(req,res,next)=>{
 const errors=validationResult(req);if(!errors.isEmpty())return res.status(400).json({success:false,errors:errors.array()});
 try{
  const event=await Event.findByIdAndUpdate(req.params.id,{title:req.body.title,description:req.body.description,date:new Date(req.body.date),venue:req.body.venue,category:req.body.category,capacity:Number(req.body.capacity),registrationFee:Number(req.body.registrationFee)},{new:true,runValidators:true});
  if(!event)return res.status(404).json({success:false,message:"Event not found"});
  res.json({success:true,message:"Event updated successfully",data:event});
 }catch(e){next(e);}
});
router.delete("/events/:id",isAuthenticated,isAdmin,async(req,res,next)=>{
 try{
  const event=await Event.findById(req.params.id);if(!event)return res.status(404).json({success:false,message:"Event not found"});
  await Registration.deleteMany({event:event._id});await Event.findByIdAndDelete(event._id);
  res.json({success:true,message:"Event deleted successfully"});
 }catch(e){next(e);}
});

router.get("/registrations",isAuthenticated,isAdmin,async(req,res,next)=>{
 try{const registrations=await Registration.find().populate("user","name email").populate("event");res.json({success:true,count:registrations.length,data:registrations});}catch(e){next(e);}
});

router.post("/registrations",isAuthenticated,[
 body("eventId").isMongoId().withMessage("Invalid event ID"),
 body("attendeeName").trim().isLength({min:2,max:60}).withMessage("Invalid attendee name"),
 body("attendeeEmail").trim().isEmail().withMessage("Invalid attendee email").normalizeEmail(),
 body("attendeeMobile").trim().matches(/^[6-9][0-9]{9}$/).withMessage("Invalid mobile number"),
 body("attendeeAge").isInt({min:10,max:100}).withMessage("Invalid age")
],async(req,res,next)=>{
 const errors=validationResult(req);if(!errors.isEmpty())return res.status(400).json({success:false,errors:errors.array()});
 try{
  const event=await Event.findById(req.body.eventId);if(!event)return res.status(404).json({success:false,message:"Event not found"});
  const existing=await Registration.findOne({user:req.session.user.id,event:event._id});
  if(existing&&existing.status!=="Cancelled")return res.status(409).json({success:false,message:"Already registered for this event"});
  const count=await Registration.countDocuments({event:event._id,status:{$ne:"Cancelled"}});
  if(count>=event.capacity)return res.status(409).json({success:false,message:"Event capacity is full"});
  const data={attendeeName:req.body.attendeeName,attendeeEmail:req.body.attendeeEmail,attendeeMobile:req.body.attendeeMobile,attendeeAge:Number(req.body.attendeeAge)};
  let registration;
  if(existing){Object.assign(existing,data,{status:"Registered"});registration=await existing.save();}
  else registration=await Registration.create({user:req.session.user.id,event:event._id,...data});
  res.status(201).json({success:true,message:"Registration successful",data:registration});
 }catch(e){next(e);}
});

router.get("/registrations/:id",isAuthenticated,async(req,res,next)=>{
 try{
  const query={_id:req.params.id};if(req.session.user.role!=="admin")query.user=req.session.user.id;
  const r=await Registration.findOne(query).populate("user","name email").populate("event");
  if(!r)return res.status(404).json({success:false,message:"Registration not found"});
  res.json({success:true,data:r});
 }catch(e){res.status(400).json({success:false,message:"Invalid registration ID"});}
});

router.delete("/registrations/:id",isAuthenticated,async(req,res,next)=>{
 try{
  const query={_id:req.params.id};if(req.session.user.role!=="admin")query.user=req.session.user.id;
  const r=await Registration.findOne(query);if(!r)return res.status(404).json({success:false,message:"Registration not found"});
  r.status="Cancelled";await r.save();res.json({success:true,message:"Registration cancelled"});
 }catch(e){res.status(400).json({success:false,message:"Invalid registration ID"});}
});
module.exports=router;