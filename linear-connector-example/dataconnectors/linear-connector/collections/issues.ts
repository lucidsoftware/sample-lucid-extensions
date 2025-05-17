import {
  objectValidator,
  isString,
  SchemaDefinition,
  ScalarFieldTypeEnum,
  FieldConstraintType,
  isNumber,
  either,
  isNullish,
  SerializedLucidDateObject,
  SerializedFields,
} from "lucid-extension-sdk";
import { SemanticFields } from "lucid-extension-sdk/core/data/fieldtypedefinition/semanticfields";

export const isIssue = objectValidator({
  linearId: isString,
  title: isString,
  parentId: either(isString, isNullish),
});

export const isIssuePatch = objectValidator({
  linearId: either(isString, isNullish),
  title: either(isString, isNullish),
  parentId: either(isString, isNullish),
});

export interface ApiIssue {
  id: string;
  title: string;
  parentId?: string;
}

export interface Issue {
  linearId: string;
  title: string;
  parentId?: string;
}

export const convertToIssue = (apiIssue: ApiIssue) => {
  return {
    linearId: apiIssue.id,
    title: apiIssue.title,
    parentId: apiIssue.parentId || null,
  };
};

export const issuesCollectionName = "Linear Issues";

export const issueSchema: SchemaDefinition = {
  fields: [
    {
      name: "linearId",
      type: ScalarFieldTypeEnum.STRING,
      constraints: [{ type: FieldConstraintType.LOCKED }],
    },
    {
      name: "title",
      type: ScalarFieldTypeEnum.STRING,
      mapping: [SemanticFields.Title],
    },
    {
      name: "parentId",
      type: [ScalarFieldTypeEnum.STRING, ScalarFieldTypeEnum.NULL],
      mapping: [SemanticFields.User],
    },
  ],
  primaryKey: ["linearId"],
  fieldLabels: {
    linearId: "Linear ID",
    title: "Title",
    parentId: "Parent Issue",
  },
};
