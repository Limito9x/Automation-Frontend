import { useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FormPageShell } from "@/components/layout/shells/FormPageShell";
import { UpdateContentTypeForm } from "../components/UpdateContentTypeForm";
import { useUpdateContentType } from "../hooks/useContentTypes";
import type { UpdateContentTypeOutput } from "../schemas/updateContentTypeSchema";
import { useGetContentTypeById } from "@/gen/endpoints/content-types/content-types";

export function UpdateContentTypePage() {
    const { t } = useTranslation("contentTypes");
    const navigate = useNavigate();
    const { id: projectId, contentTypeId } = useParams({ strict: false }) as { id: string, contentTypeId: string };

    const { data: contentType, isLoading } = useGetContentTypeById(projectId, contentTypeId);
    const { mutate, isPending } = useUpdateContentType({ projectId });

    const handleSubmit = (data: UpdateContentTypeOutput) => {
        mutate(
            { projectId, id: contentTypeId, data },
            {
                onSuccess: () => navigate({ to: "/projects/$id/content-types", params: { id: projectId } }),
            }
        );
    };

    if (isLoading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    return (
        <FormPageShell
            title={t("actions.update", { defaultValue: "Edit ContentType" })}
            description={t("update.description", { defaultValue: "Modify contentType information." })}
            formId={"update-content-type-form"}
            isPending={isPending}
            submitLabel={t("common:saveChanges", { defaultValue: "Save Changes" })}
            onCancel={() => navigate({ to: "/projects/$id/content-types", params: { id: projectId } })}
            cancelLabel={t("common:cancel", { defaultValue: "Cancel" })}
        >
            {contentType && <UpdateContentTypeForm initialData={contentType} onSubmit={handleSubmit} />}
        </FormPageShell>
    );
}
