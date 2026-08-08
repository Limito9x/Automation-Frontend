import type { ComponentType } from "react";
import type { FieldValues, Path } from "react-hook-form";
import type { BaseFormControlProps } from "@/components/form-controls/type";

export type ExtractConfig<TProps> = Omit<TProps, keyof BaseFormControlProps<any>>

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface GlobalFieldRegistry {}

export interface FieldRegistration {
  type: string
  component: ComponentType<any>
}

// eslint-disable-next-line no-var
var _fieldRegistry: Map<string, ComponentType<any>> | undefined;

function getInternalRegistry() {
  if (!_fieldRegistry) {
    _fieldRegistry = new Map();
  }
  return _fieldRegistry;
}

export function registerField(registration: FieldRegistration) {
  const registry = getInternalRegistry();
  if (registry.has(registration.type)) {
    console.warn(`Field "${registration.type}" already registered — skipping`);
    return;
  }
  registry.set(registration.type, registration.component);
}

export function getFieldRegistry() {
  return getInternalRegistry();
}

const modules = import.meta.glob('../components/form-controls/Form*.tsx', { eager: true });
if (import.meta.env.DEV) {
  console.log("Registered form controls:", Object.keys(modules));
}

export interface FieldDefinition<
  T extends FieldValues,
  TType extends keyof GlobalFieldRegistry = keyof GlobalFieldRegistry
> {
  name: Path<T>
  label?: string
  description?: string
  type: TType
  config: GlobalFieldRegistry[TType]
}