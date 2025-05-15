import { Box, CollectionProxy, DataProxy, DocumentProxy, EditorClient, Menu, MenuType, Point, SerializedLucidDateObject, Viewport } from "lucid-extension-sdk";
import { BLOCK_SIZES, DATA_SOURCE_NAME, Folder, FolderNode, FOLDERS_COLLECTION_NAME, createFolderNode } from "./constants";

const client = new EditorClient();
const menu = new Menu(client);
const dataProxy = new DataProxy(client);
const documentProxy = new DocumentProxy(client);
const viewport = new Viewport(client);

// Log a message when the extension is loaded
console.log("Data Connector Example extension loaded successfully!");
console.log("You can find the 'Get Folder ID' option in both the main menu and the context menu (right-click).");

client.registerAction("import", async () => {
  // Temporary workaround. You must call oauthXhr once before performDataAction will work
  const triggerOauth = await client.oauthXhr("lucid", {
    url: "https://api.lucid.co/folders/search",
    headers: {
      "Lucid-Api-Version": "1",
      "Content-Type": "application/json",
    },
    data: "{}",
    method: "POST",
  });
  const result = await client.performDataAction({
    dataConnectorName: "data-connector-1",
    actionName: "Import",
    actionData: { message: "ImportFolders" },
    asynchronous: true,
  });
  console.log(result);
});

menu.addMenuItem({
  label: "Import",
  action: "import",
  menuType: MenuType.Main,
});

client.registerAction("visualize", async () => {
  await visualizeFolders();
});

menu.addMenuItem({
  label: "Visualize Folders",
  action: "visualize",
  menuType: MenuType.Main,
});

// Add menu item to get folder ID from selected shape - in main menu
menu.addMenuItem({
  label: "Get Folder ID",
  action: "getFolderIdFromShape",
  menuType: MenuType.Main,
});

// Also add to context menu (right-click menu) for easier access
menu.addMenuItem({
  label: "Get Folder ID",
  action: "getFolderIdFromShape",
  menuType: MenuType.Context,
});

