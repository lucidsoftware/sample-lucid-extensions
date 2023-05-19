import {DataConnectorClient} from "lucid-extension-sdk";
import {signatureValidatorImportedNode} from "lucid-extension-sdk/dataconnector/signaturevalidator";
import * as crypto from "crypto";
import {makeDataConnector} from "./index"
import * as express from "express";

// Temporary workaround for crypto import issue
signatureValidatorImportedNode.crypto = crypto;

const app = express();

// Set CORS to allow requests from lucid.app
app.use((req: any, res: any, next: () => void) => {
    if (req.headers?.origin?.match(/.lucid.app$/)) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Vary', 'Origin');
        res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.header('Access-Control-Allow-Headers', '*');
    }
    next();
});

const dataConnector = makeDataConnector(new DataConnectorClient());
dataConnector.runDebugServer({express, app, port: 3001});