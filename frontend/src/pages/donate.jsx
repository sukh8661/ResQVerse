import { useQuery } from "@tanstack/react-query";
import DonationForm from "@/components/donation-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Shield, Clock, Award, Trophy, Building, CheckCircle } from "lucide-react";
import heroBackground from "@/photos/hero-background.png";

function formatInr(amount) {
  return `Rs ${Number(amount || 0).toLocaleString()}`;
}

function getTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const diffMins = Math.floor((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default function Donate() {
  const { data: donationData } = useQuery({
    queryKey: ["/api/donations"],
    select: (data) => data || { donations: [], totalAmount: 0 }
  });
  const { data: adminData } = useQuery({ queryKey: ["/api/admin/overview"] });
  const { data: ngoData } = useQuery({ queryKey: ["/api/admin/ngos"] });

  const donations = donationData?.donations || [];
  const overview = adminData?.overview || {};
  const allocations = adminData?.allocations || [];
  const ngos = ngoData?.ngos || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="pt-16 space-y-12">
        <section className="relative overflow-hidden shadow-2xl py-10">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroBackground})`, filter: "blur(1px) brightness(1)", transform: "scale(1.1)" }}
          />
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/30" />

          <div className="relative text-center py-16 px-8 text-white">
            <div className="p-4 mb-6 bg-white/35 rounded-full shadow-2xl backdrop-blur-md border border-white/40 inline-flex">
              <Heart className="h-12 w-12 text-white drop-shadow-2xl" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-2 drop-shadow-2xl text-white">
              Transform Lives Through Giving
            </h1>
            <p className="text-xl text-white font-medium drop-shadow-xl">
              Every number below reflects live relief activity.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-5xl mx-auto">
              <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-white mb-2">{formatInr(overview.totalDonationAmount)}</div>
                <p className="text-white font-medium text-sm">Total Donations</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-white mb-2">{overview.donations || donations.length}</div>
                <p className="text-white font-medium text-sm">Donation Records</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-white mb-2">{formatInr(overview.allocatedAmount)}</div>
                <p className="text-white font-medium text-sm">Allocated to NGOs</p>
              </div>
              <div className="bg-white/20 backdrop-blur-lg p-6 rounded-2xl border border-white/40">
                <div className="text-3xl font-bold text-white mb-2">{formatInr(overview.unallocatedAmount)}</div>
                <p className="text-white font-medium text-sm">Pending Allocation</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-8">
            <DonationForm />
          </div>

          <div className="lg:col-span-4">
            <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-white to-orange-50 h-full">
              <CardHeader className="bg-gray-100 text-gray-800 py-6 border-b border-gray-200">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <div className="p-3 bg-orange-100 rounded-xl">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <span>Recent Donations</span>
                </CardTitle>
                <p className="text-gray-600 text-base mt-2">Latest successful donations from the relief network.</p>
              </CardHeader>
              <CardContent className="px-5 py-8">
                <div className="space-y-4">
                  {donations.slice(0, 8).map((donation) => {
                    const donorName = donation.isAnonymous ? "Anonymous" : donation.donorData?.name || "Donor";
                    return (
                      <div key={donation.id} className="w-full px-3 py-4 bg-gradient-to-r from-white to-orange-50 rounded-2xl border border-orange-100 shadow-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {donorName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-bold text-gray-900 text-md">{donorName}</div>
                              <div className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 text-md">{formatInr(donation.amount)}</div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-gray-600 text-xs">For <span className="text-gray-800 font-semibold">{donation.donationType || "Disaster Relief"}</span></div>
                              <span className="text-xs text-gray-500 font-medium">{getTimeAgo(donation.timestamp || donation.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {donations.length === 0 && <p className="text-center text-gray-500 py-8">No successful donations have been recorded yet.</p>}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="bg-gray-100 text-gray-800 py-6 pl-8 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Award className="h-6 w-6 text-orange-600" />
                </div>
                <span>Verified NGO Partners</span>
              </CardTitle>
              <p className="text-gray-600 text-base mt-2">Verified partner NGOs available for direct support.</p>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {ngos.map((ngo) => (
                <div key={ngo.id} className="w-full p-4 px-6 rounded-2xl shadow-lg border bg-gradient-to-r from-white to-orange-50 border-orange-100">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg bg-gradient-to-br from-orange-400 to-red-500 text-white">
                      {ngo.organizationName.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-lg">{ngo.organizationName}</div>
                        <Badge className="bg-green-100 text-green-700">{ngo.kycStatus}</Badge>
                      </div>
                      <div className="text-sm text-gray-600">{ngo.warehouses?.length || 0} warehouses • {ngo.vehicles?.length || 0} vehicle groups</div>
                    </div>
                  </div>
                </div>
              ))}
              {ngos.length === 0 && <p className="text-gray-500">No verified NGO partners are available yet.</p>}
            </CardContent>
          </Card>

          <Card className="shadow-xl border-0 overflow-hidden bg-gradient-to-br from-white to-orange-50">
            <CardHeader className="bg-gray-100 text-gray-800 py-6 pl-8 border-b border-gray-200">
              <CardTitle className="flex items-center space-x-3 text-2xl">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Building className="h-6 w-6 text-orange-600" />
                </div>
                <span>Transparent Fund Allocation</span>
              </CardTitle>
              <p className="text-gray-600 text-base mt-2">Recent fund allocations approved by coordinators.</p>
            </CardHeader>
            <CardContent className="p-8 space-y-4">
              {allocations.slice(0, 8).map((allocation) => (
                <div key={allocation.id} className="flex items-center justify-between rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                  <div>
                    <div className="font-semibold">{allocation.purpose}</div>
                    <div className="text-sm text-gray-500">NGO: {allocation.ngoId}</div>
                  </div>
                  <Badge>{formatInr(allocation.amount)}</Badge>
                </div>
              ))}
              {allocations.length === 0 && <p className="text-gray-500">No fund allocations stored yet.</p>}
            </CardContent>
          </Card>
        </div>

        <section className="bg-gray-100 text-gray-800 p-12 text-center">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-4xl font-bold mb-8">Your Security is Our Priority</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center space-y-4"><Shield className="h-10 w-10 text-orange-600" /><strong>Secure Razorpay Flow</strong><span className="text-sm text-gray-600">Orders and verification are handled by backend APIs.</span></div>
              <div className="flex flex-col items-center space-y-4"><CheckCircle className="h-10 w-10 text-orange-600" /><strong>Transparent Records</strong><span className="text-sm text-gray-600">Successful donations are tracked with cause and donor choice.</span></div>
              <div className="flex flex-col items-center space-y-4"><Trophy className="h-10 w-10 text-orange-600" /><strong>Transparent Allocation</strong><span className="text-sm text-gray-600">Admin can allocate funds to NGOs for relief work.</span></div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
