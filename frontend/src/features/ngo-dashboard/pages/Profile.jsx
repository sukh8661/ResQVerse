import { useQuery } from "@tanstack/react-query";
import { Building2, CheckCircle2, FileText, Mail, MapPin, Phone, ShieldCheck, Truck, Warehouse } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthSession } from "@/lib/auth";

export default function Profile() {
  const session = getAuthSession();
  const { data: meData } = useQuery({
    queryKey: ["/api/auth/me"],
    enabled: Boolean(session?.user?.role === "ngo")
  });

  const profile = meData?.profile || session?.profile || {};
  const user = meData?.user || session?.user || {};
  const isVerified = profile.isVerified || profile.kycStatus === "verified";

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">NGO profile</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-950">{profile.organizationName || "NGO Profile"}</h1>
            <p className="mt-1 max-w-2xl text-slate-500">{profile.description || "Relief partner profile and verification details."}</p>
          </div>
          <Badge className={isVerified ? "w-fit bg-emerald-600" : "w-fit bg-amber-500"}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            {isVerified ? "Verified NGO" : profile.kycStatus || "Pending verification"}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard label="Registration ID" value={profile.registrationId || "Not added"} icon={FileText} />
        <InfoCard label="Contact Person" value={profile.contactPerson || user.fullName || "Not added"} icon={Building2} />
        <InfoCard label="Phone" value={profile.phone || user.phone || "Not added"} icon={Phone} />
        <InfoCard label="Email" value={profile.email || user.email || "Not added"} icon={Mail} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5 text-red-500" /> Location Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Detail label="Address" value={profile.address || "Not added"} />
            <Detail label="Location" value={profile.location || "Not added"} />
            <Detail label="City" value={profile.city || "Not added"} />
            <Detail label="State" value={profile.state || "Not added"} />
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-600" /> Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Detail label="KYC Status" value={profile.kycStatus || "pending"} />
            <Detail label="Verified" value={isVerified ? "Yes" : "No"} />
            <Detail label="Documents" value={`${profile.documents?.length || 0} uploaded`} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(profile.documents || []).map((document) => (
              <a
                key={document.publicId || document.url}
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-2xl border border-slate-200 bg-white p-4 transition hover:bg-slate-50"
              >
                <p className="font-bold text-slate-950">{document.originalName || document.name || "Uploaded document"}</p>
                <p className="mt-1 text-sm text-slate-500">{document.type || document.format || "Document"} · {document.size || document.bytes || 0} bytes</p>
              </a>
            ))}
            {(!profile.documents || profile.documents.length === 0) && <Empty text="No registration documents uploaded yet." />}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Warehouse className="h-5 w-5" /> Capacity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(profile.warehouses || []).map((warehouse, index) => (
              <Detail key={`${warehouse.name}-${index}`} label={warehouse.name || `Warehouse ${index + 1}`} value={`${warehouse.location || "Location not added"} · ${warehouse.capacity || 0} capacity`} />
            ))}
            {(profile.vehicles || []).map((vehicle, index) => (
              <Detail key={`${vehicle.type}-${index}`} label={vehicle.type || "Vehicle"} value={`${vehicle.available || 0}/${vehicle.count || 0} available`} icon={Truck} />
            ))}
            {(!profile.warehouses?.length && !profile.vehicles?.length) && <Empty text="Warehouse and vehicle capacity will appear here when added." />}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon: Icon }) {
  return (
    <Card className="rounded-3xl border-slate-200 shadow-sm">
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <h2 className="mt-2 truncate text-lg font-black text-slate-950">{value}</h2>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-700">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function Detail({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Empty({ text }) {
  return <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-sm text-slate-500">{text}</p>;
}
