import {
  DataConnectorAsynchronousAction,
  SerializedFields,
} from "lucid-extension-sdk";
import {
  ApiIssue,
  convertToIssue,
  issueSchema,
} from "../collections/issues";
import { fetchIssues } from "../clients/linearclient";

export const importAction = async (action: DataConnectorAsynchronousAction) => {
  console.log("Linear Import initiated");
  const apiIssues = await fetchIssues(action.context.userCredential);
  const itemsPatch = new Map<string, SerializedFields>();
  
  apiIssues?.forEach((apiIssue) => {
    itemsPatch.set(
      apiIssue.id,
      convertToIssue(apiIssue as ApiIssue),
    );
  });
  
  if (apiIssues) {
    action.client
      .update({
        dataSourceName: "Linear",
        collections: {
          "Linear Issues": {
            patch: {
              items: itemsPatch,
            },
            schema: issueSchema,
          },
        },
      })
      .catch((error) => {
        console.error(
          "Error encountered when updating Linear collections",
          error,
        );
      });
  }
  
  return {
    success: true,
  };
};
