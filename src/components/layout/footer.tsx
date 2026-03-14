export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <span className="font-semibold text-gray-900">MedConsult</span>
          </div>
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MedConsult. Alle rettigheder forbeholdes.
          </p>
        </div>
      </div>
    </footer>
  )
}
