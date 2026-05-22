import express from "express";
import connection from "./dbconnection.js";

var router = express.Router();

export default router;


router.post("/add-details",(req,res)=>{

    const {

        user_id,
        fullname,
        email,
        phone,
        branch,
        year,
        cgpa,
        skills,
        projects,
        resume,
        jobrole,
        location

    } = req.body


    const checkQuery = `
    SELECT * FROM student_profiles
    WHERE user_id = ?
    `

    connection.query(checkQuery,[user_id],(err,result)=>{

        if(err){

            return res.json({
                success:false,
                message:"DB Error"
            })

        }

        // UPDATE
        if(result.length > 0){

            const updateQuery = `
            UPDATE student_profiles
            SET
                fullname=?,
                email=?,
                phone=?,
                branch=?,
                year=?,
                cgpa=?,
                skills=?,
                projects=?,
                resume_link=?,
                jobrole=?,
                location=?
            WHERE user_id=?
            `

            const updateValues = [

                fullname,
                email,
                phone,
                branch,
                year,
                cgpa,
                skills,
                projects,
                resume,
                jobrole,
                location,
                user_id

            ]

            connection.query(updateQuery,updateValues,(err)=>{

                if(err){

                    return res.json({
                        success:false,
                        message:"Update Failed"
                    })

                }

                return res.json({
                    success:true,
                    message:"Profile Updated Successfully"
                })

            })

        }

        // INSERT
        else{

            const insertQuery = `
            INSERT INTO student_profiles
            (
                user_id,
                fullname,
                email,
                phone,
                branch,
                year,
                cgpa,
                skills,
                projects,
                resume_link,
                jobrole,
                location
            )

            VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
            `

            const insertValues = [

                user_id,
                fullname,
                email,
                phone,
                branch,
                year,
                cgpa,
                skills,
                projects,
                resume,
                jobrole,
                location

            ]

            connection.query(insertQuery,insertValues,(err)=>{

                if(err){

                    return res.json({
                        success:false,
                        message:"Insert Failed"
                    })

                }

                return res.json({
                    success:true,
                    message:"Profile Saved Successfully"
                })

            })

        }

    })

})

// GET PROFILE

router.get("/profile/:userid",(req,res)=>{

    const userid = req.params.userid

    const dbQuery = `
    SELECT * FROM student_profiles
    WHERE user_id = ?
    `

    connection.query(dbQuery,[userid],(err,dbResponse)=>{

        if(err){

            return res.json({
                success:false,
                message:"DB Error"
            })

        }

        if(dbResponse.length > 0){

            return res.json({
                success:true,
                data:dbResponse[0]
            })

        }

        return res.json({
            success:false,
            message:"Profile Not Found"
        })

    })

})

router.get("/applied-jobs/:studentId",(req,res)=>{

    const studentId = req.params.studentId

    const dbQuery = `

    SELECT 
        jobs.company_name,
        jobs.role,
        applications.applied_at,
        applications.status

    FROM applications

    JOIN jobs

    ON applications.job_id = jobs.id

    WHERE applications.student_id = ?

    `

    connection.query(
        dbQuery,
        [studentId],
        (err,result)=>{

            if(err){

                console.log(err)

                return res.json({
                    success:false,
                    message:"DB Error"
                })

            }

            return res.json(result)

        }
    )

})

router.get("/dashboard/:studentId",(req,res)=>{

    const studentId = req.params.studentId

    /* TOTAL JOBS */

    const totalJobsQuery =
    "SELECT COUNT(*) AS totalJobs FROM jobs"

    /* TOTAL APPLICATIONS */

    const applicationsQuery = `
    
    SELECT COUNT(*) AS totalApplications
    
    FROM applications
    
    WHERE student_id = ?
    
    `

    /* SHORTLISTED */

    const shortlistedQuery = `
    
    SELECT COUNT(*) AS shortlisted
    
    FROM applications
    
    WHERE student_id = ?
    
    AND status = 'Shortlisted'
    
    `

    /* OFFERS */

    const offersQuery = `
    
    SELECT COUNT(*) AS offers
    
    FROM applications
    
    WHERE student_id = ?
    
    AND status = 'Selected'
    
    `

    /* LATEST JOBS */

    const latestJobsQuery = `
    
    SELECT *
    
    FROM jobs
    
    ORDER BY id DESC
    
    LIMIT 5
    
    `

    /* APPLICATION STATUS */

    const applicationStatusQuery = `
    
    SELECT
        jobs.company_name,
        applications.status

    FROM applications

    JOIN jobs

    ON applications.job_id = jobs.id

    WHERE applications.student_id = ?
    
    `

    connection.query(
        totalJobsQuery,
        (err,totalJobsResult)=>{

            if(err){

                return res.json({
                    success:false,
                    message:"DB Error"
                })

            }

            connection.query(
                applicationsQuery,
                [studentId],
                (err,applicationsResult)=>{

                    if(err){

                        return res.json({
                            success:false,
                            message:"DB Error"
                        })

                    }

                    connection.query(
                        shortlistedQuery,
                        [studentId],
                        (err,shortlistedResult)=>{

                            if(err){

                                return res.json({
                                    success:false,
                                    message:"DB Error"
                                })

                            }

                            connection.query(
                                offersQuery,
                                [studentId],
                                (err,offersResult)=>{

                                    if(err){

                                        return res.json({
                                            success:false,
                                            message:"DB Error"
                                        })

                                    }

                                    connection.query(
                                        latestJobsQuery,
                                        (err,latestJobsResult)=>{

                                            if(err){

                                                return res.json({
                                                    success:false,
                                                    message:"DB Error"
                                                })

                                            }

                                            connection.query(
                                                applicationStatusQuery,
                                                [studentId],
                                                (err,statusResult)=>{

                                                    if(err){

                                                        return res.json({
                                                            success:false,
                                                            message:"DB Error"
                                                        })

                                                    }

                                                    return res.json({

                                                        success:true,

                                                        dashboardData:{

                                                            totalJobs:
                                                            totalJobsResult[0].totalJobs,

                                                            totalApplications:
                                                            applicationsResult[0].totalApplications,

                                                            shortlisted:
                                                            shortlistedResult[0].shortlisted,

                                                            offers:
                                                            offersResult[0].offers,

                                                            latestJobs:
                                                            latestJobsResult,

                                                            applicationStatus:
                                                            statusResult

                                                        }

                                                    })

                                                }
                                            )

                                        }
                                    )

                                }
                            )

                        }
                    )

                }
            )

        }
    )

})


router.get("/notifications/:userid",(req,res)=>{

    const userid = req.params.userid

    const dbQuery = `
    
    SELECT *
    
    FROM notifications
    
    WHERE user_id = ?
    
    ORDER BY id DESC
    
    `

    connection.query(
        dbQuery,
        [userid],
        (err,result)=>{

            if(err){

                return res.json({
                    success:false,
                    message:"DB Error"
                })

            }

            return res.json({
                success:true,
                data:result
            })

        }
    )

})


router.get("/notifications/:userid",(req,res)=>{

    const userid = req.params.userid

    const dbQuery = `
    
    SELECT *
    
    FROM notifications
    
    WHERE user_id = ?
    
    ORDER BY id DESC
    
    `

    connection.query(
        dbQuery,
        [userid],
        (err,result)=>{

            if(err){

                console.log(err)

                return res.json({
                    success:false,
                    message:"DB Error"
                })

            }

            return res.json({
                success:true,
                data:result
            })

        }
    )

})
