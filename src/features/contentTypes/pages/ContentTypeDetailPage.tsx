import { useNavigate, useParams } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DescriptionList, DescriptionListItem } from "@/components/custom-ui/data-display/DescriptionList";
import { SinglePageShell } from "@/components/layout/shells/SinglePageShell";
import { useGetContentTypeById } from "../hooks/useContentTypes";

export function ContentTypeDetailPage() {
    const { t } = useTranslation("contentType");
    const navigate = useNavigate();
    const { id } = useParams({ strict: false }) as { id: string };

    const { data: item, isLoading } = useGetContentTypeById(id);

    if (isLoading) {
        return (
            <SinglePageShell title={t("detail.title", { defaultValue: "ContentType Details" })}>
                <div className="flex h-32 items-center justify-center">
                    <span className="text-muted-foreground">{t("common:loading", { defaultValue: "Loading..." })}</span>
                </div>
            </SinglePageShell>
        );
    }

    if (!item) {
        return (
            <SinglePageShell title={t("detail.title", { defaultValue: "ContentType Details" })}>
                <div className="flex h-32 items-center justify-center">
                    <span className="text-muted-foreground">{t("common:notFound", { defaultValue: "Not found." })}</span>
                </div>
            </SinglePageShell>
        );
    }

    return (
        <SinglePageShell
            title={t("detail.title", { defaultValue: "ContentType Details" })}
            description={t("detail.description", { defaultValue: "View contentType information." })}
            headerActions={
                <>
                    <Button
                        variant="outline"
                        onClick={() => navigate({ to: "/content-types" })}
                    >
                        {t("common:back", { defaultValue: "Back" })}
                    </Button>
                    <Button
                        onClick={() => navigate({ to: "/content-types/$id/edit", params: { id } })}
                    >
                        <Edit className="mr-2 h-4 w-4" />
                        {t("actions.update", { defaultValue: "Edit" })}
                    </Button>
                </>
            }
        >
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <DescriptionList>
                    <DescriptionListItem
                        label={t("fields.id", { defaultValue: "ID" })}
                        value={<span className="font-mono text-xs">{item.id}</span>}
                    />
                    {/* Add more fields here */}
                </DescriptionList>
            </div>
        </SinglePageShell>
    );
}
