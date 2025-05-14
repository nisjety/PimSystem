// src/components/dashboard/widgets/TeamSection.tsx
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatarUrl: string;
  bgColor: string;
}

interface TeamSectionProps {
  team?: {
    members: TeamMember[];
  };
  isLoading?: boolean;
}

export function TeamSection({ team, isLoading = false }: TeamSectionProps) {
  const defaultTeam = [
    {
      id: "1",
      name: "Michel Pink",
      role: "CEO",
      avatarUrl: "/avatars/michel.jpg",
      bgColor: "bg-pink-200"
    },
    {
      id: "2",
      name: "Bruce Beige",
      role: "UI designer",
      avatarUrl: "/avatars/bruce.jpg",
      bgColor: "bg-yellow-100"
    },
    {
      id: "3",
      name: "Alice Red",
      role: "HR manager",
      avatarUrl: "/avatars/alice.jpg",
      bgColor: "bg-red-200"
    }
  ];

  const members = team?.members || defaultTeam;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Team</h2>
        <button className="text-gray-400 hover:text-white">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-700 rounded-lg p-4 h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {members.map((member, index) => (
            <TeamMemberCard 
              key={member.id} 
              member={member} 
              delay={index * 0.1} 
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface TeamMemberCardProps {
  member: TeamMember;
  delay: number;
}

function TeamMemberCard({ member, delay }: TeamMemberCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className="bg-gray-700 rounded-lg p-4 flex flex-col items-center"
    >
      <div className={`h-16 w-16 rounded-full overflow-hidden ${member.bgColor} mb-3 flex items-center justify-center`}>
        {member.avatarUrl ? (
          <img 
            src={member.avatarUrl} 
            alt={member.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              // Fallback for missing images
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=random`;
            }}
          />
        ) : (
          <span className="text-2xl font-bold">{member.name.charAt(0)}</span>
        )}
      </div>
      <h3 className="font-medium text-white text-center">{member.name}</h3>
      <p className="text-sm text-gray-400 text-center">{member.role}</p>
    </motion.div>
  );
}