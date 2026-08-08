import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FormInput, FormSelect, FormSwitch } from "@/components/form-controls";
import { Trash2, Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

export function SchemaBuilder() {
    const { t } = useTranslation("contentTypes");
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "fieldsConfig",
    });

    const fieldTypes = [
        { label: "Text", value: "text" },
        { label: "Long Text", value: "longtext" },
        { label: "Number", value: "number" },
        { label: "Boolean", value: "boolean" },
        { label: "Date", value: "date" },
        { label: "Media", value: "media" },
        { label: "Rich Text", value: "richtext" },
        { label: "Relation", value: "relation" },
    ];

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("fields.schemaBuilder", { defaultValue: "Fields Configuration" })}</CardTitle>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", displayName: "", type: "text", required: false })}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    {t("actions.addField", { defaultValue: "Add Field" })}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {fields.length === 0 && (
                    <div className="text-center p-4 border border-dashed rounded-lg text-muted-foreground text-sm">
                        {t("messages.noFields", { defaultValue: "No fields configured yet. Click 'Add Field' to start." })}
                    </div>
                )}
                {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col sm:flex-row gap-4 p-4 border rounded-lg items-start bg-muted/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                            <FormInput
                                control={control}
                                name={`fieldsConfig.${index}.name`}
                                label="Field Name (Key)"
                                placeholder="e.g. title"
                            />
                            <FormInput
                                control={control}
                                name={`fieldsConfig.${index}.displayName`}
                                label="Display Name"
                                placeholder="e.g. Title"
                            />
                            <FormSelect
                                control={control}
                                name={`fieldsConfig.${index}.type`}
                                label="Type"
                                options={fieldTypes}
                            />
                            <div className="flex items-center pt-8">
                                <FormSwitch
                                    control={control}
                                    name={`fieldsConfig.${index}.required`}
                                    label="Required"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="mt-6 shrink-0"
                            onClick={() => remove(index)}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
