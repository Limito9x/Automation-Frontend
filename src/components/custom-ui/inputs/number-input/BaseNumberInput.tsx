import { NumericFormat, type NumericFormatProps } from 'react-number-format';
import { Input } from '@/components/ui/input';
import React from 'react';
import { cn } from '@/lib/utils';

export interface BaseNumberInputProps extends Omit<NumericFormatProps, 'size' | 'type' | 'onChange'> {
    onChange: (value: number | null) => void
    error?: boolean;
}

export const BaseNumberInput = React.forwardRef<HTMLInputElement, BaseNumberInputProps>(
    ({ className, error, onChange, ...props }, ref) => {
        return (
            <NumericFormat
                {...props}
                getInputRef={ref}
                customInput={Input}
                thousandSeparator=","
                allowNegative={false}
                className={cn(className)}
                onValueChange={(value) => {
                    onChange(value.floatValue ?? null);
                }}
            />
        );
    }
);