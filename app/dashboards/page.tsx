import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]';
import ProjectCard from '@/components/ProjectCard';

export default async function Dashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  // Fetch user's projects from the database
  const projects = await fetchUserProjects(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Car Projects</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}