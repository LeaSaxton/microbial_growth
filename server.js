const {response} = require("express"); 
const express = require("express"); 
const app = express(); 
const port = 3000; 
const router = require("./router");


const bodyParser = require ('body-parser');  
app.use(bodyParser.json());

app.listen(port,function(){
    console.log(`Application deployed on port ${port}`);
});



app.use("/api", router);

