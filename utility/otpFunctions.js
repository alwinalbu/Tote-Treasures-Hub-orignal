const nodemailer=require('nodemailer')
const flash=require('express-flash')
const OTP=require('../models/otpSchema')

//generate otp

module.exports={
    generateOTP:()=>{
        return `${Math.floor(1000+Math.random()*9000)}`;
    },

    // sendOTP: async(req,res,Email,otpToBeSent)=>{
    //     try{
    //         const transporter=nodemailer.createTransport({
    //             port:465,
    //             service:'Gmail',
    //             auth:{
    //                 user:"totetreasureshub@gmail.com",
    //                 pass:"ceyv ctlk khzq tkrg"
    //             },
    //             secure:true,
    //         });
            

    //         // otp sechema creating and how much time it should be valid 
    //         const duration=60;
    //         const newOTP=new OTP({
    //             Email:Email,
    //             otp:otpToBeSent,
    //             createdAt:Date.now(),
    //             expiresAt:Date.now()+duration*1000,
    //         });

    //         /// otp is saving 
    //         const createdOTPRecord=await newOTP.save();
    //         console.log(createdOTPRecord);

    //         //mail data 

    //         const message="Enter This OTP to Continue For The Verification";
    //         const mailData={
    //             from:"totetreasureshub@gmail.com",
    //             to:Email,
    //             subject:"OTP FROM TOTE TREASURES HUB",
    //             html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration} seconds </b>.</p>`,
    //         }

    //        // sending maildata

    //        transporter.sendMail(mailData,(error,info)=>{
    //         if(error){
    //             return console.log(error);
    //         }
    //         console.log("Successfully send otp");
    //        });

    //        // to the page after success
    //        req.flash("success", "OTP Successfully ");
    //        res.redirect("/emailVerification");
 
    //     }catch(error){
    //         console.error(error);
    //         req.flash("error","Error in Sending OTP");
    //         res.redirect("/signup")
    //     }
    // },

    sendOTP: async (req, res, Email, otpToBeSent) => {
        try {
            const transporter = nodemailer.createTransport({
                port: 465,
                service: 'Gmail',
                auth: {
                    user: "totetreasureshub@gmail.com",
                    pass: "ceyv ctlk khzq tkrg"
                },
                secure: true,
            } );
    
            // OTP schema creating and how much time it should be valid
            const duration = 60 * 1000; // 60 seconds
    
            const createdAt = Date.now();
            const expiresAt = createdAt + duration;
    
            const newOTP = new OTP({
                Email: Email,
                otp: otpToBeSent,
                createdAt: createdAt,
                expiresAt: expiresAt, // Set the correct expiration time
            });
    
            // Log important information for debugging
            console.log("Generated OTP:", otpToBeSent);
            console.log("Created At:", createdAt);
            console.log("Expires At:", expiresAt);
    
            // OTP is saving
            const createdOTPRecord = await newOTP.save();
            console.log("Saved OTP Record:", createdOTPRecord);
    
            // creating the Mail data
            const message = "Enter This OTP To Continue For The Verification";
            const mailData = {
                from: "totetreasureshub@gmail.com",
                to: Email,
                subject: "OTP FROM TOTE TREASURES HUB",
                html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in <b>${duration / 1000} seconds</b>.</p>`,
            }
    
            // Sending mail data
            transporter.sendMail(mailData, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log("Successfully send otp");
            });
    
            // Redirect to the page after success
            req.flash("success", "Successfully Send OTP ");
            res.redirect("/emailVerification");
    
        } catch (error) {
            console.error(error);
            req.flash("error", "Error in Sending OTP");
            res.redirect("/signup");
        }
    },
    resendOTP: async (req, res, Email, otpToBeSent) => {
        try {
            const transporter = nodemailer.createTransport({
                port: 465,
                service: 'Gmail',
                auth: {
                    user: "totetreasureshub@gmail.com",
                    pass: "ceyv ctlk khzq tkrg"
                },
                secure: true,
            });
    
            // OTP schema creating and how much time it should be valid
            const duration = 60 * 1000; // 60 seconds
    
            const createdAt = Date.now();
            const expiresAt = createdAt + duration;
    
            const newOTP = new OTP({
                Email: Email,
                otp: otpToBeSent,
                createdAt: createdAt,
                expiresAt: expiresAt, // Set the correct expiration time
            });
    
            // Log important information for debugging
            console.log("Generated OTP:", otpToBeSent);
            console.log("Created At:", createdAt);
            console.log("Expires At:", expiresAt);
    
            // OTP is saving
            const createdOTPRecord = await newOTP.save();
            console.log("Saved OTP Record:", createdOTPRecord);
    
            // Mail data
            const message = "Enter This OTP to Continue For The Verification";
            const mailData = {
                from: "totetreasureshub@gmail.com",
                to: Email,
                subject: "OTP FROM TOTE TREASURES HUB",
                html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration / 1000} seconds</b>.</p>`,
            }
    
            // Sending mail data
            transporter.sendMail(mailData, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log("Successfully send otp");
            });
    
            // Redirect to the page after success
            req.flash("success", "OTP Successfully ");
            res.redirect("/emailVerification");
    
        } catch (error) {
            console.error(error);
            req.flash("error", "Error in Sending OTP");
            res.redirect("/signup");
        }
    }, 
    passwordsendOTP: async (req, res, Email, otpToBeSent) => {
        try {
            const transporter = nodemailer.createTransport({
                port: 465,
                service: 'Gmail',
                auth: {
                    user: "totetreasureshub@gmail.com",
                    pass: "ceyv ctlk khzq tkrg"
                },
                secure: true,
            });
    
            // OTP schema creating and how much time it should be valid
            const duration = 60 * 1000; // 60 seconds
    
            const createdAt = Date.now();
            const expiresAt = createdAt + duration;
    
            const newOTP = new OTP({
                Email: Email,
                otp: otpToBeSent,
                createdAt: createdAt,
                expiresAt: expiresAt, // Set the correct expiration time
            });
    
            // Log important information for debugging
            console.log("Generated OTP:", otpToBeSent);
            console.log("Created At:", createdAt);
            console.log("Expires At:", expiresAt);
    
            // OTP is saving
            const createdOTPRecord = await newOTP.save();
            console.log("Saved OTP Record:", createdOTPRecord);
    
            // Mail data
            const message = "Enter This OTP to Continue For The Verification";
            const mailData = {
                from: "totetreasureshub@gmail.com",
                to: Email,
                subject: "OTP FROM TOTE TREASURES HUB",
                html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration / 1000} seconds</b>.</p>`,
            }
    
            // Sending mail data
            transporter.sendMail(mailData, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log("Successfully send otp");
            });
    
            // Redirect to the page after success
            req.flash("success", "OTP Successfully ");
            res.redirect("/otpVerification");
    
        } catch (error) {
            console.error(error);
            req.flash("error", "Error in Sending OTP");
            res.redirect("/login");
        }
    },
    passwordresendOTP: async (req, res, Email, otpToBeSent) => {
        try {
            const transporter = nodemailer.createTransport({
                port: 465,
                service: 'Gmail',
                auth: {
                    user: "totetreasureshub@gmail.com",
                    pass: "ceyv ctlk khzq tkrg"
                },
                secure: true,
            });

            console.log("Email:", Email);
    
            // OTP schema creating and how much time it should be valid
            const duration = 60 * 1000; // 60 seconds
    
            const createdAt = Date.now();
            const expiresAt = createdAt + duration;
    
            const newOTP = new OTP({
                Email: Email,
                otp: otpToBeSent,
                createdAt: createdAt,
                expiresAt: expiresAt, // Set the correct expiration time
            });
    
            // Log important information for debugging
            console.log("Generated OTP:", otpToBeSent);
            console.log("Created At:", createdAt);
            console.log("Expires At:", expiresAt);
    
            // OTP is saving
            const createdOTPRecord = await newOTP.save();
            console.log("Saved OTP Record:", createdOTPRecord);
    
            // Mail data
            const message = "Enter This OTP to Continue For The Verification";
            const mailData = {
                from: "totetreasureshub@gmail.com",
                to: Email,
                subject: "OTP FROM TOTE TREASURES HUB",
                html: `<p>${message}</p> <p style="color: tomato; font-size: 25px; letter-spacing: 2px;"><b>${otpToBeSent}</b></p><p>This Code <b>expires in ${duration / 1000} seconds</b>.</p>`,
            }
    
            // Sending mail data
            transporter.sendMail(mailData, (error, info) => {
                if (error) {
                    return console.log(error);
                }
                console.log("Successfully send otp");
            });
    
            // Redirect to the page after success
            req.flash("success", "OTP Successfully ");
            res.redirect("/otpVerification");
    
        } catch (error) {
            console.error(error);
            req.flash("error", "Error in Sending OTP");
            res.redirect("/login");
        }
    },
}