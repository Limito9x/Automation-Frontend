import { useState, useMemo } from "react";
import { BaseFormField } from "./BaseFormField";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Popover, PopoverTrigger } from "../ui/popover";
import { Dialog } from "react-aria-components";
import { ScrollArea } from "../ui/scroll-area";
import * as LucideIcons from "lucide-react";
import type { BaseFormControlProps } from "./type";
import type { FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface FormIconPickerProps<T extends FieldValues>
    extends BaseFormControlProps<T> {
    className?: string;
    disabled?: boolean;
}

export function FormIconPicker<T extends FieldValues>({
    className,
    disabled,
    ...rest
}: FormIconPickerProps<T>) {
    const { t } = useTranslation("common");
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState("");

    const iconNames = useMemo(() => {
        return Object.keys(LucideIcons).filter(
            (key) => key !== "createLucideIcon" && key !== "default"
        );
    }, []);

    const filteredIcons = useMemo(() => {
        if (!search) return iconNames.slice(0, 100); // Only show first 100 if no search to avoid lag
        return iconNames
            .filter((name) => name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 100);
    }, [iconNames, search]);

    return (
        <BaseFormField
            {...rest}
            render={(field) => {
                const CurrentIcon = field.value ? (LucideIcons as any)[field.value] : null;

                return (
                    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
                        <Button
                            variant="outline"
                            className={cn("w-full justify-start text-left font-normal", className)}
                            isDisabled={disabled}
                        >
                            {CurrentIcon ? (
                                <>
                                    <CurrentIcon className="mr-2 h-4 w-4" />
                                    {field.value}
                                </>
                            ) : (
                                <span className="text-muted-foreground">
                                    {t("selectIcon", { defaultValue: "Select an icon..." })}
                                </span>
                            )}
                        </Button>
                        <Popover className="w-[300px] p-0" placement="bottom start">
                            <Dialog className="outline-none">
                                <div className="p-2 border-b">
                                    <Input
                                        placeholder={t("searchIcon", { defaultValue: "Search icons..." })}
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="h-8"
                                    />
                                </div>
                                <ScrollArea className="h-[300px] p-2">
                                    <div className="grid grid-cols-5 gap-2">
                                        {filteredIcons.map((name) => {
                                            const Icon = (LucideIcons as any)[name];
                                            if (!Icon) return null;
                                            return (
                                                <Button
                                                    key={name}
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "h-10 w-10",
                                                        field.value === name && "bg-accent text-accent-foreground"
                                                    )}
                                                    onClick={() => {
                                                        field.onChange(name);
                                                        setOpen(false);
                                                    }}

                                                >
                                                    <Icon className="h-5 w-5" />
                                                </Button>
                                            );
                                        })}
                                    </div>
                                    {filteredIcons.length === 0 && (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            {t("noIconsFound", { defaultValue: "No icons found." })}
                                        </div>
                                    )}
                                </ScrollArea>
                            </Dialog>
                        </Popover>
                    </PopoverTrigger>
                );
            }}
        />
    );
}
