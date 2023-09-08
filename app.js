const express=require('express')
const app=express();
const bodyParser=require('body-parser')
const sequelize=require('./util/dbms')
const User=require('./routes/user')
const Model=require('./models/user')
const path=require('path')
const cors=require('cors');
app.use(cors())
app.use(express.json());
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'public','html')))
app.use(bodyParser.urlencoded({extended:false}))

app.use('/',User)
// app.use('/',Model)


sequelize.sync({alter:true})
.then(()=>{
    
    console.log('database schema updated');
})
.catch((err)=>{
    console.log('error updating database schema:',err)
})

app.listen(3000)