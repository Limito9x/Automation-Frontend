import { BaseCombobox, type OptionItem, type BaseComboboxProps } from './BaseCombobox'
import { useState } from 'react'

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type StaticComboboxProps<TValue = unknown> = DistributiveOmit<
    BaseComboboxProps<TValue>,
    'items' | 'onSearch'
> & {
    useOptions: () => { data?: OptionItem<TValue>[]; isLoading: boolean }
    loadingText?: string
}

/**
 * StaticCombobox
 * Component xử lý logic gọi API tự động một lần cho dữ liệu tĩnh, filter phía client.
 * Độc lập hoàn toàn với Form.
 */
export function StaticCombobox<TValue = unknown>({
    useOptions,
    loadingText = 'Loading...',
    emptyText = 'No results found.',
    onValueChange,
    ...rest
}: StaticComboboxProps<TValue>) {
    const [search, setSearch] = useState('');
    const { data, isLoading } = useOptions();

    const options = (data ?? []).filter(item => 
        item.label.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <BaseCombobox
            {...rest as any}
            items={options}
            onValueChange={onValueChange as any}
            onSearch={setSearch}
            emptyText={isLoading ? loadingText : emptyText}
        />
    )
}
