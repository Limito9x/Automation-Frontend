import { createFileRoute } from "@tanstack/react-router";
import { buildPagedSearchSchema } from "@/lib/schemas/pagedSearch.schema";
import { CONTENT_TYPE_FILTERABLE_FIELDS } from "@/features/contentTypes/schemas/contentTypeFilterableFields";
import { ContentTypePage } from "@/features/contentTypes/ContentTypePage";

export const contentTypesRouteSearch = buildPagedSearchSchema(CONTENT_TYPE_FILTERABLE_FIELDS);

export const Route = createFileRoute("/_layout/projects/$id/content-types/")({
    validateSearch: contentTypesRouteSearch,
    component: ContentTypesRoute,
});

function ContentTypesRoute() {
    return (
        <ContentTypePage
            useSearch={Route.useSearch}
            useNavigate={Route.useNavigate}
        />
    );
}
