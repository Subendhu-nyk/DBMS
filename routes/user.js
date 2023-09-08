const express=require('express')
const router=express.Router()
const multer = require('multer');
const XLSX = require('xlsx');
const path=require('path')
const cors=require('cors');
const sequelize=require('../util/dbms')
const pool = require('../util/dbms-pool');
const Sequelize=require('sequelize')
router.use(cors())
router.use(express.json());
router.use(express.static(path.join(__dirname,'public')))
router.use(express.static(path.join(__dirname,'public','html')))

router.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'..','dashboard.html'))
})

// let table={}
let tableModels = {}; 
router.post('/',async(req,res,next)=>
{
    try{
    const tablename=req.body.tablename
    const fields= req.body.fields
    let tableSchema = {};

    tableSchema.id = {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true,
      };

    fields.forEach(field=>{
        tableSchema[field.fieldname]={
            type: Sequelize[field.fieldtype],
            allowNull: field.allownull,            
            unique: field.unique, 
        }   
          
    }); 

    const model = sequelize.define(tablename, tableSchema);
    tableModels[tablename] = model;

    console.log("Stored model:", tableModels);
    await model.sync();
    res.status(200).json({ message: 'Table created successfully' });
    next()
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Error in table creation' });
}
});
console.log("table details >>>>>>>>>>>",tableModels)


router.get('/all-tables', async (req, res) => {
    try {
              
        // Show Table is a predefined sql statement used to get all table names
      const tableresults = await sequelize.query('SHOW TABLES');
      console.log(tableresults[0])
      results = tableresults[0];
      const allTableNames = [];
      console.log(allTableNames,results)
      results.forEach(row => {
        allTableNames.push(Object.values(row)[0]);
      });
      console.log("alltablenames>>>>>>>",allTableNames)      
      res.status(200).json({ Message:"All tablenames",allTableNames:allTableNames });
    } catch (err) {
        console.error("Actual error:", err);
      res.status(500).json({ message: 'An error occurred',err });
    }
  });  
  


  router.get('/table-attributes/:tableName', async (req, res) => {
    try {
      
      const tableName = req.params.tableName;
      // DESCRIBE is a SQL statement,which is used to get the table structure or attributes
      const attributes = await sequelize.query(`DESCRIBE ${tableName}`);
      console.log("attributes>>>>>>>>>>>>>>>>>>>>",attributes[0])
      const attributeNames = [];
  
      for (let i = 0; i < attributes[0].length; i++) {
        attributeNames.push(attributes[0][i].Field);
      }
  
      res.status(200).json({ Message: "All attributes", attributeNames });
    } catch (err) {
      console.error("Actual error:", err);
      res.status(500).json({ message: 'An error occurred' });
    }
  });

  router.post('/insert-data/:tablename', async (req, res) => {
    console.log("Available models:", tableModels);
    try {
      const tablename = req.params.tablename;
      const dataObject=req.body.formData;

      let dataArray = [];
      const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

const columns = Object.keys(dataObject).concat(['createdAt', 'updatedAt']).join(', ');
const dataValues = Object.values(dataObject)
for (let i = 0; i < dataValues.length; i++) {
  dataArray.push(`'${dataValues[i]}'`);
}

// Add the timestamps for 'createdAt' and 'updatedAt'
dataArray.push(`'${currentTimestamp}'`, `'${currentTimestamp}'`);
const values = dataArray.join(', ');

const insertQuery = `INSERT INTO ${tablename} (${columns}) VALUES (${values})`;
      
      // Execute the raw SQL insert query using the database connection pool
      await pool.query(insertQuery);  
  
     
      res.status(200).json({ Message: "All data successfully inserted in the database",insertedRcord:insertQuery });
    } catch (err) {
      console.error("Actual error:", err);
      res.status(500).json({ message: 'An error occurred while database insertion' });
    }
  });

router.get('/get-data/:tablename',async(req,res)=>{
  try {
    const tablename = req.params.tablename;
    console.log('backend table:>>>>>>>>>>>>>>>>>>>>>>>>>>>', tablename)

    const query = `SELECT * FROM ${tablename}`;
    const [results] = await pool.query(query);
    res.status(200).json({ message: 'Data fetched successfully', allTableRecords: results });
  }
  catch(err){
    console.log("error in getting data",err)
    res.status(500).json({ message: 'An error occurred while fetching data' });
  }

})

