import {
  CollectionProxy,
  DataProxy,
  EditorClient,
  JsonSerializable,
  Modal,
  SchemaDefinition,
  SerializedFieldType,
  isDefAndNotNull,
  isJsonObject,
} from "lucid-extension-sdk";
import { CarSchema } from "../collections/car";
import { LotSchema } from "../collections/lots";
import {
  CARS_COLLECTION_NAME,
  DATA_SOURCE_NAME,
  LOTS_COLLECTION_NAME,
} from "../../common/constants";
import { isCarArray, isLotArray } from "../validators";

export class RentACarModal extends Modal {
  private static icon = "https://lucid.app/favicon.ico";

  constructor(
    client: EditorClient,
    private dataProxy: DataProxy,
  ) {
    super(client, {
      title: "Rental Car Manager",
      url: "angular/index.html",
      width: 800,
      height: 600,
    });
  }

  protected async messageFromFrame(message: JsonSerializable): Promise<void> {
    if (!message || !isJsonObject(message)) {
      return;
    }

    if (isDefAndNotNull(message["cars"])) {
      const cars = message["cars"];
      if (isCarArray(cars)) {
        const collection = this.getOrCreateCarsCollection();
        collection.patchItems({
          added: cars as Record<string, SerializedFieldType>[],
        });
      }
    }

    if (isDefAndNotNull(message["lots"])) {
      const lots = message["lots"];
      if (isLotArray(lots)) {
        const collection = this.getOrCreateLotsCollection();
        collection.patchItems({
          added: lots as Record<string, SerializedFieldType>[],
        });
      }
    }
  }
  private getOrCreateCarsCollection(): CollectionProxy {
    return this.getOrCreateCollection(CARS_COLLECTION_NAME, CarSchema);
  }

  private getOrCreateLotsCollection(): CollectionProxy {
    return this.getOrCreateCollection(LOTS_COLLECTION_NAME, LotSchema);
  }

  private getOrCreateCollection(
    collectionName: string,
    collectionSchema: SchemaDefinition,
  ): CollectionProxy {
    const dataSource = this.getOrCreateDataSource();
    const existingCollection = dataSource.collections.find(
      (collection) => collection.getName() === collectionName,
    );
    if (existingCollection) {
      return existingCollection;
    }
    return dataSource.addCollection(collectionName, collectionSchema);
  }

  private getOrCreateDataSource() {
    const existingDataSource = this.dataProxy.dataSources.find(
      (dataSource) => dataSource.getName() === DATA_SOURCE_NAME,
    );
    if (existingDataSource) {
      return existingDataSource;
    }
    return this.dataProxy.addDataSource(DATA_SOURCE_NAME, {});
  }
}
