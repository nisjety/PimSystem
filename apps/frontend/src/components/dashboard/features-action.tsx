import React from 'react';
import { featuresData } from '@/config/home-config';

export function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {featuresData.map((feature) => {
        const Icon = feature.icon;
        return (
          <div key={feature.title} className="p-4 bg-white rounded-lg shadow">
            <div className="flex items-center mb-2">
              <Icon className="mr-2" size={20} />
              <h3 className="font-semibold">{feature.title}</h3>
            </div>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </div>
        );
      })}
    </div>
  );
}

export default Features;