router.delete('/delete-data/:tablename/:id', async (req, res) => {
  const id = req.params.id;
  const tablename=req.params.tablename
  try {
      const deleteQuery = `DELETE FROM ${tablename} WHERE id = ?`;
      await pool.query(deleteQuery, [id]);
      res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
      console.error("Error in deleting record:", err);
      res.status(500).json({ message: 'An error occurred while deleting the record' });
  }
});

router.delete('/delete-table-row/:tablename', async (req, res) => {

  const tablename=req.params.tablename
  try {
      const deleteQuery = `TRUNCATE TABLE ??`;
      await pool.query(deleteQuery,[tablename]);
      res.status(200).json({ message: 'Record deleted successfully' });
  } catch (err) {
      console.error("Error in deleting record:", err);
      res.status(500).json({ message: 'An error occurred while deleting the record' });
  }
});

router.delete('/delete-table/:tablename', async (req, res) => {

  const tablename=req.params.tablename
  try {
      const deleteQuery = `DROP TABLE ??`;
      await pool.query(deleteQuery,[tablename]);
      res.status(200).json({ message: 'Table deleted successfully' });
  } catch (err) {
      console.error("Error in deleting record:", err);
      res.status(500).json({ message: 'An error occurred while deleting the Table' });
  }
});




router.post('/create-column/:tablename', async (req, res) => {

  let tablename=req.params.tablename
  console.log("tablename param>>>>>>>>>>",tablename)
  let columnName=req.body.columnName
  console.log('columnName>>>>>',columnName)
  let columnType=req.body.columnType
  console.log('columnType>>>>>',columnType)
  let allowNull=req.body.allowNull
  let unique=req.body.unique

  if (columnType==='STRING')
{
  columnType='VARCHAR(255)'
}

  try {
    const addColumnQuery = `
    ALTER TABLE ?? 
    ADD COLUMN ?? ${columnType}${allowNull ? ' NULL' : ' NOT NULL'}${unique ? ' UNIQUE' : ''}
  `;

  // Execute the query
  await pool.query(addColumnQuery, [tablename, columnName]);
      res.status(200).json({ message: 'Table deleted successfully' });
  } catch (err) {
      console.error("Error in deleting record:", err);
      res.status(500).json({ message: 'An error occurred while deleting the Table' });
  }
});

const upload=multer({storage:multer.memoryStorage()})

router.post('/filesent',upload.single('file'),async(req,res)=>{
  if(!req.file){
    return res.status(400).json({message:"no file uploaded"})
  }

  const fileBuffer=req.file.buffer;
  console.log('Uploaded:', fileBuffer);

  const workbook=XLSX.read(fileBuffer,{type:'buffer'})
  const sheetNames=workbook.SheetNames
  console.log("SheetNAme:",sheetNames[0])
  const firstSheet = workbook.Sheets[sheetNames[0]];
  const jsonData = XLSX.utils.sheet_to_json(firstSheet);
  console.log('Excel Data:', jsonData);

  const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
  const keys = rawData[0];
  const firstRowData = rawData[1];
// Determine the data types of the first row's values
  const dataTypes = firstRowData.map(value => typeof value);
// Associate keys with their inferred data types
  console.log("dataTypes:",dataTypes)
  // res.status(200).json({ message: 'File uploaded successfully!',file:jsonData });

  try{
    const tablename=req.body.filetablename   
    console.log("tablename>>>>>>>>",tablename) 
    let tableSchema = {};

    tableSchema.id = {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
        unique: true,
      };

    keys.forEach(keys=>{
        tableSchema[keys]={
            type: Sequelize.STRING,           
        }   
          
    }); 

    const model = sequelize.define(tablename, tableSchema);
    tableModels[tablename] = model;

    console.log("Stored model:", model);
    await model.sync();
    res.status(200).json({ message: 'Table created successfully' });
    
} catch (err) {
  console.error(err);
  res.status(500).json({ message: 'Error in table creation' });
}
})






module.exports=router
