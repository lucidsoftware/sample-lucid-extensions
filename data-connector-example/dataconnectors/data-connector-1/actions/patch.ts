import { DataConnectorPatchAction } from "lucid-extension-sdk/dataconnector/actions/action";
import { updateFolder } from "../clients/lucidapiclient";
import { isFolderPatch } from "../collections/folders";

export const patchAction = async (action: DataConnectorPatchAction) => {
  const patchActions = action.patches.map(async (patch) => {
    console.log("Patch initiated");
    const updates = Object.entries(patch.itemsChanged);
    const promises = updates.map(async (update) => {
      const [primaryKey, fieldValues] = update;
      if (isFolderPatch(fieldValues)) {
        return await updateFolder(
          action.context.userCredential,
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
