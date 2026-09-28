const mongoose=require("mongoose");
const eventSchema=new mongoose.Schema({
 title:{type:String,required:true,trim:true,minlength:3,maxlength:120},
 description:{type:String,required:true,trim:true,maxlength:1000},
 date:{type:Date,required:true},
 venue:{type:String,required:true,trim:true},
 category:{type:String,required:true,trim:true},
 capacity:{type:Number,required:true,min:1},
 registrationFee:{type:Number,required:true,min:0}
},{timestamps:true});
module.exports=mongoose.model("Event",eventSchema);