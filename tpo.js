import express from "express";
import connection from "./dbconnection.js";

var router = express.Router();

export default router;

router.post("/post-job",(req,res)=>{

    const {

        created_by,
        company,
        jobrole,
        package:jobpackage,
        jobtype,
        location,
        deadline,
        skills,
        eligibility,
        description

    } = req.body


    const dbQuery = `
    
    INSERT INTO jobs
    (
        created_by,
        company_name,
        role,
        package,
        job_type,
        location,
        deadline,
        skills,
        eligibility,
        description
    )

    VALUES(?,?,?,?,?,?,?,?,?,?)

    `


    const dbValues = [

        created_by,
        company,
        jobrole,
        jobpackage,
        jobtype,
        location,
        deadline,
        skills,
        eligibility,
        description

    ]


    connection.query(dbQuery,dbValues,(err,dbResponse)=>{

        if(err){

            console.log(err)

            return res.json({
                success:false,
                message:"Database Error"
            })

        }

       /* GET ALL STUDENTS */

const studentQuery = `
SELECT id FROM users
WHERE role = 'student'
`

connection.query(
    studentQuery,
    (err,students)=>{

        if(err){

            console.log(err)

        }

        students.forEach((student)=>{

            const notificationQuery = `
            
            INSERT INTO notifications
            (user_id,message,type)

            VALUES (?,?,?)

            `

            const message = `
            📢 New Job Posted:
            ${company} - ${jobrole}
            `

            connection.query(
                notificationQuery,
                [
                    student.id,
                    message,
                    "info"
                ]
            )

        })

        return res.json({
            success:true,
            message:"Job Posted Successfully"
        })

    }
)

    })

})

