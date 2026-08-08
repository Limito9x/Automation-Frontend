import type { ComponentType } from "react";
import type { FieldValues, Path } from "react-hook-form";
import type { ZodTypeAny } from "zod";
import type { BaseFormControlProps } from "@/components/form-controls/type";

export type ExtractConfig<TProps> = Omit<TProps, keyof BaseFormControlProps<any>>

export interface BaseFieldRules {
  required?: boolean;
  requiredMsg?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface, @typescript-eslint/no-empty-object-type
export interface GlobalFieldRegistry {}

export interface FieldBuilderSpec {
  name: string
  label?: string
  description?: string
  isRequired?: boolean
  target: "config" | "rules"
  fieldType: keyof GlobalFieldRegistry
  fieldConfig?: Record<string, any>
}

export interface FieldRegistration {
  type: string
  component: ComponentType<any>
  builderFields?: FieldBuilderSpec[]
  buildSchema?: (rules: any) => ZodTypeAny
}

// eslint-disable-next-line no-var
var _fieldRegistry: Map<string, FieldRegistration> | undefined;

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
  registry.set(registration.type, registration);
}

export function getFieldRegistration(type: string) {
  return getInternalRegistry().get(type);
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
  defaultValue?: GlobalFieldRegistry[TType] extends { defaultValue: infer D } ? D : any
  config?: GlobalFieldRegistry[TType] extends { config: infer C } ? C : any
  rules?: GlobalFieldRegistry[TType] extends { rules: infer R } ? R : any
}