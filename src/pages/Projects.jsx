import SectionHeading from '../components/shared/SectionHeading';
import ProjectCard from '../components/shared/ProjectCard';

const projects = [
  {
    image: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/966810261_generated_0f8cf771.png',
    title: 'Got Bags? Initiative',
    description: 'We collect plastic bags from the community and weave them into durable sleeping mats for those experiencing homelessness. It takes about 700 bags to make a single mat — turning waste into warmth.',
  },
  {
    image: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/eae6320ab_generated_d26c231a.png',
    title: 'Care Closet Support',
    description: 'Our members organize and donate hygiene products — soap, toothbrushes, shampoo, and more — to stock the school care closet, ensuring every student has access to basic necessities.',
  },
  {
    image: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/e36514680_generated_a44aae9c.png',
    title: 'Community Events',
    description: 'From local festivals to school fairs, Key Club members volunteer their time to support community events, run booths, and spread awareness about the power of student service.',
  },
  {
    image: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/3b1b294b4_generated_e38479b8.png',
    title: 'Community Mural Project',
    description: 'Working together with local artists, our members helped paint a vibrant mural at the community center — bringing color and pride to a shared public space.',
  },
  {
    image: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/2db13ba81_generated_e2bd570e.png',
    title: 'Soup Kitchen Service',
    description: 'Our members volunteer regularly at the local soup kitchen, preparing and serving meals to community members in need with care and compassion.',
  },
  {
    image: 'https://media.base44.com/images/public/69c2a0f26438a6d865c0f034/38e41a503_generated_e444290c.png',
    title: 'Awards & Recognition',
    description: 'Milford Key Club has been recognized at district and state levels for our dedication to service, leadership, and community impact.',
  },
];

export default function Projects() {
  return (
    <div>
      <section className="py-16 md:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Work"
            title="Service Projects"
            description="Every project is an opportunity to learn, grow, and give back. Here's a look at what we've been working on."
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {projects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}