import mysql from "mysql"

const connection=mysql.createConnection({
    host:"localhost",
    port:3306,
    user:"root",
    database:"placement_portal",
    charset:"utf8mb4",
    password:"lokesh@1976"

})
connection.connect((err)=>{
    if(err){
        console.log("Error :",err)
        console.log("connection failed")
    }
    else{
        console.log("connected successfully")
    }
})

export default connection;