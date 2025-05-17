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

export const convertToIssue = (apiIssue: ApiIssue): any => {
  return {
    ...apiIssue,
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
};
