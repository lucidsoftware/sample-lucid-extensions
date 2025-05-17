import { CollectionProxy } from "lucid-extension-sdk";
import { BLOCK_SIZES, FolderNode } from "./constants";
import { client, viewport } from "./core";
import { calculateFolderPositions } from "./folderPositionCalculation";

// Draw the folder hierarchy on the canvas
export async function drawFolderHierarchy(rootNodes: FolderNode[], collection: CollectionProxy) {
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

  // Delete all existing lines in the canvas
  console.log("Deleting all existing lines before drawing new connections...");

  // Store line IDs to avoid modification during iteration
  const lineIds: string[] = [];
  for (const [lineId, _] of page.lines) {
    lineIds.push(lineId);
  }
  console.log(`Found ${lineIds.length} lines to delete`);

  // Delete each line by ID
  for (const lineId of lineIds) {
    try {
      console.log(`Attempting to delete line ${lineId}...`);
      const line = page.lines.get(lineId);
      if (line) {
        line.delete();
        console.log(`Successfully deleted line ${lineId}`);
      } else {
        console.log(`Line ${lineId} no longer exists, skipping`);
      }
    } catch (error) {
      console.error(`Error deleting line ${lineId}:`, error);
    }
  }

  // Verify all lines were deleted
  let remainingLineCount = 0;
  for (const [_, __] of page.lines) {
    remainingLineCount++;
  }
  console.log(`After deletion, ${remainingLineCount} lines remain`);

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
        // Link the shape to the data - make sure it's editable
        folderBlock.setReferenceKey("ShapeData", {
          collectionId: collection.id,
          primaryKey: folderId.toString(),
          readonly: false // Set to false to allow editing
        });
        console.log(`Linked folder ${folderId} to data`);

        // Store the folder ID directly in the shape data
        folderBlock.shapeData.set('folderId', folderId.toString());
        console.log(`Stored folder ID ${folderId} in shape data`);

        // Find the folder node to get the folder name
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
        if (folderNode && folderNode.folder) {
          // Try to set the folder name in the text area
          try {
            console.log(`Setting text for folderName text area to: ${folderNode.folder.name}`);
            folderBlock.textAreas.set('folderName', folderNode.folder.name);
          } catch (error) {
            console.error('Error setting folder name in text area:', error);
          }

          // Also update the data item in the collection to ensure it's properly linked
          try {
            const dataItem = collection.items.get(folderId);
            if (dataItem) {
              console.log('Found data item, ensuring name is set correctly');

              // Check if the name field exists and matches
              const currentName = dataItem.fields.get('name');
              if (currentName !== folderNode.folder.name) {
                console.log(`Name mismatch: ${currentName} vs ${folderNode.folder.name}, updating collection`);

                // Update the collection
                const changedItems = new Map<string, Record<string, any>>();
                changedItems.set(folderId, {
                  name: folderNode.folder.name,
                  Name: folderNode.folder.name
                });

                collection.patchItems({
                  changed: changedItems
                });
                console.log('Updated collection with correct folder name');
              }
            }
          } catch (error) {
            console.error('Error updating collection with folder name:', error);
          }
        }

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
