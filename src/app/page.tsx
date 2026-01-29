/**
 * Home page - Landing page with login prompt
 */

import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            📍 Calendar Maps
          </h1>
          <p className="text-xl text-gray-600">
            Visualize your Google Calendar events on an interactive map
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-6 w-6 text-blue-500 font-bold text-lg">✓</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Connect Your Calendar
              </h3>
              <p className="text-gray-600">
                Securely authenticate with your Google account
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-6 w-6 text-blue-500 font-bold text-lg">✓</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                View Events on a Map
              </h3>
              <p className="text-gray-600">
                See all your calendar events with locations on an interactive Google Map
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-6 w-6 text-blue-500 font-bold text-lg">✓</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Auto-Geocoding
              </h3>
              <p className="text-gray-600">
                Automatically converts event locations into map coordinates
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0 h-6 w-6 text-blue-500 font-bold text-lg">✓</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Real-Time Updates
              </h3>
              <p className="text-gray-600">
                Events refresh periodically to show latest changes
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Link
            href="/api/auth/login"
            className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
          >
            Sign in with Google
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>
            This app requires access to your Google Calendar to function.
            Your data is never stored or shared.
          </p>
        </div>
      </div>
    </div>
  );
}
