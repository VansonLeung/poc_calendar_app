import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { Router } from './router.js';
import { _APIGenericUseRequestResponse } from './_incl/_APIGenericUseRequestResponse.js';

export const initializeAPIs = ({
    models,
}) => 
{
    const app = express();
    
    // Enable CORS for all origins
    app.use(cors());
    
    // Middleware to parse JSON requests
    app.use(express.static('public'))
    app.use(bodyParser.json());
    app.use(_APIGenericUseRequestResponse.apply());
    app.use(Router.initialize({ app, models }));
    
    return app;
}

