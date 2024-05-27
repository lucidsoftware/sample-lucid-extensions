import { SchemaDefinition, ScalarFieldTypeEnum } from "lucid-extension-sdk";

export const LotSchema: SchemaDefinition = {
  fields: [
    { name: "address", type: ScalarFieldTypeEnum.STRING },
    { name: "image", type: ScalarFieldTypeEnum.STRING },
  ],
  primaryKey: ["address"],
  fieldLabels: {
    address: "Address",
    image: "Image",
  },
};
