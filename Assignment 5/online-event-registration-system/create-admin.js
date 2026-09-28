const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");
require("dotenv").config();
const User=require("./models/User");
(async()=>{
 try{
  await mongoose.connect(process.env.MONGODB_URI);
  const email="admin@gmail.com";
  if(await User.findOne({email})){console.log("Admin already exists.");process.exit(0);}
  await User.create({name:"Administrator",email,mobile:"9876543210",age:30,password:await bcrypt.hash("admin123",12),role:"admin"});
  console.log("Admin created: admin@gmail.com / admin123");
  process.exit(0);
 }catch(e){console.error(e);process.exit(1);}
})();