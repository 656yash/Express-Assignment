const mongoose=require("mongoose");
const schema=new mongoose.Schema({
 user:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
 event:{type:mongoose.Schema.Types.ObjectId,ref:"Event",required:true},
 attendeeName:{type:String,required:true,trim:true},
 attendeeEmail:{type:String,required:true,lowercase:true,trim:true},
 attendeeMobile:{type:String,required:true},
 attendeeAge:{type:Number,required:true,min:10,max:100},
 status:{type:String,enum:["Registered","Confirmed","Cancelled"],default:"Registered"}
},{timestamps:true});
schema.index({user:1,event:1},{unique:true});
module.exports=mongoose.model("Registration",schema);