router.get("/get-jobs",(req,res)=>{

    const {
        search,
        location,
        type
    } = req.query

    let dbQuery = `
    
    SELECT * FROM jobs
    WHERE 1=1
    
    `

    let dbValues = []

    /* SEARCH */

    if(search){

        dbQuery += `
        
        AND
        (
            company_name LIKE ?
            OR role LIKE ?
        )
        
        `

        dbValues.push(
            `%${search}%`,
            `%${search}%`
        )

    }

    /* LOCATION FILTER */

    if(location && location !== "All Locations"){

        dbQuery += `
        
        AND location = ?
        
        `

        dbValues.push(location)

    }

    /* TYPE FILTER */

    if(type && type !== "All Type"){

        dbQuery += `
        
        AND job_type = ?
        
        `

        dbValues.push(type)

    }

    connection.query(
        dbQuery,
        dbValues,
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
router.post("/apply-job",(req,res)=>{

    const {student_id,job_id} = req.body

    /* CHECK ALREADY APPLIED */

    const checkQuery = `
    
    SELECT * FROM applications

    WHERE student_id = ?
    AND job_id = ?

    `

    connection.query(
        checkQuery,
        [student_id,job_id],
        (err,result)=>{

            if(err){

                return res.json({
                    success:false,
                    message:"DB Error"
                })

            }

            /* ALREADY APPLIED */

            if(result.length > 0){

                return res.json({
                    success:false,
                    message:"Already Applied"
                })

            }

            /* APPLY */

            const insertQuery = `
            
            INSERT INTO applications
            (student_id,job_id)

            VALUES (?,?)

            `

            connection.query(
                insertQuery,
                [student_id,job_id],
                (err)=>{

                    if(err){

                        return res.json({
                            success:false,
                            message:"Application Failed"
                        })

                    }

                   /* CREATE NOTIFICATION */

const notificationQuery = `

INSERT INTO notifications
(user_id,message,type)

VALUES (?,?,?)

`

const message = `
✅ Applied Successfully for Job ID ${job_id}
`

connection.query(
    notificationQuery,
    [
        student_id,
        message,
        "success"
    ],
    (err)=>{

        if(err){

            console.log(err)

        }

        return res.json({
            success:true,
            message:"Applied Successfully"
        })

    }
)
                }
            )

        }
    )

})

/*UPDATE APPLICATION STATUS*/

router.put("/update-status",(req,res)=>{

    const {

        application_id,
        student_id,
        status,
        company_name

    } = req.body

    /* UPDATE STATUS */

    const updateQuery = `
    
    UPDATE applications
    
    SET status = ?
    
    WHERE id = ?
    
    `

    connection.query(
        updateQuery,
        [status,application_id],
        (err)=>{

            if(err){

                console.log(err)

                return res.json({
                    success:false,
                    message:"Status Update Failed"
                })

            }

            /* NOTIFICATION TYPE */

            let type = "info"

            if(status === "Shortlisted"){

                type = "warning"

            }

            else if(status === "Rejected"){

                type = "danger"

            }

            else if(status === "Selected"){

                type = "success"

            }

            /* MESSAGE */

            let message = ""

            if(status === "Shortlisted"){

                message = `
                🎉 You are shortlisted
                for ${company_name}
                `

            }

            else if(status === "Rejected"){

                message = `
                ❌ Your application for
                ${company_name}
                was rejected
                `

            }

            else if(status === "Selected"){

                message = `
                🏆 Congratulations!
                You are selected in
                ${company_name}
                `

            }

            else{

                message = `
                📢 Application status updated
                to ${status}
                `

            }

            /* INSERT NOTIFICATION */

            const notificationQuery = `
            
            INSERT INTO notifications
            (user_id,message,type)

            VALUES (?,?,?)

            `

            connection.query(
                notificationQuery,
                [
                    student_id,
                    message,
                    type
                ],
                (err)=>{

                    if(err){

                        console.log(err)

                    }

                    return res.json({
                        success:true,
                        message:"Status Updated Successfully"
                    })

                }
            )

        }
    )

})

/*GET ALL STUDENTS*/

router.get("/students",(req,res)=>{

    const dbQuery = `
    
    SELECT *
    
    FROM student_profiles
    
    ORDER BY id DESC
    
    `

    connection.query(
        dbQuery,
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

router.get("/students",(req,res)=>{

    const dbQuery = `
    
    SELECT
        user_id,
        fullname,
        email,
        branch,
        year,
        cgpa,
        resume_link

    FROM student_profiles

    ORDER BY cgpa DESC
    
    `

    connection.query(
        dbQuery,
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


/*GET SINGLE STUDENT*/

router.get(
"/student/:id",
(req,res)=>{

    const userid =
    req.params.id

    const dbQuery = `
    
    SELECT *

    FROM student_profiles

    WHERE user_id = ?
    
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

            if(result.length === 0){

                return res.json({
                    success:false,
                    message:"Student Not Found"
                })

            }

            return res.json({
                success:true,
                data:result[0]
            })

        }
    )

})

/*GET APPLICATIONS*/

router.get(
"/applications",
(req,res)=>{

    const dbQuery = `
    
    SELECT

        applications.id
        AS application_id,

        applications.status,

        users.name
        AS fullname,

        jobs.company_name,

        jobs.role,

        student_profiles.resume_link,

        applications.student_id

    FROM applications

    JOIN jobs

    ON applications.job_id = jobs.id

    JOIN users

    ON applications.student_id = users.id

    LEFT JOIN student_profiles

    ON applications.student_id =
    student_profiles.user_id

    ORDER BY applications.id DESC
    
    `

    connection.query(
        dbQuery,
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

/*UPDATE APPLICATION STATUS*/

router.put(
"/update-application-status",
(req,res)=>{

    const {
        application_id,
        status
    } = req.body

    const updateQuery = `
    
    UPDATE applications

    SET status = ?

    WHERE id = ?
    
    `

    connection.query(
        updateQuery,
        [status,application_id],
        (err)=>{

            if(err){

                return res.json({
                    success:false,
                    message:"Update Failed"
                })

            }

            /* GET STUDENT ID */

            const getStudentQuery = `
            
            SELECT
                student_id

            FROM applications

            WHERE id = ?
            
            `

            connection.query(
                getStudentQuery,
                [application_id],
                (err,result)=>{

                    if(result.length > 0){

                        const studentId =
                        result[0].student_id

                        /* NOTIFICATION */

                        const notificationQuery = `
                        
                        INSERT INTO notifications
                        (
                            user_id,
                            message,
                            type
                        )

                        VALUES (?,?,?)
                        
                        `

                        let message = ""

                        let type = ""

                        if(status === "Shortlisted"){

                            message =
                            "🎉 You are shortlisted for interview"

                            type =
                            "info"

                        }

                        else if(status === "Selected"){

                            message =
                            "✅ Congratulations! You are selected"

                            type =
                            "success"

                        }

                        else if(status === "Rejected"){

                            message =
                            "❌ Your application was rejected"

                            type =
                            "danger"

                        }

                        connection.query(
                            notificationQuery,
                            [
                                studentId,
                                message,
                                type
                            ]
                        )

                    }

                }
            )

            return res.json({
                success:true,
                message:"Status Updated"
            })

        }
    )

})

/*MANAGE JOBS*/

router.get(
"/manage-jobs",
(req,res)=>{

    const dbQuery = `
    
    SELECT * FROM jobs
    
    ORDER BY id DESC
    
    `

    connection.query(
        dbQuery,
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

/*  UPDATE JOB STATUS*/

router.put(
"/update-job-status",
(req,res)=>{

    const {
        job_id,
        status
    } = req.body

    const dbQuery = `
    
    UPDATE jobs

    SET status = ?

    WHERE id = ?
    
    `

    connection.query(
        dbQuery,
        [status,job_id],
        (err)=>{

            if(err){

                return res.json({
                    success:false,
                    message:"Update Failed"
                })

            }

            return res.json({
                success:true,
                message:"Status Updated"
            })

        }
    )

})

/* DELETE JOBS*/

router.delete(
"/delete-job/:id",
(req,res)=>{

    const jobId =
    req.params.id

    const dbQuery = `
    
    DELETE FROM jobs

    WHERE id = ?
    
    `

    connection.query(
        dbQuery,
        [jobId],
        (err)=>{

            if(err){

                return res.json({
                    success:false,
                    message:"Delete Failed"
                })

            }

            return res.json({
                success:true,
                message:"Job Deleted"
            })

        }
    )

})

router.get(
"/manage-jobs",
(req,res)=>{

    const dbQuery = `
    
    SELECT * FROM jobs
    
    ORDER BY id DESC
    
    `

    connection.query(
        dbQuery,
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


router.get(
"/dashboard",
(req,res)=>{

    /* TOTAL JOBS */

    const totalJobsQuery = `
    
    SELECT COUNT(*) AS totalJobs
    
    FROM jobs
    
    `

    /* TOTAL APPLICATIONS */

    const totalApplicationsQuery = `
    
    SELECT COUNT(*) AS totalApplications
    
    FROM applications
    
    `

    /* TOTAL STUDENTS */

    const totalStudentsQuery = `
    
    SELECT COUNT(*) AS totalStudents
    
    FROM users
    
    WHERE role = 'student'
    
    `

    /* TOTAL COMPANIES */

    const totalCompaniesQuery = `
    
    SELECT COUNT(DISTINCT company_name)
    
    AS totalCompanies
    
    FROM jobs
    
    `

    /* RECENT JOBS */

    const recentJobsQuery = `
    
    SELECT *
    
    FROM jobs
    
    ORDER BY id DESC
    
    LIMIT 5
    
    `

/* RECENT ACTIVITIES */

const activityQuery = `

SELECT

    users.name,

    jobs.company_name,

    applications.status

FROM applications

JOIN users

ON applications.student_id = users.id

JOIN jobs

ON applications.job_id = jobs.id

ORDER BY applications.id DESC

LIMIT 5

`
    connection.query(
        totalJobsQuery,
        (err,totalJobsResult)=>{

            if(err){

                return res.json({
                    success:false
                })

            }

            connection.query(
                totalApplicationsQuery,
                (err,totalApplicationsResult)=>{

                    connection.query(
                        totalStudentsQuery,
                        (err,totalStudentsResult)=>{

                            connection.query(
                                totalCompaniesQuery,
                                (err,totalCompaniesResult)=>{

                                    connection.query(
                                        recentJobsQuery,
                                        (err,recentJobsResult)=>{

                                            connection.query(
                                                activityQuery,
                                                (err,activityResult)=>{

                                                    return res.json({

                                                        success:true,

                                                        dashboardData:{

                                                            totalJobs:
                                                            totalJobsResult[0].totalJobs,

                                                            totalApplications:
                                                            totalApplicationsResult[0].totalApplications,

                                                            totalStudents:
                                                            totalStudentsResult[0].totalStudents,

                                                            totalCompanies:
                                                            totalCompaniesResult[0].totalCompanies,

                                                            recentJobs:
                                                            recentJobsResult,

                                                            activities:
                                                            activityResult

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
