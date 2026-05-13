export default function Loading() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-brand-blue border-t-transparent rounded-full animate-spin" />
      <span className="ml-3 text-gray-400">Loading...</span>
    </div>
  )
}
