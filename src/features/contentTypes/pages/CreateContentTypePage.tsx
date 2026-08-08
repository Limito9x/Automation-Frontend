import { useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FormPageShell } from "@/components/layout/shells/FormPageShell";
import { CreateContentTypeForm } from "../components/CreateContentTypeForm";
import { useCreateContentType } from "../hooks/useContentTypes";
import type { CreateContentTypeOutput } from "../schemas/createContentTypeSchema";

export function CreateContentTypePage() {
    const { t } = useTranslation("contentTypes");
    const navigate = useNavigate();
    const { id: projectId } = useParams({ strict: false }) as { id: string };
    const { mutate, isPending } = useCreateContentType();

    const handleSubmit = (data: CreateContentTypeOutput) => {
        mutate(
            { data },
            {
                onSuccess: () => navigate({ to: "/projects/$id/content-types", params: { id: projectId } }),
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
            onCancel={() => navigate({ to: "/projects/$id/content-types", params: { id: projectId } })}
            cancelLabel={t("common:cancel", { defaultValue: "Cancel" })}
        >
            <CreateContentTypeForm onSubmit={handleSubmit} projectId={projectId} />
        </FormPageShell>
    );
}
