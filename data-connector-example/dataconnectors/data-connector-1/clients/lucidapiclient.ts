import axios from "axios";
import {
  objectValidator,
  isString,
  isNumber,
  either,
  isNullish,
  arrayValidator,
} from "lucid-extension-sdk";

export enum FolderType {
  "folder",
  "team",
}

export const isApiFolder = objectValidator({
  id: isNumber,
  type: isString,
  name: isString,
  parent: either(isNumber, isNullish),
  created: isString,
  trashed: either(isString, isNullish),
});

export const isApiFolderList = arrayValidator(isApiFolder);

export const searchFolders = async (
  authorizationToken: string,
  type?: FolderType,
  keywords?: string,
) => {
  console.log("searching");
  const searchOptions = {
    type,
    keywords,
  };
  const result = await axios.post(
    "https://api.lucid.co/folders/search",
    JSON.stringify(searchOptions),
    {
      headers: {
        "Lucid-Api-Version": "1",
        Authorization: `Bearer ${authorizationToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  const folders = result.data;
  if (isApiFolderList(folders)) {
    console.log("Successfully retrieved folders from Lucid REST API");
    return folders;
  }
  console.error("Error retrieving folders from Lucid REST API", result.data);
  return undefined;
};

export const updateFolder = async (
  authorizationToken: string,
  folderId: number,
  name?: string,
  parent?: number,
) => {
  if (!name && !parent) {
    console.log("No update to make for folder", folderId);
    return undefined;
  }
  const updateOptions = {
    name,
    parent,
  };
  const result = await axios.patch(
    `https://api.lucid.co/folders/${folderId.toString()}`,
    JSON.stringify(updateOptions),
    {
      headers: {
        "Lucid-Api-Version": "1",
        Authorization: `Bearer ${authorizationToken}`,
        "Content-Type": "application/json",
      },
    },
  );
  const folder = result.data;
  if (isApiFolder(folder)) {
    console.log("Successfully updated folder through Lucid REST API");
    return folder;
  }
  console.error("Error updating folder through Lucid REST API", result.data);
  return undefined;
};
