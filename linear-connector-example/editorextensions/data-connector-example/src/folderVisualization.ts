import { SerializedLucidDateObject } from "lucid-extension-sdk";
import { DATA_SOURCE_NAME, Folder, FOLDERS_COLLECTION_NAME, FolderNode, createFolderNode } from "./constants";
import { client, dataProxy } from "./core";
import { drawFolderHierarchy } from "./folderDrawing";

// Visualize folders from the data source
export async function visualizeFolders() {
  try {
    // Get the folders collection
    const dataSource = dataProxy.dataSources.find(
      (ds) => ds.getName() === DATA_SOURCE_NAME
    );
    if (!dataSource) {
      client.alert("No data source found. Please import folders first.");
      return;
    }

    const collection = dataSource.collections.find(
      (col) => col.getName() === FOLDERS_COLLECTION_NAME
    );
    if (!collection) {
      client.alert("No folders found. Please import folders first.");
      return;
    }

    // Get all folders
    const folders: Folder[] = [];

    console.log("Collection found:", collection.getName());
    console.log("Collection items count:", collection.items.size);

    // Convert the MapProxy to an array of entries
    const keys = Array.from(collection.items.keys());
    console.log("Collection keys:", keys);

    const items = keys.map(key => {
      const dataItem = collection.items.get(key);
      return { key, dataItem };
    });

    // Process each item
    for (const { key, dataItem } of items) {
      if (dataItem) {
        console.log(`Processing item with key ${key}:`, dataItem);

        // Extract folder data from the dataItem
        const fields = dataItem.fields;
        console.log("Fields:", fields);

        // Create a proper Folder object
        const folder: Folder = {
          id: Number(fields.get("id")),
          type: String(fields.get("type")),
          name: String(fields.get("name")),
          parent: fields.get("parent") !== undefined && fields.get("parent") !== null ? Number(fields.get("parent")) : undefined,
          created: fields.get("created") as SerializedLucidDateObject,
          trashed: fields.get("trashed") !== undefined ? fields.get("trashed") as SerializedLucidDateObject : undefined
        };

        console.log("Folder data:", folder);
        folders.push(folder);
      }
    }

    console.log("Total folders found:", folders.length);

    // Build folder hierarchy
    const folderMap = new Map<number, FolderNode>();
    const rootNodes: FolderNode[] = [];

    // First pass: create nodes for all folders
    console.log("Creating folder nodes...");
    folders.forEach(folder => {
      if (folder && folder.id !== undefined) {
        console.log(`Creating node for folder ${folder.id}: ${folder.name}`);
        folderMap.set(folder.id, createFolderNode(folder));
      } else {
        console.error("Invalid folder encountered:", folder);
      }
    });

    // Second pass: build the hierarchy
    console.log("Building folder hierarchy...");
    folders.forEach(folder => {
      if (!folder || folder.id === undefined) {
        console.error("Invalid folder encountered:", folder);
        return;
      }

      const node = folderMap.get(folder.id);
      if (!node) {
        console.error(`Node not found for folder ${folder.id}`);
        return;
      }

      if (folder.parent !== undefined && folderMap.has(folder.parent)) {
        console.log(`Folder ${folder.id} has parent ${folder.parent}`);
        const parentNode = folderMap.get(folder.parent);
        if (parentNode) {
          parentNode.children.push(node);
        }
      } else {
        console.log(`Folder ${folder.id} is a root node`);
        rootNodes.push(node);
      }
    });

    console.log("Root nodes:", rootNodes.length);

    // Draw the folder hierarchy
    await drawFolderHierarchy(rootNodes, collection);
  } catch (error) {
    console.error("Error visualizing folders:", error);
    // More detailed logging
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
    }
    client.alert(`Error visualizing folders: ${error instanceof Error ? error.message : String(error)}. See console for details.`);
  }
}
