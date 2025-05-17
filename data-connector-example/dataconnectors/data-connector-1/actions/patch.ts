import { DataConnectorAction, DataConnectorPatchAction } from "lucid-extension-sdk/dataconnector/actions/action";
import { updateFolder } from "../clients/lucidapiclient";
import { isFolderPatch } from "../collections/folders";

// Define an interface for our custom patch payload
interface CustomPatchPayload {
  folderId?: string;
  updates?: {
    name?: string;
    parent?: number;
  };
  message?: string;
}

export const patchAction = async (action: DataConnectorAction | DataConnectorPatchAction) => {
  // Check if this is a direct action with custom payload
  if ('data' in action && action.data) {
    console.log("Received custom patch payload:", action.data);
    const payload = action.data as CustomPatchPayload;

    // Handle the custom payload format
    if (payload.folderId && payload.updates) {
      try {
        // Log the exact payload we received
        console.log('Received payload:', JSON.stringify(payload, null, 2));

        // Check if name is defined
        if (!payload.updates.name) {
          console.error('Name is undefined in the updates payload');
          return { success: false, error: 'Name is undefined in updates' };
        }

        console.log(`Updating folder ${payload.folderId} with name: ${payload.updates.name}`);
        const result = await updateFolder(
          action.context.userCredential,
          Number.parseInt(payload.folderId),
          payload.updates.name,
          payload.updates.parent
        );
        console.log("Update result:", result);
        return { success: true, result };
      } catch (error) {
        console.error("Error updating folder:", error);
        return { success: false, error };
      }
    }

    // If it's just a message action (like the old format), return success
    if (payload.message === "UpdateFolders") {
      console.log("Received UpdateFolders message, but no specific updates");
      return { success: true };
    }

    return { success: false, error: "Invalid payload format" };
  }

  // Handle standard patch actions from the collection
  const patchAction = action as DataConnectorPatchAction;
  const patchActions = patchAction.patches.map(async (patch) => {
    console.log("Patch initiated");
    const updates = Object.entries(patch.itemsChanged);
    const promises = updates.map(async (update) => {
      const [primaryKey, fieldValues] = update;
      if (isFolderPatch(fieldValues)) {
        return await updateFolder(
          patchAction.context.userCredential,
          Number.parseInt(primaryKey),
          fieldValues["name"] ?? undefined,
          fieldValues.parent ?? undefined,
        );
      } else {
        console.log("Malformed patch recieved", fieldValues);
        return undefined;
      }
    });
    await Promise.all(promises);
    return patch.getChange();
  });
  return await Promise.all(patchActions);
};
