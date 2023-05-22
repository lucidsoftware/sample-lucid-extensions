import {DataConnectorClient} from "lucid-extension-sdk/dataconnector/dataconnectorclient";
import * as crypto from "crypto";
import * as express from "express";
import {makeDataConnector} from "./index"

const dataConnector = makeDataConnector(new DataConnectorClient({crypto, Buffer}));
dataConnector.runDebugServer({express, port: 3001});