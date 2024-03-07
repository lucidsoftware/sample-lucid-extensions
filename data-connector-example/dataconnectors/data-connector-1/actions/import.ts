import {
  DataConnectorAsynchronousAction,
  SerializedFields,
} from "lucid-extension-sdk";
import {
  ApiFolder,
  convertToFolder,
  folderSchema,
} from "../collections/folders";
import { searchFolders } from "../clients/lucidapiclient";

export const importAction = async (action: DataConnectorAsynchronousAction) => {
  console.log("Import initiated");
  const apiFolders = await searchFolders(action.context.userCredential);
  const itemsPatch = new Map<string, SerializedFields>();
  apiFolders?.forEach((apiFolder) => {
    itemsPatch.set(
      apiFolder.id.toString(),
      convertToFolder(apiFolder as ApiFolder),
    );
  });
  if (apiFolders) {
    action.client
      .update({
        dataSourceName: "Lucid",
        collections: {
          "Lucid Folders": {
            patch: {
              items: itemsPatch,
            },
            schema: folderSchema,
          },
        },
      })
      .catch((error) => {
        console.error(
          "Error encountered when updating Lucid collections",
          error,
        );
      });
  }
  return {
    success: true,
  };
};
