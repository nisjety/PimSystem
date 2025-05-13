export default function Loading() {
  return (
    <div className="grid gap-4 animate-pulse">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-lg shadow">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
      
      <div className="mt-8">
        <div className="h-6 bg-gray-200 rounded w-36 mb-4"></div>
        <div className="bg-white rounded-lg shadow divide-y">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
