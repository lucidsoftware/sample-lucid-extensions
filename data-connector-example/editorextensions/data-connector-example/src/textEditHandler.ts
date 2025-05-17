import { client, dataProxy, viewport } from "./core";
import { DATA_SOURCE_NAME, FOLDERS_COLLECTION_NAME } from "./constants";

// Hook text edit events to update folder names in the data source
export function setupTextEditHook() {
  // The second parameter 'true' means we want to receive the text after the edit is complete
  // This ensures we get the new text value, not the old one
  viewport.hookTextEdit((item, textAreaName, text) => {
    console.log('Text edit hook called with parameters:');
    console.log('  Item:', item);
    console.log('  Text area name:', textAreaName);
    console.log('  Text:', text);
    // Process edits to any text area in the folder shape
    console.log(`Text edit detected for textarea ${textAreaName}, text: ${text}`);

    // The text parameter contains the new text that the user entered
    // We need to use this value directly, as it's the new value after the edit
    let actualText = text;

    // If the text is a template reference, we need to handle it differently
    if (text && text.includes('{{lcsz:')) {
      console.log('Warning: Received template reference instead of actual text');
      // In this case, we'll try to extract a meaningful value from the template
      // But this is a fallback - ideally we should be getting the actual text
      try {
        // Try to extract a meaningful part from the template string
        const match = text.match(/{{lcsz:([^}]+)}}/);
        if (match && match[1]) {
          // Use the part inside the template as a fallback
          actualText = match[1].replace('t_0_', '');
          console.log(`Extracted text from template: ${actualText}`);
        } else {
          // If we can't extract anything, use a default value
          actualText = 'Edited Folder';
          console.log(`Using default text: ${actualText}`);
        }
      } catch (error) {
        console.error('Error handling template text:', error);
        actualText = 'Edited Folder';
      }
    } else {
      console.log(`Using direct text input: ${actualText}`);
    }

    // Make sure actualText is not the text area name or empty
    if (actualText === textAreaName || !actualText || actualText.trim() === '') {
      console.warn(`Warning: actualText equals textAreaName (${textAreaName}) or is empty, using default value`);
      actualText = 'Edited Folder';
    }

    // Log the final text value we'll be using
    console.log(`Final text value to be used: "${actualText}"`);

    // Sanity check - if the text is 'folderName', something is wrong
    if (actualText === 'folderName') {
      console.error('ERROR: Text value is "folderName", which is likely incorrect. Using default value.');
      actualText = 'Edited Folder';
    }

    // Check if it's a folder-related text area
    if ((textAreaName === 'folderName' || textAreaName.includes('folder') || textAreaName.includes('name') || textAreaName.includes('Name')) && actualText) {
      try {
        // Get the folder ID from the shape data
        const folderId = item.shapeData.get('folderId');
        console.log(`Text edit detected for textarea ${textAreaName}, text: ${actualText}, folderId: ${folderId}`);

        if (folderId && typeof folderId === 'string') {
          // This is the key part: we return a callback function that will be called
          // after the text edit is complete, with the final text value
          console.log(`Setting up callback for folder ${folderId} with text: ${actualText}`);
          return async () => {
            console.log(`Callback executing for folder ${folderId} with text: ${actualText}`);
            try {
              // Find the data source and collection
              const dataSource = dataProxy.dataSources.find(
                (ds) => ds.getName() === DATA_SOURCE_NAME
              );

              if (dataSource) {
                const collection = dataSource.collections.find(
                  (col) => col.getName() === FOLDERS_COLLECTION_NAME
                );

                if (collection) {
                  // Check if the item exists in the collection
                  const dataItem = collection.items.get(folderId);
                  if (dataItem) {
                    console.log('Found data item with ID:', folderId);
                    console.log('Current fields before update:', dataItem.fields);

                    // Log the current fields
                    console.log('Current field values:');
                    // We need to use a different approach since entries() is not available
                    const fieldKeys = Array.from(dataItem.fields.keys());
                    fieldKeys.forEach(key => {
                      const value = dataItem.fields.get(key);
                      console.log(`  ${key}: ${value}`);
                    });

                    // Also update using patchItems for good measure
                    try {
                      // Create a map for the changed items
                      const changedItems = new Map<string, Record<string, any>>();

                      // Create an object with the field we want to update
                      // Only use lowercase 'name' as that's what's defined in the schema
                      // Capture the current value to ensure it's not lost in closures
                      const folderNameForCollection = actualText;
                      console.log(`Using text for collection update: ${folderNameForCollection}`);

                      const updates: Record<string, any> = {
                        name: folderNameForCollection
                      };

                      changedItems.set(folderId, updates);
                      console.log('Patch updates:', updates);

                      const result = collection.patchItems({
                        changed: changedItems
                      });
                      console.log('Called patchItems on collection, result:', result);

                      // Verify the update worked
                      const updatedItem = collection.items.get(folderId);
                      if (updatedItem) {
                        console.log('Updated fields after patch:', updatedItem.fields);
                      }

                      // Trigger a data action to update the actual folders
                      try {
                        console.log('Triggering data action to update folders...');
                        // Create a proper patch payload with the folder ID and name
                        // Capture the current value of actualText to ensure it's not lost in the closure
                        const folderNameToUpdate = actualText;
                        console.log(`Creating patch payload with folder name: ${folderNameToUpdate}`);

                        const patchPayload = {
                          folderId: folderId,
                          updates: {
                            name: folderNameToUpdate
                          }
                        };

                        client.performDataAction({
                          dataConnectorName: "data-connector-1",
                          actionName: "Patch",
                          actionData: patchPayload,
                          asynchronous: true,
                        }).then(result => {
                          console.log('Data action result:', result);
                        }).catch(actionError => {
                          console.error('Error in data action:', actionError);
                        });
                      } catch (actionError) {
                        console.error('Error triggering data action:', actionError);
                      }
                    } catch (patchError) {
                      console.error('Error in patchItems:', patchError);
                    }

                    // Update all shapes that represent this folder
                    const page = viewport.getCurrentPage();
                    if (page) {
                      for (const [blockId, block] of page.blocks) {
                        try {
                          // Check if this block has the same folderId
                          const blockFolderId = block.shapeData.get('folderId');
                          if (blockFolderId === folderId) {
                            console.log(`Found shape for folder ${folderId}, updating reference`);

                            // Refresh the shape's data reference
                            block.setReferenceKey("ShapeData", {
                              collectionId: collection.id,
                              primaryKey: folderId,
                              readonly: false // Keep it editable
                            });

                            // Try to directly set the text in the text area
                            try {
                              console.log('Attempting to directly set text in folderName text area');
                              if (block.textAreas) {
                                // Capture the current value to ensure it's not lost in closures
                                const folderNameForTextArea = actualText || text || 'Folder';
                                console.log(`Setting text area value to: ${folderNameForTextArea}`);
                                block.textAreas.set('folderName', folderNameForTextArea);
                                console.log(`Successfully set text in folderName text area: ${actualText}`);
                              }
                            } catch (textError) {
                              console.error('Error setting text directly:', textError);
                            }
                          }
                        } catch (error) {
                          // Skip blocks that don't have shape data or can't be accessed
                          console.log('Error checking block:', error);
                        }
                      }
                    }
                  } else {
                    console.error('Data item not found in collection');
                  }
                } else {
                  console.error('Collection not found');
                }
              } else {
                console.error('Data source not found');
              }

              return true; // Indicate success
            } catch (error) {
              console.error('Error in text edit callback:', error);
              return false;
            }
          };
        } else {
          console.log('No folder ID found in shape data or ID is not a string');
        }
      } catch (error) {
        console.error('Error handling text edit:', error);
      }
    }
    return true; // Allow the edit to proceed
  }, true); // true means we want to receive the text after the edit is complete
}
