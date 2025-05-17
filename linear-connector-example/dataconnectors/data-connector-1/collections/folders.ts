import {
  objectValidator,
  isString,
  SchemaDefinition,
  ScalarFieldTypeEnum,
  FieldConstraintType,
  isNumber,
  isNumberOrEmptyString,
  either,
  isNullish,
  isSerializedLucidDateObject,
  SerializedLucidDateObject,
} from "lucid-extension-sdk";
import { SemanticFields } from "lucid-extension-sdk/core/data/fieldtypedefinition/semanticfields";

export const isImportFoldersMessage = objectValidator({
  message: isString,
});

export const isFolder = objectValidator({
  id: isNumber,
  type: isString,
  name: isString,
  parent: either(isNumber, isNullish),
  created: isSerializedLucidDateObject,
  trashed: either(isSerializedLucidDateObject, isNullish),
});

export const isFolderPatch = objectValidator({
  name: either(isString, isNullish),
  parent: either(isNumber, isNullish),
});

export interface ApiFolder {
  id: number;
  type: string;
  name: string;
  parent?: number;
  created: string;
  trashed?: string;
}

export interface Folder {
  id: number;
  type: string;
  name: string;
  parent?: number;
  created: SerializedLucidDateObject;
  trashed?: SerializedLucidDateObject;
}

export const convertToFolder = (apiFolder: ApiFolder) => {
  return {
    ...apiFolder,
    created: {
      isoDate: new Date(apiFolder.created).toISOString(),
    },
    trashed: apiFolder.trashed
      ? {
          isoDate: new Date(apiFolder.trashed).toISOString(),
        }
      : undefined,
  };
};

export const foldersCollectionName = "Lucid Folders";

export const folderSchema: SchemaDefinition = {
  fields: [
    {
      name: "id",
      type: ScalarFieldTypeEnum.NUMBER,
      constraints: [{ type: FieldConstraintType.LOCKED }],
    },
    {
      name: "type",
      type: ScalarFieldTypeEnum.STRING,
      constraints: [{ type: FieldConstraintType.LOCKED }],
      mapping: [SemanticFields.IssueType],
    },
    {
      name: "name",
      type: ScalarFieldTypeEnum.STRING,
      mapping: [SemanticFields.Time],
    },
    {
      name: "parent",
      type: [ScalarFieldTypeEnum.NUMBER, ScalarFieldTypeEnum.NULL],
      mapping: [SemanticFields.User],
    },
    {
      name: "created",
      type: ScalarFieldTypeEnum.DATE,
      mapping: [SemanticFields.Time],
    },
    {
      name: "trashed",
      type: [ScalarFieldTypeEnum.DATE, ScalarFieldTypeEnum.NULL],
      mapping: [SemanticFields.EndTime],
    },
  ],
  primaryKey: ["id"],
  fieldLabels: {
    id: "Id",
    type: "Type",
    name: "Name",
    parent: "Parent Folder",
    created: "Date Created",
    trashed: "Date Trashed",
  },
};
