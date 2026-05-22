import express from "express";
import cors from "cors";
import authRouter from "./auth.js"
import studentRouter from "./student.js"
import tpoRouter from "./tpo.js"

var app=express()
app.use(cors())
app.use(express.json())
app.use('/auth',authRouter)
app.use('/student',studentRouter)
app.use('/tpo',tpoRouter)

console.log("server is running")
app.listen(4000)