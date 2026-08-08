import { useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { FormPageShell } from "@/components/layout/shells/FormPageShell";
import { UpdateContentTypeForm } from "../components/UpdateContentTypeForm";
import { useUpdateContentType } from "../hooks/useContentTypes";
import type { UpdateContentTypeValues } from "../schemas/updateContentTypeSchema";

export function UpdateContentTypePage() {
    const { t } = useTranslation("contentType");
    const navigate = useNavigate();
    const { id } = useParams({ strict: false }) as { id: string };

    const { mutate, isPending } = useUpdateContentType();

    const handleSubmit = (data: UpdateContentTypeValues) => {
        mutate(
            { id, data },
            {
                onSuccess: () => navigate({ to: "/content-types/$id", params: { id } }),
            }
        );
    };

    return (
        <FormPageShell
            title={t("actions.update", { defaultValue: "Edit ContentType" })}
            description={t("update.description", { defaultValue: "Modify contentType information." })}
            formId={`update-content-type-form-${id}`}
            isPending={isPending}
            submitLabel={t("common:saveChanges", { defaultValue: "Save Changes" })}
            onCancel={() => navigate({ to: "/content-types/$id", params: { id } })}
            cancelLabel={t("common:cancel", { defaultValue: "Cancel" })}
        >
            <UpdateContentTypeForm id={id} onSubmit={handleSubmit} />
        </FormPageShell>
    );
}
