import express from 'express'
import path from 'path'
import indexRouter from './routes/index.js'
import apiRouter from './routes/api.js'
import { fileURLToPath } from 'url';
import mongoose from 'mongoose'
import 'dotenv/config'
import cors from 'cors'

// Init App
const app = express();
const port = 8080;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// cors
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', indexRouter);
app.use('/api', apiRouter);
console.log(process.env);
mongoose.connect(process.env.dbURI)
    .then(() => {
        console.log('Connected to mongo')
    })

app.listen(port, (err) => {
    if(err) {
        console.log(`There was an error while attempting to listen on ${port}`)
    }
    console.log(`Listening on port ${port}...`)
})

