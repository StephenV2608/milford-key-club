import { useState, useEffect } from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import ProjectCard from '../components/shared/ProjectCard';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../hooks/useSiteSettings';

const FALLBACK_PROJECTS = [
  { id: 'f1', image_url: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/966810261_generated_0f8cf771.png', title: 'Got Bags? Initiative', description: 'We collect plastic bags from the community and weave them into durable sleeping mats for those experiencing homelessness. It takes about 700 bags to make a single mat.' },
  { id: 'f2', image_url: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/eae6320ab_generated_d26c231a.png', title: 'Care Closet Support', description: 'Our members organize and donate hygiene products to stock the school care closet, ensuring every student has access to basic necessities.' },
  { id: 'f3', image_url: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/e36514680_generated_a44aae9c.png', title: 'Community Events', description: 'From local festivals to school fairs, Key Club members volunteer their time to support community events and spread awareness.' },
];

export default function Projects() {
  const { settings } = useSiteSettings();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Project.list('order').then(list => {
      setProjects(list);
      setLoading(false);
    });
  }, []);

  const items = projects.length > 0 ? projects : FALLBACK_PROJECTS;

  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={settings.projects_eyebrow || 'Our Work'}
            title={settings.projects_heading || 'Service Projects'}
            description={settings.projects_description || "Every project is an opportunity to learn, grow, and give back. Here's a look at what we've been working on."}
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/2]" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {items.map(p => (
                <ProjectCard key={p.id} image={p.image_url} title={p.title} description={p.description} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}