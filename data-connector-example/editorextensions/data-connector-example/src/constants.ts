import { SerializedLucidDateObject } from "lucid-extension-sdk";

export const DATA_SOURCE_NAME = "Lucid";
export const FOLDERS_COLLECTION_NAME = "Lucid Folders";

export const BLOCK_SIZES = {
  MARGIN: 20,
  FOLDER_HEIGHT: 120,  // Increased height for better readability
  FOLDER_WIDTH: 220,   // Increased width for better readability
  LEVEL_PADDING: 300,  // Increased horizontal spacing between levels
  VERTICAL_PADDING: 80, // Reduced vertical spacing for more compact layout
  START_PADDING: 100,
};

export interface Folder {
  id: number;
  type: string;
  name: string;
  parent?: number;
  created: SerializedLucidDateObject;
  trashed?: SerializedLucidDateObject;
}

export interface FolderNode {
  folder: Folder;
  children: FolderNode[];
}

export const createFolderNode = (folder: Folder): FolderNode => {
  return {
    folder,
    children: [],
  };
};
