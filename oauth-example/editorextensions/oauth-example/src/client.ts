import {
  EditorClient,
  objectValidator,
  isString,
  isNumber,
  either,
  isNullish,
  arrayValidator,
} from "lucid-extension-sdk";

export type LucidFolder = {
  id: number;
  type: string;
  name: string;
  created: Date;
  parent?: number;
  trashed?: Date;
};

export const isSerializedFolder = objectValidator({
  id: isNumber,
  type: isString,
  name: isString,
  parent: either(isNumber, isNullish),
  created: isString,
  trashed: either(isString, isNullish),
});

export const isSerializedFolderList = arrayValidator(isSerializedFolder);

export async function getLucidFolders(
  client: EditorClient,
): Promise<LucidFolder[]> {
  const result = await client.oauthXhr("lucid", {
    method: "POST",
    url: "https://api.lucid.co/folders/search",
    headers: {
      "Lucid-Api-Version": "1",
      "Content-Type": "application/json",
    },
    data: JSON.stringify({}),
    responseFormat: "utf8",
  });

  const jsonResponse = JSON.parse(result.responseText);
  if (!isSerializedFolderList(jsonResponse)) {
    console.error("Recieved bad response from Lucid REST API", result);
    return [];
  }

  const deserializedFolders = jsonResponse.map((serializedFolder) => {
    const created = new Date(serializedFolder.created);

    const trashed = serializedFolder.trashed;
    const trashedDate = !!trashed && new Date(trashed);
    return {
      id: serializedFolder.id,
      type: serializedFolder.type,
      name: serializedFolder.name,
      parent: serializedFolder.parent ?? undefined,
      trashed: trashedDate || undefined,
      created,
    };
  });

  return deserializedFolders;
}
