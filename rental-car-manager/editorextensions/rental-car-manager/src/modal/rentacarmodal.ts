import {
  BlockDefinition,
  Box,
  CollectionProxy,
  DataProxy,
  DocumentProxy,
  EditorClient,
  JsonSerializable,
  Modal,
  Point,
  SchemaDefinition,
  SerializedFieldType,
  Viewport,
  isDefAndNotNull,
  isJsonObject,
} from "lucid-extension-sdk";
import { CarSchema } from "../collections/car";
import { LotSchema } from "../collections/lots";
import {
  BLOCK_SIZES,
  CARS_COLLECTION_NAME,
  Car,
  DATA_SOURCE_NAME,
  LOTS_COLLECTION_NAME,
  Lot,
  LotNode,
} from "../../common/constants";
import { isCarArray, isLotArray, isLotNodeArray } from "../validators";
import { RuleProxy } from "lucid-extension-sdk/document/documentelement/ruleproxy";
import {
  SERVICE_NEEDED_RULE_NAME,
  serviceNeededRuleDefinition,
} from "../rules/service";
import { CAR_COLOR_RULE_NAME, carColorRuleDefinition } from "../rules/color";
export class RentACarModal extends Modal {
  private static icon = "https://lucid.app/favicon.ico";

  constructor(
    client: EditorClient,
    private dataProxy: DataProxy,
    private documentProxy: DocumentProxy,
    private viewport: Viewport,
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

    const visualizeBody = message["visualize"];
    if (isDefAndNotNull(visualizeBody) && isLotNodeArray(visualizeBody)) {
      await this.visualize(visualizeBody);
      this.hide();
    } else {
      console.error(visualizeBody);
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

  private async visualize(lotNodes: LotNode[]) {
    const carBlockDef = await this.loadBlockClasses();
    if (!carBlockDef) {
      this.client.alert(
        "Make sure you've enabled the Rental Car Manager shape library!",
      );
      return;
    }

    const visibleRect = this.viewport.getVisibleRect();
    const startPoint = {
      x: visibleRect.x + BLOCK_SIZES.START_PADDING,
      y: visibleRect.y + BLOCK_SIZES.START_PADDING,
    };
    const { lotPositions, carPositions } = this.getLotAndCarPositions(
      lotNodes,
      startPoint,
    );

    this.drawLots(lotPositions);
    this.drawCars(carPositions, carBlockDef);
  }

  private async loadBlockClasses() {
    const data = await Promise.all([
      this.client.loadBlockClasses(["ProcessBlock"]),
      this.client.getCustomShapeDefinition("rental-car-manager", "car"),
    ]);
    const [processBlock, carBlock] = data;
    return carBlock;
  }

  private getLotAndCarPositions(
    lotNodes: LotNode[],
    startPoint: Point,
  ): {
    carPositions: Map<Car, Box>;
    lotPositions: Map<Lot, Box>;
  } {
    const lotPositions: Map<Lot, Box> = new Map();
    const carPositions: Map<Car, Box> = new Map();

    const lotY = startPoint.y;
    for (let i = 0; i < lotNodes.length; i++) {
      const lot = lotNodes[i].lot;
      const cars = lotNodes[i].cars;

      const lotX = i * (BLOCK_SIZES.LOT_WIDTH + BLOCK_SIZES.MARGIN);
      const { carPositions: lotCarPositions, bottomY } = this.getCarPositions(
        cars,
        lotX,
        lotY,
      );
      lotCarPositions.forEach((value, key) => carPositions.set(key, value));

      const lotPosition = {
        x: lotX,
        y: lotY,
        w: BLOCK_SIZES.LOT_WIDTH,
        h: bottomY - lotY,
      };
      lotPositions.set(lot, lotPosition);
    }

    return { carPositions, lotPositions };
  }

  private getCarPositions(
    carNodes: Car[],
    lotX: number,
    lotY: number,
  ): {
    carPositions: Map<Car, Box>;
    bottomY: number;
  } {
    const carPositions: Map<Car, Box> = new Map();

    const firstCarY = lotY + BLOCK_SIZES.LOT_PADDING;
    for (let i = 0; i < carNodes.length; i++) {
      const car = carNodes[i];
      const carH = BLOCK_SIZES.CAR_HEIGHT;
      const carX = lotX + BLOCK_SIZES.MARGIN;
      const carY = firstCarY + i * (carH + BLOCK_SIZES.MARGIN);

      const carBB = {
        x: carX,
        y: carY,
        w: BLOCK_SIZES.CAR_WIDTH,
        h: carH,
      };
      carPositions.set(car, carBB);
    }
    const bottomY =
      firstCarY +
      carNodes.length * (BLOCK_SIZES.CAR_HEIGHT + BLOCK_SIZES.MARGIN);

    return { carPositions, bottomY };
  }

  private drawLots(lotBBs: Map<Lot, Box>) {
    const page = this.viewport.getCurrentPage();
    for (const [lot, lotBB] of lotBBs.entries()) {
      const lotBlock = page?.addBlock({
        className: "ProcessBlock",
        boundingBox: lotBB,
      });

      if (lotBlock) {
        lotBlock.textAreas.set("Text", lot.address);
        lotBlock.properties.set("Text_VAlign", "top");
      }
    }
  }

  private getOrCreateConditionalFormattingRules() {
    const rules: RuleProxy[] = [];

    const carColorRule =
      this.documentProxy.rules.find(
        (rule) => rule.getName() === CAR_COLOR_RULE_NAME,
      ) || this.documentProxy.addRule(carColorRuleDefinition);
    if (carColorRule) {
      rules.push(carColorRule);
    }

    const serviceNeededRule =
      this.documentProxy.rules.find(
        (rule) => rule.getName() === SERVICE_NEEDED_RULE_NAME,
      ) || this.documentProxy.addRule(serviceNeededRuleDefinition);
    if (serviceNeededRule) {
      rules.push(serviceNeededRule);
    }

    return rules;
  }

  private drawCars(carBBs: Map<Car, Box>, carBlockDef: BlockDefinition) {
    const page = this.viewport.getCurrentPage();
    const rules = this.getOrCreateConditionalFormattingRules();
    for (const [car, carBB] of carBBs.entries()) {
      const carBlock = page?.addBlock({
        ...carBlockDef,
        boundingBox: carBB,
      });

      if (carBlock) {
        carBlock.setReferenceKey("ShapeData", {
          collectionId: this.getOrCreateCarsCollection().id,
          primaryKey: `"${car.id}"`,
          readonly: true,
        });
        rules.forEach((ruleProxy) => carBlock.applyRule(ruleProxy));
      }
    }
  }
}
