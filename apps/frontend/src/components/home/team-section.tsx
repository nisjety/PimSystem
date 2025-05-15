// src/components/TeamSection.tsx
'use client';

import { motion } from "framer-motion";
import Image from "next/image";

const teamMembers = [
  {
    name: "Sarah Johnson",
    role: "Product Lead",
    image: "/team/sarah.jpg",
    bgColor: "bg-primary-light"
  },
  {
    name: "Michael Chen",
    role: "CTO",
    image: "/team/michael.jpg",
    bgColor: "bg-success-light"
  },
  {
    name: "Elena Rodriguez",
    role: "UX Designer",
    image: "/team/elena.jpg",
    bgColor: "bg-error-light"
  },
  {
    name: "David Kim",
    role: "Customer Success",
    image: "/team/david.jpg",
    bgColor: "bg-warning-light"
  }
];

export function TeamSection() {
  return (
    <section className="py-24 bg-cream-50 dark:bg-cream-900">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="h1 mb-4">Meet Our Team</h2>
          <p className="lead text-muted">
            The talent behind our PIM system, dedicated to helping you succeed.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.name} member={member} index={index} />
          ))}
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center justify-center bg-brand-gradient text-white text-lg font-semibold px-6 py-3 rounded-full">
            12M+ Satisfied Users
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function TeamMemberCard({
  member,
  index
}: {
  member: { name: string; role: string; image: string; bgColor: string; };
  index: number;
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
      className="card p-6 text-center group hover:shadow-lg transition-shadow duration-300"
    >
      <div className={`mx-auto mb-4 rounded-full overflow-hidden ${member.bgColor} h-24 w-24 p-1`}>
        <div className="rounded-full overflow-hidden h-full w-full">
          <Image
            src={member.image}
            alt={member.name}
            width={96}
            height={96}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
            }}
          />
        </div>
      </div>
      <h3 className="h4 mb-1">{member.name}</h3>
      <p className="text-muted">{member.role}</p>
    </motion.div>
  );
}