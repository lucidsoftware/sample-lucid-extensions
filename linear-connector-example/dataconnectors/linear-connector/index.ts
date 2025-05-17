import { DataConnector, DataConnectorClient } from "lucid-extension-sdk";
import { importAction } from "./actions/import";
import { patchAction } from "./actions/patch";

export const makeDataConnector = (client: DataConnectorClient) =>
  new DataConnector(client)
    .defineAsynchronousAction("Import", importAction)
    .defineAsynchronousAction("Poll", importAction)
    .defineAsynchronousAction("HardRefresh", importAction)
    .defineAction("Patch", patchAction);
