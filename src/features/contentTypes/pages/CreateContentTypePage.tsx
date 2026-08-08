import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FormPageShell } from "@/components/layout/shells/FormPageShell";
import { CreateContentTypeForm } from "../components/CreateContentTypeForm";
import { useCreateContentType } from "../hooks/useContentTypes";
import type { CreateContentTypeOutput } from "../schemas/createContentTypeSchema";

export function CreateContentTypePage() {
    const { t } = useTranslation("contentType");
    const navigate = useNavigate();
    const { mutate, isPending } = useCreateContentType();

    const handleSubmit = (data: CreateContentTypeOutput) => {
        mutate(
            { data },
            {
                onSuccess: () => navigate({ to: "/content-types" }),
            }
        );
    };

    return (
        <FormPageShell
            title={t("actions.create", { defaultValue: "Create ContentType" })}
            description={t("create.description", { defaultValue: "Add a new contentType to the system." })}
            formId="create-content-type-form"
            isPending={isPending}
            submitLabel={t("actions.create", { defaultValue: "Create" })}
            onCancel={() => navigate({ to: "/content-types" })}
            cancelLabel={t("common:cancel", { defaultValue: "Cancel" })}
        >
            <CreateContentTypeForm onSubmit={handleSubmit} />
        </FormPageShell>
    );
}
