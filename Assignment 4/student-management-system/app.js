const express=require('express');const mongoose=require('mongoose');const session=require('express-session');const helmet=require('helmet');const path=require('path');require('dotenv').config();
const authRoutes=require('./routes/auth');const studentRoutes=require('./routes/students');const apiRoutes=require('./routes/api');const app=express();const PORT=process.env.PORT||3000;
app.use(helmet());app.use(express.urlencoded({extended:true}));app.use(express.json());app.use(express.static(path.join(__dirname,'public')));app.set('view engine','ejs');app.set('views',path.join(__dirname,'views'));
app.use(session({secret:process.env.SESSION_SECRET||'secret-key',resave:false,saveUninitialized:false,cookie:{httpOnly:true,maxAge:1000*60*60}}));
app.use('/',authRoutes);app.use('/students',studentRoutes);app.use('/api',apiRoutes);
app.get('/',(req,res)=>req.session.user?res.redirect('/students/dashboard'):res.redirect('/login'));
app.use((req,res)=>res.status(404).render('error',{status:404,message:'Page not found'}));
app.use((err,req,res,next)=>res.status(err.status||500).render('error',{status:err.status||500,message:err.message||'Internal Server Error'}));
mongoose.connect(process.env.MONGODB_URI).then(()=>app.listen(PORT,()=>console.log(`Server running at http://localhost:${PORT}`))).catch(e=>console.error('MongoDB connection failed:',e.message));
