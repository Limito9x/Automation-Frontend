import { useFieldArray, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { BuilderBlock } from "@/components/dynamic-form/BuilderBlock";
import { getFieldRegistry } from "@/lib/field-registry";
import { normalizeTypeName } from "@/components/dynamic-form/BuilderBlock";
import { useMemo } from "react";

export function FormBuilder() {
    const { t } = useTranslation("contentTypes");
    const { control } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "fieldsConfig",
    });

    const availableTypes = useMemo(() => {
        return Array.from(getFieldRegistry().keys())
            .filter(k => k !== 'relation')
            .map(k => ({ label: normalizeTypeName(k), value: k }));
    }, []);

    return (
        <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t("fields.schemaBuilder", { defaultValue: "Fields Configuration" })}</CardTitle>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ name: "", label: "", type: "text", properties: { required: false } })}
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
                    <BuilderBlock
                        key={field.id}
                        control={control}
                        index={index}
                        onRemove={() => remove(index)}
                        namePrefix="fieldsConfig"
                        availableTypes={availableTypes}
                    />
                ))}
            </CardContent>
        </Card>
    );
}
