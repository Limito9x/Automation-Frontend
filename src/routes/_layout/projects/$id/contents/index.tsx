import { createFileRoute } from "@tanstack/react-router";
import { buildPagedSearchSchema } from "@/lib/schemas/pagedSearch.schema";
import { CONTENT_ITEM_FILTERABLE_FIELDS } from "@/features/contentItems/schemas/contentItemFilterableFields";
import { ContentItemPage } from "@/features/contentItems/ContentItemPage";

export const contentItemsRouteSearch = buildPagedSearchSchema(CONTENT_ITEM_FILTERABLE_FIELDS);

export const Route = createFileRoute("/_layout/projects/$id/contents/")({
    validateSearch: contentItemsRouteSearch,
    component: ContentItemsRoute,
});

function ContentItemsRoute() {
    return (
        <ContentItemPage
            useSearch={Route.useSearch}
            useNavigate={Route.useNavigate}
        />
    );
}
