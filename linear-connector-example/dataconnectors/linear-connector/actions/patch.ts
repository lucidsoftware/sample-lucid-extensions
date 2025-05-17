import { DataConnectorAction, DataConnectorPatchAction } from "lucid-extension-sdk/dataconnector/actions/action";
import { updateIssue } from "../clients/linearclient";
import { isIssuePatch } from "../collections/issues";

// Define an interface for our custom patch payload
interface CustomPatchPayload {
  issueId?: string;
  updates?: {
    title?: string;
    parentId?: string;
  };
  message?: string;
}

export const patchAction = async (action: DataConnectorPatchAction) => {
  // Check if this is a direct action with custom payload
  if ('data' in action && action.data) {
    console.log("Received custom patch payload:", action.data);
    const payload = action.data as CustomPatchPayload;

    if (payload.issueId && payload.updates) {
      const result = await updateIssue(
        action.context.userCredential,
        payload.issueId,
        payload.updates.title,
        payload.updates.parentId,
      );
      console.log("Update successful:", !!result);
      return [];
    }
    console.error("Invalid payload");
    return [];
  }

  // Handle standard patch actions from the collection
  const patchAction = action as DataConnectorPatchAction;
  const patchActions = patchAction.patches.map(async (patch) => {
    console.log("Linear Patch initiated");
    const updates = Object.entries(patch.itemsChanged);
    const promises = updates.map(async (update) => {
      const [primaryKey, fieldValues] = update;
      if (isIssuePatch(fieldValues)) {
        return await updateIssue(
          patchAction.context.userCredential,
          primaryKey,
          fieldValues["title"] ?? undefined,
          fieldValues.parentId ?? undefined,
        );
      } else {
        console.log("Malformed patch received", fieldValues);
        return undefined;
      }
    });
    await Promise.all(promises);
    return patch.getChange();
  });
  return await Promise.all(patchActions);
};
