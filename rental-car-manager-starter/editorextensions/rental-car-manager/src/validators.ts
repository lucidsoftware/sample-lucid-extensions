import {
  objectValidator,
  isString,
  isNumber,
  stringEnumValidator,
  isSerializedLucidDateObject,
  arrayValidator,
  isTypedArray,
} from "lucid-extension-sdk";
import { LotNode, Statuses } from "../common/constants";

export const isCar = objectValidator({
  id: isString,
  type: isString,
  make: isString,
  model: isString,
  color: isString,
  miles: isNumber,
  status: stringEnumValidator(Statuses),
  lot: isString,
  manufacturedDate: isSerializedLucidDateObject,
  lastServiceDate: isSerializedLucidDateObject,
  nextServiceDate: isSerializedLucidDateObject,
});

export const isCarArray = arrayValidator(isCar);

export const isLot = objectValidator({
  address: isString,
  image: isString,
});

export const isLotArray = arrayValidator(isLot);

export const isLotNode = objectValidator({
  lot: isLot,
  cars: arrayValidator(isCar),
});

export function isLotNodeArray(value: unknown): value is LotNode[] {
  return isTypedArray(isLotNode)(value);
}
