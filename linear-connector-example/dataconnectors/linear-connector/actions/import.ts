import {
  DataConnectorAsynchronousAction,
  SerializedFields,
} from "lucid-extension-sdk";
import {
  ApiIssue,
  convertToIssue,
  issueSchema,
  issuesCollectionName,
} from "../collections/issues";
import { fetchIssues } from "../clients/linearclient";

export const importAction = async (action: DataConnectorAsynchronousAction) => {
  console.log("Linear Import initiated");

  // Fetch issues from Linear API
  const apiIssues = await fetchIssues(action.context.userCredential);

  // Create a Map to store the issues
  const itemsPatch = new Map<string, SerializedFields>();

  // Add each issue to the Map
  apiIssues?.forEach((apiIssue) => {
    itemsPatch.set(
      apiIssue.id.toString(),
      convertToIssue(apiIssue as ApiIssue),
    );
  });

  // Update the data source
  // Always proceed with the update, even if apiIssues is empty
  action.client
    .update({
        dataSourceName: "Linear Issues",
        collections: {
          [issuesCollectionName]: {
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

  return {
    success: true,
  };
};
