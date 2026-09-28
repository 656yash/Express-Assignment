const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
 name:{type:String,required:true,trim:true,minlength:2,maxlength:60},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 mobile:{type:String,required:true},
 age:{type:Number,required:true,min:10,max:100},
 password:{type:String,required:true},
 role:{type:String,enum:["user","admin"],default:"user"}
},{timestamps:true});
module.exports=mongoose.model("User",userSchema);