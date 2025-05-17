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
  id: isString,
  title: isString,
  parentId: either(isString, isNullish),
});

export const isIssuePatch = objectValidator({
  title: either(isString, isNullish),
  parentId: either(isString, isNullish),
});

export interface ApiIssue {
  id: string;
  title: string;
  parentId?: string;
}

export interface Issue {
  id: string;
  title: string;
  parentId?: string;
}

export const convertToIssue = (apiIssue: ApiIssue): SerializedFields => {
  // Create a clean object with only the fields we need
  return {
    id: apiIssue.id,
    title: apiIssue.title,
    parentId: apiIssue.parentId || null,
  };
};

export const issuesCollectionName = "Linear Issues";

export const issueSchema: SchemaDefinition = {
  fields: [
    {
      name: "id",
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
  primaryKey: ["id"],
  fieldLabels: {
    id: "ID",
    title: "Title",
    parentId: "Parent Issue",
  },
};
