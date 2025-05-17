import { Box, Point } from "lucid-extension-sdk";
import { BLOCK_SIZES, FolderNode } from "./constants";

// Calculate positions for all folders in the hierarchy
export function calculateFolderPositions(nodes: FolderNode[], startPoint: Point): Map<string, Box> {
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
