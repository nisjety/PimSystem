// src/components/dashboard/widgets/TeamMember.tsx
export function TeamMember({ 
  name, 
  role, 
  avatarSrc, 
  bgColor 
}: { 
  name: string; 
  role: string; 
  avatarSrc: string; 
  bgColor: string;
}) {
  return (
    <div className="bg-gray-700 rounded-lg p-4 flex flex-col items-center">
      <div className={`h-16 w-16 rounded-full overflow-hidden ${bgColor} mb-3`}>
        <img 
          src={avatarSrc} 
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback for missing images
            e.currentTarget.src = `https://ui-avatars.com/api/?name=${name}&background=random`;
          }}
        />
      </div>
      <h3 className="font-medium text-white">{name}</h3>
      <p className="text-sm text-gray-400">{role}</p>
    </div>
  );
}