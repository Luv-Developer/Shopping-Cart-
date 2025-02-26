const express = require("express")
const app = express()
const PORT = 3000
const path = require("path")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const connection = require("./config/connection")
const usermodel = require("./models/user")
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set("view engine","ejs")
app.use(express.static(path.join(__dirname,"public")))
app.use(cookieParser())
//Routing 
app.get("/",(req,res)=>{
    res.render("homepage")
})
app.get("/register",(req,res)=>{
    res.render("register")
})
app.post("/register",async(req,res)=>{
    let {username,email,password} = req.body
    let user = await usermodel.findOne({email:email})
    if(user){
        res.redirect("/login")
    }
    else{
        let saltround = await bcrypt.genSalt(10)
        let hashedpassword = await bcrypt.hash(password,saltround)
        let user = await usermodel.create({
            username:username,
            email:email,
            password:hashedpassword
        })
        let token = jwt.sign({email:email},"hehe")
        res.cookie("token",token)
        res.redirect("/login")
    }
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.post("/login",async(req,res)=>{
    let {email,password} = req.body
    let user = await usermodel.findOne({email:email})
    if(!user){
        res.redirect("/register")
    }
    else{
        await bcrypt.compare(password,user.password,(err,result)=>{
            if(result){
                let token = jwt.sign({email},"hehe")
                res.cookie("token",token)
                res.redirect("/")
            }
            else{
                res.redirect("/login")
            }
        })
    }
})
function isloggedin(req,res,next){
    if(req.cookies.token == ""){
        res.redirect("/login")
        next()
    }
    else{
        let data = jwt.verify(req.cookies.token,"hehe")
        req.user = data
        next()
    }
}
app.get("/bill",isloggedin,async(req,res)=>{
    let user = await usermodel.findOne({email:req.user.email})
    res.render("bill",{user})
})
app.listen(PORT,()=>{
    console.log(`App is listening at ${PORT}`)
})