import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../api/auth/[...nextauth]';
import Timeline from '@/components/Timeline';
import PhotoGallery from '@/components/PhotoGallery';
import PartsList from '@/components/PartsList';
import CostTracker from '@/components/CostTracker';
import TodoList from '@/components/TodoList';

export default async function ProjectPage({ params }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const project = await fetchProject(params.projectId);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{project.name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Timeline projectId={project.id} />
        <PhotoGallery projectId={project.id} />
        <PartsList projectId={project.id} />
        <CostTracker projectId={project.id} />
        <TodoList projectId={project.id} />
      </div>
    </div>
  );
}