const Sequelize=require('sequelize')
const sequelize=new Sequelize('dbms','root','sam@123',{
    dialect:'mysql',
    host:'localhost'

})

sequelize.authenticate()
.then(()=>{
    console.log('connected to database successfully')
})
.catch((err)=>{
    console.log('unable to connect to the databade',err)
})

module.exports=sequelize;