import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import StatsGrid from "./components/StatsGrid";
import UpcomingInterviews from "./components/UpcomingInterviews";
import RecentActivity from "./components/RecentActivity";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Udhav";

  return (
    <div className="bg-gray-50 min-h-screen">
      <Sidebar />

      {/* ml-64 pushes this content to the right of the sidebar (which is 64 wide) */}
      <div className="ml-64">
        <Topbar />

        <div className="p-8">
          <h1 className="text-2xl font-bold text-gray-900">Hello, {userName} 👋</h1>
          <p className="text-gray-500 text-sm mb-6">
            Here is what&apos;s happening with your applications and active pipeline.
          </p>

          <div className="mb-8">
            <StatsGrid />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UpcomingInterviews />
            </div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </div>
  );
}
