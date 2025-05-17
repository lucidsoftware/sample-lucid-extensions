import { BlockProxy, LineProxy, ItemProxy } from "lucid-extension-sdk";
import { client, dataProxy, viewport } from "./core";
import { DATA_SOURCE_NAME, FOLDERS_COLLECTION_NAME } from "./constants";

// Map to store the original connections of lines before they are dragged
const originalLineConnections = new Map<string, {
  endpoint1: { blockId: string | null, linkX: number, linkY: number },
  endpoint2: { blockId: string | null, linkX: number, linkY: number }
}>();

/**
 * Sets up a hook to monitor selection changes, which we'll use to detect when a line is selected
 * This allows us to capture the original state of the line before it's modified
 */
export function setupLineDragHandler() {
  console.log("Setting up line drag handler");

  // Hook into selection changes to capture the original state of lines when they're selected
  viewport.hookSelection(() => {
    const selectedItems = viewport.getSelectedItems();

    // Look for selected lines
    for (const item of selectedItems) {
      // Check if this is a line by checking if it has getEndpoint1 method
      if ('getEndpoint1' in item) {
        const line = item as LineProxy;
        const lineId = line.id;

        // Store the original connections of the line
        storeOriginalLineConnections(line);
      }
    }
  });

  // Monitor selection changes to detect when lines are modified
  // Since there's no direct hookDocumentChange, we'll use selection changes
  // and check the current page for any modified lines
  viewport.hookSelection(() => {
    const currentPage = viewport.getCurrentPage();
    if (!currentPage) return;

    // Process each line on the page to check for endpoint changes
    for (const [lineId, line] of currentPage.lines) {
      // Skip if we don't have the original connections for this line
      if (!originalLineConnections.has(lineId)) continue;

      const original = originalLineConnections.get(lineId)!;
      const endpoint1 = line.getEndpoint1();
      const endpoint2 = line.getEndpoint2();

      // Check if endpoint1 (tail) has changed
      if (endpoint1?.connection &&
          endpoint1.connection.id !== original.endpoint1.blockId) {
        // The tail of the line has been moved to a different shape
        handleTailDrag(line, endpoint1.connection, original);
      }
      // Check if endpoint2 (pointy end) has changed
      else if (endpoint2?.connection &&
               endpoint2.connection.id !== original.endpoint2.blockId) {
        // The pointy end of the line has been moved - revert this change
        handlePointyEndDrag(line, original);
      }
    }
  });
}

/**
 * Stores the original connections of a line before it's modified
 */
function storeOriginalLineConnections(line: LineProxy) {
  const lineId = line.id;
  const endpoint1 = line.getEndpoint1();
  const endpoint2 = line.getEndpoint2();

  // Get the connection points
  let endpoint1BlockId = null;
  let endpoint1LinkX = 0.5;
  let endpoint1LinkY = 0;

  let endpoint2BlockId = null;
  let endpoint2LinkX = 0.5;
  let endpoint2LinkY = 0;

  if (endpoint1?.connection) {
    endpoint1BlockId = endpoint1.connection.id;
    if ('linkX' in endpoint1) {
      endpoint1LinkX = endpoint1.linkX || 0.5;
    }
    if ('linkY' in endpoint1) {
      endpoint1LinkY = endpoint1.linkY || 0;
    }
  }

  if (endpoint2?.connection) {
    endpoint2BlockId = endpoint2.connection.id;
    if ('linkX' in endpoint2) {
      endpoint2LinkX = endpoint2.linkX || 0.5;
    }
    if ('linkY' in endpoint2) {
      endpoint2LinkY = endpoint2.linkY || 0;
    }
  }

  originalLineConnections.set(lineId, {
    endpoint1: {
      blockId: endpoint1BlockId,
      linkX: endpoint1LinkX,
      linkY: endpoint1LinkY
    },
    endpoint2: {
      blockId: endpoint2BlockId,
      linkX: endpoint2LinkX,
      linkY: endpoint2LinkY
    }
  });

  console.log(`Stored original connections for line ${lineId}:`, originalLineConnections.get(lineId));
}

/**
 * Handles when the tail of a line (endpoint1) is dragged to a different folder shape
 */
