import express from "express"
import connection from "./dbconnection.js"
import nodemailer from "nodemailer"
var router=express.Router()
export default router


router.post("/signup",(req,res)=>{
console.log("SIGNUP API HIT")
const {username,email,password,role}=req.body

const dbQuery="INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)"
const dbValues=[username,email,password,role]
console.log(role,username)
connection.query(dbQuery,dbValues,(err,dbResponse)=>{
    if(err){
         return res.json({message:"DB Error"})
    }
    else{
         return res.json({message:"Registered Succesfully!"})
    }
})
})


router.post("/login",(req,res)=>{

    console.log("LOGIN API HIT")

    const {email,password}=req.body

    const dbQuery="SELECT * FROM users WHERE email=? AND password=?"
    const dbValues=[email,password]

    connection.query(dbQuery,dbValues,(err,dbResponse)=>{

        if(err){
            return res.json({
                success:false,
                message:"DB Error"
            })
        }

        if(dbResponse.length > 0){

            console.log(dbResponse)

            const user = dbResponse[0]

            console.log("Login done")

            return res.json({
                success:true,
                message:"Login Successful!",
                role:user.role,
                userid:user.id
            })

        } 
        else {

            return res.json({
                success:false,
                message:"Invalid Email or Password"
            })
        }

    })
})


router.post("/send-otp", (req, res) => {

    const { email } = req.body

    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    const expiry = new Date(Date.now() + 5 * 60 * 1000) // 5 min

    const updateQuery = `
        UPDATE users 
        SET otp=?, otp_expiry=? 
        WHERE email=?
    `

    connection.query(updateQuery, [otp, expiry, email], (err, result) => {

        if (err) {
            return res.json({ success: false, message: "DB Error" })
        }

        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Email not found" })
        }

        console.log("OTP:", otp)

       return res.json({
    success: true,
    message: "OTP sent successfully",
    otp: otp 
})
    })
})


/*RESET PASSWORD*/
router.put("/reset-password", (req, res) => {

    const { email, otp, password } = req.body

    const query = `
        SELECT * FROM users 
        WHERE email=? AND otp=?
    `

    connection.query(query, [email, otp], (err, results) => {

        if (err) {
            return res.json({ success: false, message: "DB Error" })
        }

        if (results.length === 0) {
            return res.json({ success: false, message: "Invalid OTP" })
        }

        const updatePass = `
            UPDATE users 
            SET password=?, otp=NULL 
            WHERE email=?
        `

        connection.query(updatePass, [password, email], (err2) => {

            if (err2) {
                return res.json({ success: false, message: "Update failed" })
            }

            return res.json({
                success: true,
                message: "Password updated successfully"
            })
        })
    })
})
