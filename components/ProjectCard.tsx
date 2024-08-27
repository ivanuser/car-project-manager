import Link from 'next/link';

export default function ProjectCard({ project }) {
  return (
    <Link href={`/dashboard/${project.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
        <div className="h-48 bg-gray-200">
          {project.coverImage && <img src={project.coverImage} alt={project.name} className="w-full h-full object-cover" />}
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{project.name}</h2>
          <p className="text-gray-600">{project.description}</p>
        </div>
      </div>
    </Link>
  );
}