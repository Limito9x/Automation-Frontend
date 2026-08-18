import { Form, FormGrid, zodResolver, useForm } from "@/components/form";
import { FormInput } from "@/components/form-controls";
import {
    createTagSchema,
    type CreateTagInput,
    type CreateTagOutput,
} from "../schemas/createTagSchema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CreateTagFormProps {
    tagGroupId: string;
    onSubmit: (data: CreateTagOutput) => void;
}

const PRESET_COLORS = [
    "#3b82f6", // Blue
    "#10b981", // Emerald
    "#8b5cf6", // Purple
    "#f59e0b", // Amber
    "#ef4444", // Red
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#64748b", // Slate
];

export function CreateTagForm({ tagGroupId, onSubmit }: CreateTagFormProps) {
    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

    const form = useForm<CreateTagInput, any, CreateTagOutput>({
        resolver: zodResolver(createTagSchema),
        defaultValues: {
            name: "",
            color: selectedColor,
            tagGroupId,
        },
    });

    const handleColorSelect = (color: string) => {
        setSelectedColor(color);
        form.setValue("color", color);
    };

    return (
        <Form form={form} formId="create-tag-form" onSubmit={onSubmit}>
            <FormGrid cols={1}>
                <FormInput
                    control={form.control}
                    label="Tag Name"
                    name="name"
                    type="text"
                    placeholder="e.g. High Polycount, Verified 100%"
                />

                <div className="space-y-1.5 pt-1">
                    <label className="text-xs font-medium text-foreground block">
                        Tag Color
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                        {PRESET_COLORS.map((color) => {
                            const isSelected = selectedColor === color;
                            return (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => handleColorSelect(color)}
                                    className={cn(
                                        "w-7 h-7 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs",
                                        isSelected
                                            ? "ring-2 ring-foreground scale-110"
                                            : "hover:scale-105 opacity-80 hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: color }}
                                >
                                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </FormGrid>
        </Form>
    );
}
