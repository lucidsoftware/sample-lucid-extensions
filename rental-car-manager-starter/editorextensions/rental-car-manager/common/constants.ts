import { SerializedIsoDateObject } from "lucid-extension-sdk/core/data/serializedfield/serializedfields";

export const MAX_MILEAGE = 200 * 1000;
export const DATA_SOURCE_NAME = "Rental Car Manager";
export const CARS_COLLECTION_NAME = "Cars";
export const LOTS_COLLECTION_NAME = "Lots";

export const BLOCK_SIZES = {
  MARGIN: 16,
  LOT_PADDING: 48,
  CAR_HEIGHT: 120,
  CAR_WIDTH: 360,
  LOT_WIDTH: 16 + 360 + 16,
  START_PADDING: 160,
};

export enum Colors {
  Red = "Red",
  White = "White",
  Gray = "Gray",
}

export enum Statuses {
  OnTheLot = "On the lot",
  Rented = "Rented",
  InService = "In service",
}

export interface Car {
  id: string;
  type: string;
  make: string;
  model: string;
  color: string;
  miles: number;
  status: Statuses;
  lot: string;
  manufacturedDate: SerializedIsoDateObject;
  lastServiceDate: SerializedIsoDateObject;
  nextServiceDate: SerializedIsoDateObject;
}

export interface Lot {
  address: string;
  image: string;
}

export interface LotNode {
  lot: Lot;
  cars: Car[];
}

export const convertLotToLotNode: (l: Lot) => LotNode = (lot: Lot) => {
  return {
    lot: lot,
    cars: [],
  };
};
