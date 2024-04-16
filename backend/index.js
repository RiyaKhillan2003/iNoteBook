const express = require('express');
const connectToMongo= require('./db');
connectToMongo();
var cors = require('cors');

require("dotenv").config();

const app=express();
const port=process.env.PORTB;

app.use(cors());
app.use(express.json());

//Available routes

app.use('/api/auth', require('./routes/auth'));
app.use('/api/notes', require('./routes/notes'));

app.get('/',(req,res) => {
    res.send('HELLO WORLD')
})

app.listen(port, ()=> {
    console.log(`iNoteBook app listening at http://localhost:${port}`)
})
