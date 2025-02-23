export default function AdminPage() {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Dashboard Overview</h2>
          <p className="mt-1 text-sm text-gray-500">
            Welcome to the CCC administration dashboard.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Total Sponsors
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                4
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Funds Raised
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                $50,000
              </dd>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <dt className="text-sm font-medium text-gray-500 truncate">
                Days Until Event
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-gray-900">
                45
              </dd>
            </div>
          </div>
        </div>

        {/* Actions Section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              type="button"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="block text-sm font-medium text-gray-900">
                Add New Sponsor
              </span>
            </button>
            <button
              type="button"
              className="relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="block text-sm font-medium text-gray-900">
                Update Event Details
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
