import { SchemaDefinition, ScalarFieldTypeEnum } from "lucid-extension-sdk";

export const CarSchema: SchemaDefinition = {
  fields: [
    { name: "id", type: ScalarFieldTypeEnum.STRING },
    { name: "type", type: ScalarFieldTypeEnum.STRING },
    { name: "status", type: ScalarFieldTypeEnum.STRING },
    { name: "make", type: ScalarFieldTypeEnum.STRING },
    { name: "model", type: ScalarFieldTypeEnum.STRING },
    { name: "color", type: ScalarFieldTypeEnum.STRING },
    { name: "lot", type: ScalarFieldTypeEnum.STRING },
    { name: "miles", type: ScalarFieldTypeEnum.NUMBER },
    { name: "manufacturedDate", type: ScalarFieldTypeEnum.DATE },
    { name: "lastServiceDate", type: ScalarFieldTypeEnum.DATE },
    { name: "nextServiceDate", type: ScalarFieldTypeEnum.DATE },
  ],
  primaryKey: ["id"],
  fieldLabels: {
    type: "Type",
    make: "Make",
    model: "Model",
    color: "Color",
    status: "Status",
    lot: "Lot",
    miles: "Miles",
    manufacturedDate: "Manufactured Date",
    lastServiceDate: "Last Service",
    nextServiceDate: "Next Service",
  },
};
