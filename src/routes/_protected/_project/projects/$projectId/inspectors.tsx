import { createFileRoute } from '@tanstack/react-router';
import { InspectorsPage } from '@/features/inspectors/InspectorsPage';

export const Route = createFileRoute('/_protected/_project/projects/$projectId/inspectors')({
  staticData: {
    breadcrumb: 'Inspectors',
  },
  component: InspectorsRouteComponent,
});

function InspectorsRouteComponent() {
  const { projectId } = Route.useParams();
  return <InspectorsPage projectId={projectId} />;
}
