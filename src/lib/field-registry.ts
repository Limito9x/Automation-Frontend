import { FormInput, FormApiCombobox, FormNumberInput, FormSelect, FormDatePicker, FormDateRange } from "@/components/form-controls";
import type { FormInputProps, FormApiComboboxProps, FormSelectProps, FormNumberInputProps, FormDatePickerProps, FormDateRangeProps } from "@/components/form-controls";
import type { BaseFormControlProps } from "@/components/form-controls/type";
import type { ComponentType } from "react";
import type { FieldValues, Path } from "react-hook-form";

type ExtractConfig<TProps> = Omit<TProps, keyof BaseFormControlProps<any>>

export interface FieldConfigMap {
  text: ExtractConfig<FormInputProps<any>>
  select: ExtractConfig<FormSelectProps<any>>
  combobox: ExtractConfig<FormApiComboboxProps<any, any>>
  number: ExtractConfig<FormNumberInputProps<any>>
  date: ExtractConfig<FormDatePickerProps<any>>
  dateRange: ExtractConfig<FormDateRangeProps<any>>
}

export const fieldRegistry: { [K in keyof FieldConfigMap]: ComponentType<any> } = {
  text: FormInput,
  select: FormSelect,
  combobox: FormApiCombobox,
  number: FormNumberInput,
  date: FormDatePicker,
  dateRange: FormDateRange,
};

export interface FieldDefinition
  <T extends FieldValues,
  TType extends keyof FieldConfigMap = keyof FieldConfigMap
> {
  name: Path<T>
  label?: string
  description?: string
  type: TType
  config: FieldConfigMap[TType]
}