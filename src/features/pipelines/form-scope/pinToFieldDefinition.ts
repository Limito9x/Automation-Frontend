import type { PinDefinition } from "@/gen/model";
import type { FieldDefinition } from "@/lib/field-registry";
import {
  normalizePinType,
  type NormalizedPinType,
} from "../hooks/usePinCatalogue";
import { isVariablePin } from "../components/canvas/CustomPipelineNode";

export interface PinFieldRule {
  predicate: (pin: PinDefinition, normType: NormalizedPinType, idLower: string) => boolean;
  create: (
    pin: PinDefinition,
    normType: NormalizedPinType,
    configValues: Record<string, any>
  ) => FieldDefinition<any>;
}

export function resolveEntityTargetFromPin(
  pin: PinDefinition,
  configValues: Record<string, any>
): string {
  if (pin.entityTarget) {
    return pin.entityTarget;
  }

  const idLower = (pin.id || "").toLowerCase();
  const labelLower = (pin.label || "").toLowerCase();

  if (idLower === "entityid" || idLower === "entity" || labelLower === "entity") {
    return configValues["EntityType"] || configValues["entityType"] || "Resource";
  }

  if (pin.metadata) {
    try {
      const parsed = typeof pin.metadata === "string" ? JSON.parse(pin.metadata) : pin.metadata;
      if (parsed.type === "entity-select" && parsed.properties?.entity) {
        return parsed.properties.entity;
      }
      if (parsed.entity) return parsed.entity;
    } catch {}
  }

  if (
    idLower === "contenttype" ||
    idLower === "content_type" ||
    labelLower === "content type" ||
    idLower.includes("contenttype")
  ) {
    return "ContentType";
  }

  return "Resource";
}

export const PIN_RULES: PinFieldRule[] = [
  // 1. Variable Reference pin
  {
    predicate: (pin, _, idLower) =>
      isVariablePin(pin.primitiveType, idLower, pin.entityTarget),
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "pin:variableSelect",
      defaultValue: pin.defaultValue ?? "",
      properties: {
        isRequired: pin.isRequired,
      },
    }),
  },

  // 2. Map Cardinality → Key-Value
  {
    predicate: (pin) => {
      const cardStr = String(pin.cardinality ?? "").toLowerCase();
      return cardStr === "map" || cardStr === "2";
    },
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "key-value",
      defaultValue: pin.defaultValue ?? {},
      properties: {
        isRequired: pin.isRequired,
      },
    }),
  },

  // 3. Array Cardinality (Text[], String[], etc.) → Tags Input
  {
    predicate: (pin, _, idLower) => {
      const cardStr = String(pin.cardinality ?? "").toLowerCase();
      const labelLower = (pin.label || "").toLowerCase();
      return (
        cardStr === "array" ||
        cardStr === "1" ||
        idLower.endsWith("[]") ||
        labelLower.endsWith("[]") ||
        idLower.includes("[]")
      );
    },
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "tags",
      defaultValue: Array.isArray(pin.defaultValue) ? pin.defaultValue : [],
      properties: {
        isRequired: pin.isRequired,
        placeholder: "Type and press Enter to add tag...",
      },
    }),
  },

  // 4. EntityRef → Entity Select
  {
    predicate: (pin, normType, idLower) =>
      normType === "EntityRef" ||
      Boolean(pin.entityTarget) ||
      idLower === "entityid" ||
      idLower === "entity",
    create: (pin, _, configValues) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "pin:entitySelect",
      defaultValue: pin.defaultValue ?? "",
      properties: {
        entityTarget: resolveEntityTargetFromPin(pin, configValues),
        isRequired: pin.isRequired,
      },
    }),
  },

  // 5. Asset → Asset Upload
  {
    predicate: (_, normType, idLower) =>
      normType === "Asset" || idLower.includes("preset"),
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "pin:assetUpload",
      defaultValue: pin.defaultValue ?? "",
      properties: {
        accept: typeof pin.allowedExtensions === "string" ? pin.allowedExtensions : undefined,
        isRequired: pin.isRequired,
      },
    }),
  },

  // 6. Boolean → Switch
  {
    predicate: (_, normType) => normType === "Boolean",
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "switch",
      defaultValue: Boolean(pin.defaultValue),
      properties: {
        isRequired: pin.isRequired,
      },
    }),
  },

  // 7. Number → Number Input
  {
    predicate: (_, normType) => normType === "Number",
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "number",
      defaultValue: pin.defaultValue ?? 0,
      properties: {
        isRequired: pin.isRequired,
      },
    }),
  },

  // 8. Long Text / Code
  {
    predicate: (_, __, idLower) =>
      idLower.includes("json") || idLower.includes("script") || idLower.includes("code"),
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "textarea",
      defaultValue: pin.defaultValue ?? "",
      properties: {
        isRequired: pin.isRequired,
        rows: 4,
      },
    }),
  },

  // 9. Path pin
  {
    predicate: (_, normType) => normType === "Path",
    create: (pin) => ({
      name: pin.id!,
      label: pin.label || pin.id!,
      type: "pin:path",
      defaultValue: pin.defaultValue ?? "",
      properties: {
        isRequired: pin.isRequired,
      },
    }),
  },
];

/**
 * Pure function adapter biến đổi PinDefinition thành FieldDefinition chuẩn của FormRenderer
 */
export function pinToFieldDefinition(
  pin: PinDefinition,
  configValues: Record<string, any>
): FieldDefinition<any> {
  const normType = normalizePinType(pin.primitiveType);
  const idLower = (pin.id || "").toLowerCase();

  const matchedRule = PIN_RULES.find((rule) => rule.predicate(pin, normType, idLower));
  if (matchedRule) {
    return matchedRule.create(pin, normType, configValues);
  }

  // Fallback mặc định: text input
  return {
    name: pin.id!,
    label: pin.label || pin.id!,
    type: "text",
    defaultValue: pin.defaultValue ?? "",
    properties: {
      isRequired: pin.isRequired,
    },
  };
}
