import {
  ConditionType,
  ConditionCombination,
  RuleFormattingType,
  DataGraphicIconSets,
  HorizontalBadgePos,
  VerticalBadgePos,
  BadgeLayerPos,
  BadgeResponsiveness,
} from "lucid-extension-sdk";
import { RuleDefinition } from "lucid-extension-sdk/document/ruledefinition";

export const serviceNeededRuleDefinition: RuleDefinition = {
  name: "Service needed icon",
  effects: [
    {
      conditions: [
        {
          type: ConditionType.Formula,
          formula: `DAYSAGO(@"Next Service") > 0`,
        },
      ],
      combination: ConditionCombination.AND,
      formatType: RuleFormattingType.DATA_GRAPHICS,
      dataGraphic: {
        set: DataGraphicIconSets.STATUS_ICONS,
        index: 1,
        color: "#e81313",
        position: {
          horizontalPos: HorizontalBadgePos.RIGHT,
          verticalPos: VerticalBadgePos.CENTER,
          layer: BadgeLayerPos.INSIDE,
          responsive: BadgeResponsiveness.STACK,
        },
      },
      tooltip: "Service overdue!",
    },
    {
      conditions: [
        {
          type: ConditionType.Formula,
          formula: `DATEDIFF("days", NOW(), @"Next Service") < 60`,
        },
      ],
      combination: ConditionCombination.AND,
      formatType: RuleFormattingType.DATA_GRAPHICS,
      dataGraphic: {
        set: DataGraphicIconSets.STATUS_ICONS,
        index: 1,
        color: "#f2ba00",
        position: {
          horizontalPos: HorizontalBadgePos.RIGHT,
          verticalPos: VerticalBadgePos.CENTER,
          layer: BadgeLayerPos.INSIDE,
          responsive: BadgeResponsiveness.STACK,
        },
      },
      tooltip: "Service soon! Due in the next 60 days.",
    },
  ],
};

export const SERVICE_NEEDED_RULE_NAME = "Service needed icon";