async function visualizeFolders() {
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

async function drawFolderHierarchy(rootNodes: FolderNode[], collection: CollectionProxy) {
  console.log("Drawing folder hierarchy with", rootNodes.length, "root nodes");

  // Load the folder shape
  console.log("Attempting to load folder shape...");
  let folderShape;
  try {
    folderShape = await client.getCustomShapeDefinition("data-connector-example", "folder");
    console.log("Folder shape loaded:", folderShape ? "success" : "failed");

    if (!folderShape) {
      client.alert("Make sure you've enabled the Data Connector Example shape library!");
      return;
    }
  } catch (error) {
    console.error("Error loading folder shape:", error);
    client.alert("Error loading folder shape. See console for details.");
    return;
  }

  // Get the visible area to start drawing
  const visibleRect = viewport.getVisibleRect();
  const startPoint = {
    x: visibleRect.x + BLOCK_SIZES.START_PADDING,
    y: visibleRect.y + BLOCK_SIZES.START_PADDING,
  };

  // Calculate positions for all folders
  const folderPositions = calculateFolderPositions(rootNodes, startPoint);

  // Draw the folders
  const page = viewport.getCurrentPage();
  if (!page) return;

  // Create a map to store the blocks by folder ID
  const folderBlocks = new Map<string, any>();

  // First, find any existing shapes that represent folders
  console.log("Looking for existing folder shapes...");
  for (const [blockId, block] of page.blocks) {
    try {
      // Check if this block has a folderId in its shape data
      const folderId = block.shapeData.get('folderId');
      if (folderId) {
        // Convert to string to ensure type safety
        const folderIdStr = String(folderId);
        console.log(`Found existing shape for folder ${folderIdStr}`);
        // Store the existing block reference for later use
        folderBlocks.set(folderIdStr, block);
      }
    } catch (error) {
      // Skip blocks that don't have shape data or can't be accessed
      console.log("Skipping block that doesn't have folder data");
    }
  }

  // Draw each folder that doesn't already have a shape, and store the block references
  console.log(`Processing ${folderPositions.size} folder positions...`);
  for (const [folderId, position] of folderPositions.entries()) {
    // Check if we already have a shape for this folder
    if (folderBlocks.has(folderId)) {
      console.log(`Folder ${folderId} already has a shape, skipping creation`);
      // Optionally update the position of the existing shape
      // Uncomment the following lines if you want to update positions of existing shapes
      // const existingBlock = folderBlocks.get(folderId);
      // existingBlock.setBoundingBox(position);
      continue;
    }

    console.log(`Drawing new shape for folder ${folderId} at position:`, position);

    try {
      const folderBlock = page.addBlock({
        ...folderShape,
        boundingBox: position,
      });

      if (folderBlock) {
        console.log(`Successfully created block for folder ${folderId}`);
        // Link the shape to the data
        folderBlock.setReferenceKey("ShapeData", {
          collectionId: collection.id,
          primaryKey: folderId.toString(),
          readonly: true,
        });
        console.log(`Linked folder ${folderId} to data`);

        // Store the folder ID directly in the shape data
        folderBlock.shapeData.set('folderId', folderId.toString());
        console.log(`Stored folder ID ${folderId} in shape data`);

        // Store the block reference for connection later
        folderBlocks.set(folderId, folderBlock);
      } else {
        console.error(`Failed to create block for folder ${folderId}`);
      }
    } catch (error) {
      console.error(`Error drawing folder ${folderId}:`, error);
    }
  }

  // Draw connections between parent and child folders
  for (const [folderId, position] of folderPositions.entries()) {
    console.log(`Drawing connections for folder ${folderId}`);

    // Get the folder node directly from the rootNodes hierarchy
    // We need to find the node with the matching ID
    const findFolderNode = (nodes: FolderNode[], id: number): FolderNode | undefined => {
      for (const node of nodes) {
        if (node.folder && node.folder.id === id) {
          return node;
        }
        const found = findFolderNode(node.children, id);
        if (found) return found;
      }
      return undefined;
    };

    const folderNode = findFolderNode(rootNodes, Number(folderId));
    if (!folderNode) {
      console.error(`Folder node not found for ID ${folderId}`);
      continue;
    }

    const folder = folderNode.folder;
    if (!folder) {
      console.error(`Folder data not found for node with ID ${folderId}`);
      continue;
    }

    // Check if the folder has a parent and if the parent position exists
    if (folder.parent !== undefined && folder.parent !== null) {
      const parentIdStr = folder.parent.toString();
      console.log(`Folder ${folderId} has parent ${parentIdStr}`);

      // Get the blocks for both parent and child
      const childBlock = folderBlocks.get(folderId);
      const parentBlock = folderBlocks.get(parentIdStr);

      if (childBlock && parentBlock) {
        console.log(`Found blocks for both parent ${parentIdStr} and child ${folderId}`);

        // Draw a line from parent to child with proper connections to the shapes
        try {
          const line = page.addLine({
            endpoint1: {
              connection: parentBlock,
              linkX: 0.5,  // Connect to the middle bottom of the parent
              linkY: 1.0,  // Bottom of the shape
            },
            endpoint2: {
              connection: childBlock,
              linkX: 0.5,  // Connect to the middle top of the child
              linkY: 0.0,  // Top of the shape
            },
          });
          console.log(`Successfully drew connection from folder ${parentIdStr} to ${folderId}`);
        } catch (error) {
          console.error(`Error drawing connection from folder ${parentIdStr} to ${folderId}:`, error);
        }
      } else {
        console.error(`Could not find blocks for parent ${parentIdStr} or child ${folderId}`);
      }
    }
  }
}

function calculateFolderPositions(nodes: FolderNode[], startPoint: Point): Map<string, Box> {
  // Create a new map for folder nodes in this function scope
  const positionFolderMap = new Map<number, FolderNode>();
  const positions = new Map<string, Box>();
  let currentY = startPoint.y;

  // Helper function to recursively calculate positions
  function calculatePositionsRecursive(nodes: FolderNode[], level: number, startY: number): number {
    let y = startY;

    for (const node of nodes) {
      console.log("Processing node:", node);

      // Check if node.folder and node.folder.id are defined
      if (!node.folder || node.folder.id === undefined) {
        console.error("Invalid folder node encountered:", node);
        continue; // Skip this node
      }

      // Store the node in the map for reference
      positionFolderMap.set(node.folder.id, node);

      // Calculate position for this folder
      const x = startPoint.x + level * BLOCK_SIZES.LEVEL_PADDING;
      const position: Box = {
        x,
        y,
        w: BLOCK_SIZES.FOLDER_WIDTH,
        h: BLOCK_SIZES.FOLDER_HEIGHT,
      };

      // Store the position
      const folderId = node.folder.id.toString();
      console.log(`Setting position for folder ${folderId}`);
      positions.set(folderId, position);

      // Move down for the next folder at this level
      y += BLOCK_SIZES.FOLDER_HEIGHT + BLOCK_SIZES.VERTICAL_PADDING;

      // Process children if any
      if (node.children.length > 0) {
        y = calculatePositionsRecursive(node.children, level + 1, y);
      }
    }

    return y;
  }

  calculatePositionsRecursive(nodes, 0, currentY);

  // Return both the positions map and the folder map
  return positions;
}

// Function to get folder ID from a shape
client.registerAction("getFolderIdFromShape", async () => {
  try {
    // Get the selected shape
    const selectedItems = viewport.getSelectedItems();
    if (selectedItems.length === 0) {
      client.alert("Please select a folder shape first.");
      return;
    }

    const selectedItem = selectedItems[0];

    // Get the folder ID from shape data
    const folderId = selectedItem.shapeData.get('folderId');

    if (folderId) {
      console.log(`Found folder ID in shape data: ${folderId}`);
      client.alert(`This shape represents folder ID: ${folderId}`);
    } else {
      console.log("No folder ID found in shape data");
      client.alert("This shape doesn't have a folder ID stored in its shape data.");
    }
  } catch (error) {
    console.error("Error getting folder ID from shape:", error);
    client.alert(`Error getting folder ID: ${error instanceof Error ? error.message : String(error)}`);
  }
});
