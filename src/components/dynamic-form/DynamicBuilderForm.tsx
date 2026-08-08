import { DynamicForm } from "./DynamicForm";
import { getFieldRegistration, type FieldDefinition } from "@/lib/field-registry";

interface DynamicBuilderFormProps {
    /** The registered field type (e.g., 'text', 'select') */
    type: string;
    defaultValues?: Record<string, any>;
    onSubmit: (values: Record<string, any>) => void;
    submitText?: string;
}

export function DynamicBuilderForm({
    type,
    defaultValues = {},
    onSubmit,
    submitText = "Lưu cấu hình"
}: DynamicBuilderFormProps) {
    const registration = getFieldRegistration(type);

    const baseFields: FieldDefinition<any>[] = [
        {
            name: "name",
            type: "text",
            label: "Field ID (Name)",
            config: {
                placeholder: "Leave empty to auto-generate from label"
            }
        },
        {
            name: "label",
            type: "text",
            label: "Display Label",
            rules: {
                required: true
            }
        },
        {
            name: "description",
            type: "textarea",
            label: "Description"
        },
        {
            name: "defaultValue",
            // Đối với select hoặc các trường cần data phụ thuộc (options), ta dùng text input cho an toàn
            type: (type === "select") ? "text" : type as any,
            label: "Default Value",
            description: type === "select"
                ? "Nhập chính xác 1 giá trị (value) có trong Options"
                : "Giá trị mặc định ban đầu"
        }
    ];

    const combinedFields = [
        ...baseFields,
        ...((registration?.builderFields || []) as any)
    ];

    return (
        <DynamicForm
            key={type} // Ép re-mount form và reset values khi type thay đổi
            defaultValues={defaultValues}
            fields={combinedFields}
            submitText={submitText}
            onSubmit={onSubmit}
        />
    );
}
