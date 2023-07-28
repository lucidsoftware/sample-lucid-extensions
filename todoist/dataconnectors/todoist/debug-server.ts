import * as crypto from 'crypto';
import * as express from 'express';
import {DataConnectorClient} from 'lucid-extension-sdk';
import {makeDataConnector} from './index';

const dataConnector = makeDataConnector(new DataConnectorClient({crypto, Buffer}), "http://localhost:3001?kind=action&name=");
dataConnector.runDebugServer({express});
