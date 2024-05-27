import {
  ConditionType,
  ShapeDataConditions,
  ConditionCombination,
  RuleFormattingType,
  DataGraphicIconSets,
  HorizontalBadgePos,
  VerticalBadgePos,
  BadgeLayerPos,
  BadgeResponsiveness,
} from "lucid-extension-sdk";
import {
  DataGraphicEffectDefinition,
  RuleDefinition,
} from "lucid-extension-sdk/document/ruledefinition";

const getColorRule: (
  colorValue: string,
  colorHash: string,
) => DataGraphicEffectDefinition = (colorValue: string, colorHash: string) => {
  return {
    conditions: [
      {
        type: ConditionType.ShapeData,
        condition: ShapeDataConditions.Equal,
        value: colorValue,
        field: "Color Name",
      },
    ],
    combination: ConditionCombination.AND,
    formatType: RuleFormattingType.DATA_GRAPHICS,
    dataGraphic: {
      set: DataGraphicIconSets.STOPLIGHTS,
      index: 0,
      color: colorHash,
      position: {
        horizontalPos: HorizontalBadgePos.RIGHT,
        verticalPos: VerticalBadgePos.TOP,
        layer: BadgeLayerPos.INSIDE,
        responsive: BadgeResponsiveness.STACK,
      },
    },
    tooltip: '=@"Color Name"',
  };
};

export const carColorRuleDefinition: RuleDefinition = {
  name: "Car color icon",
  effects: [
    getColorRule("Red", "#e81313"),
    getColorRule("White", "#ffffff"),
    getColorRule("Gray", "#979ea8"),
  ],
};

export const CAR_COLOR_RULE_NAME = "Car color icon";
