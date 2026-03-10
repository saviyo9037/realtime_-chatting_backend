const { type } = require("express/lib/response");
const { default: mongoose } = require("mongoose");


const authSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        minlength:3
    },
    email:{
        type:String,
        uniq:true,
        trim:true,
        required:true
        ,
         match:[
   /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
   "Please enter a valid email address"
  ]
    },

    password:{
        type:String,
        required:true,
        min:[8,"minimum numbern  is 8"],
        max:[11, "maximum number is 11"]
    },
 phone:{
 type:String,
 required:[true,"Phone number is required"],
 match:[/^\+[1-9]\d{7,14}$/, "Enter valid international phone number"]
},
role:{
    type:String,
    enum:["user","admin","customer"],
    default:"user"
}
},{timestamps:true})


const User=mongoose.model("User",authSchema)
module.exports=User
