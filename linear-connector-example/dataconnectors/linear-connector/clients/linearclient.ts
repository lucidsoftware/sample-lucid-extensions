import axios from "axios";
import { arrayValidator } from "lucid-extension-sdk";
import { ApiIssue, isIssue } from "../collections/issues";

export const isApiIssueList = arrayValidator(isIssue);

// GraphQL query to fetch issues with id, title, and parentId
const ISSUES_QUERY = `
  query {
    issues {
      nodes {
        id
        title
        parent {
          id
        }
      }
    }
  }
`;

// Function to fetch issues from Linear GraphQL API
export const fetchIssues = async (authorizationToken: string) => {
  console.log("Fetching issues from Linear");
  try {
    const result = await axios.post(
      "https://api.linear.app/graphql",
      { query: ISSUES_QUERY },
      {
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (result.data && result.data.data && result.data.data.issues && result.data.data.issues.nodes) {
      const issues: ApiIssue[] = result.data.data.issues.nodes.map((issue: any) => ({
        id: issue.id,
        title: issue.title,
        parentId: issue.parent ? issue.parent.id : undefined,
      }));
      console.log("Successfully retrieved issues from Linear GraphQL API");
      return issues;
    }
    console.error("Error retrieving issues from Linear GraphQL API", result.data);
    return undefined;
  } catch (error) {
    console.error("Error fetching issues from Linear:", error);
    return undefined;
  }
};

// GraphQL mutation to update an issue
const UPDATE_ISSUE_MUTATION = `
  mutation IssueUpdate($id: ID!, $title: String, $parentId: String) {
    issueUpdate(
      id: $id,
      input: {
        title: $title,
        parentId: $parentId
      }
    ) {
      success
      issue {
        id
        title
        parent {
          id
        }
      }
    }
  }
`;

// Function to update an issue in Linear
export const updateIssue = async (
  authorizationToken: string,
  issueId: string,
  title?: string,
  parentId?: string,
) => {
  if (!title && !parentId) {
    console.log("No update to make for issue", issueId);
    return undefined;
  }

  const variables = {
    id: issueId,
    title,
    parentId,
  };

  try {
    const result = await axios.post(
      "https://api.linear.app/graphql",
      {
        query: UPDATE_ISSUE_MUTATION,
        variables,
      },
      {
        headers: {
          Authorization: `Bearer ${authorizationToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (result.data && result.data.data && result.data.data.issueUpdate && result.data.data.issueUpdate.success) {
      const updatedIssue = result.data.data.issueUpdate.issue;
      const apiIssue: ApiIssue = {
        id: updatedIssue.id,
        title: updatedIssue.title,
        parentId: updatedIssue.parent ? updatedIssue.parent.id : undefined,
      };
      console.log("Successfully updated issue through Linear GraphQL API");
      return apiIssue;
    }
    console.error("Error updating issue through Linear GraphQL API", result.data);
    return undefined;
  } catch (error) {
    console.error("Error updating issue in Linear:", error);
    return undefined;
  }
};
