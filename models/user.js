// const Sequelize=require('sequelize')
// const sequelize=require('../util/dbms')
// const express=require('express')
// const router=express.Router()

// let table={}
// router.post('/',async(req,res)=>
// {
//     try{
//     const tablename=req.body.tablename
//     const fields= req.body.fields

//     table.id = {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true,
//         unique: true,
//       };

//     fields.forEach(field=>{
//         table[field.fieldname]={
//             type: Sequelize[field.fieldtype],
//             allowNull: field.allownull,            
//             unique: field.unique, 
//         }   
//         console.log("this is table>>>>>>>>",table)    
//     }); 
//     const User=sequelize.define(tablename,table)
//     await User.sync();
//       console.log("model is created")      
//         }
//         catch(err){
//             console.log("error ccoured while creating models",err)
//         }    
//     });

// module.exports=router