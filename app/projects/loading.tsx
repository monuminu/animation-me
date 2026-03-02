export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Nav skeleton */}
      <div className="sticky top-0 z-50 h-14 flex items-center justify-between px-6 border-b border-border/50 bg-bg/80 backdrop-blur-xl">
        <div className="w-32 h-5 bg-bg-elevated rounded animate-pulse" />
        <div className="w-24 h-7 bg-bg-elevated rounded-lg animate-pulse" />
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 pt-22">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="w-40 h-7 bg-bg-elevated rounded animate-pulse mb-2" />
            <div className="w-20 h-4 bg-bg-elevated rounded animate-pulse" />
          </div>
          <div className="w-32 h-9 bg-bg-elevated rounded-lg animate-pulse" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-bg-secondary border border-border rounded-xl p-5"
            >
              <div className="w-3/4 h-4 bg-bg-elevated rounded animate-pulse mb-3" />
              <div className="w-full h-3 bg-bg-elevated rounded animate-pulse mb-2" />
              <div className="w-2/3 h-3 bg-bg-elevated rounded animate-pulse mb-4" />
              <div className="w-16 h-3 bg-bg-elevated rounded animate-pulse" />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