async function handleTailDrag(line: LineProxy, newParentBlock: any, original: any) {
  console.log("Handling tail drag");

  // Get the folder IDs from the shapes
  const childBlockId = original.endpoint2.blockId;
  if (!childBlockId) {
    console.log("No child block found, reverting drag");
    revertLineDrag(line, original);
    return;
  }

  const page = line.getPage();
  const childBlock = page.blocks.get(childBlockId);
  if (!childBlock) {
    console.log("Child block not found, reverting drag");
    revertLineDrag(line, original);
    return;
  }

  // Check if both blocks are folder shapes by looking for folderId in shapeData
  const newParentFolderId = newParentBlock.shapeData.get('folderId');
  const childFolderId = childBlock.shapeData.get('folderId');

  if (!newParentFolderId || !childFolderId) {
    console.log("One or both blocks are not folder shapes, reverting drag");
    revertLineDrag(line, original);
    return;
  }

  console.log(`Updating folder ${childFolderId} to have parent ${newParentFolderId}`);

  // Get the data source and collection
  const dataSource = dataProxy.dataSources.find(
    (ds) => ds.getName() === DATA_SOURCE_NAME
  );
  if (!dataSource) {
    console.error("No data source found");
    revertLineDrag(line, original);
    return;
  }

  const collection = dataSource.collections.find(
    (col) => col.getName() === FOLDERS_COLLECTION_NAME
  );
  if (!collection) {
    console.error("No folders collection found");
    revertLineDrag(line, original);
    return;
  }

  try {
    // Convert folder IDs to strings to ensure correct type for collection operations
    const childFolderIdStr = String(childFolderId);
    const newParentFolderIdNum = Number(newParentFolderId);

    // Get the data item for the child folder
    const childDataItem = collection.items.get(childFolderIdStr);
    if (!childDataItem) {
      console.error(`Child folder data item not found for ID ${childFolderIdStr}`);
      revertLineDrag(line, original);
      return;
    }

    // Update the parent field in the data item
    console.log(`Updating folder ${childFolderIdStr} parent field to ${newParentFolderIdNum}`);

    // Create a map of changed items for the patch operation
    const changedItems = new Map<string, Record<string, any>>();
    changedItems.set(childFolderIdStr, {
      parent: newParentFolderIdNum
    });

    // Apply the patch to update the parent
    collection.patchItems({
      changed: changedItems
    });

    console.log(`Successfully updated folder ${childFolderIdStr} parent to ${newParentFolderIdNum}`);

    // Update the original connections to reflect the new state
    original.endpoint1.blockId = newParentBlock.id;

  } catch (error) {
    console.error('Error updating folder parent:', error);
    revertLineDrag(line, original);
  }
}

/**
 * Handles when the pointy end of a line (endpoint2) is dragged - this should be reverted
 */
function handlePointyEndDrag(line: LineProxy, original: any) {
  console.log("Pointy end drag detected, reverting");
  revertLineDrag(line, original);
}

/**
 * Reverts a line drag by restoring its original connections
 */
function revertLineDrag(line: LineProxy, original: any) {
  console.log("Reverting line drag");

  const page = line.getPage();

  // Get the original blocks
  const originalParentBlock = original.endpoint1.blockId ? page.blocks.get(original.endpoint1.blockId) : null;
  const originalChildBlock = original.endpoint2.blockId ? page.blocks.get(original.endpoint2.blockId) : null;

  // Recreate the original connections
  if (originalParentBlock) {
    line.setEndpoint1({
      connection: originalParentBlock,
      linkX: original.endpoint1.linkX,
      linkY: original.endpoint1.linkY
    });
  } else {
    // If there was no original connection, set a free-floating endpoint
    line.setEndpoint1({
      x: 0,
      y: 0
    });
  }

  if (originalChildBlock) {
    line.setEndpoint2({
      connection: originalChildBlock,
      linkX: original.endpoint2.linkX,
      linkY: original.endpoint2.linkY
    });
  } else {
    // If there was no original connection, set a free-floating endpoint
    line.setEndpoint2({
      x: 0,
      y: 0
    });
  }
}
