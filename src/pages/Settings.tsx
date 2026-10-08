import { Database, LockKeyhole, SlidersHorizontal } from "lucide-react";
import Card from "../components/common/Card";
import PageHeader from "../components/common/PageHeader";
import ThemeToggle from "../components/common/ThemeToggle";

export default function Settings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage preferences that are available in this OrganMatch prototype."
      />

      <Card className="p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <SlidersHorizontal className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-semibold text-slate-900">Appearance</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Choose light, dark, or system appearance. This preference is stored locally in this browser only.
              </p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-emerald-100 px-6 py-5">
          <p className="text-sm font-semibold text-emerald-700">Prototype capabilities</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">Settings not available yet</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            These controls need a backend or persisted user profile and are intentionally not simulated in the current application.
          </p>
        </div>

        <div className="divide-y divide-emerald-100">
          <LimitationRow
            icon={<LockKeyhole className="h-5 w-5" aria-hidden="true" />}
            title="Accounts, roles, and security"
            description="Authentication, user management, passwords, roles, and security preferences have no connected backend or persistence layer."
          />
          <LimitationRow
            icon={<Database className="h-5 w-5" aria-hidden="true" />}
            title="Notification and system preferences"
            description="Notification read state, delivery preferences, audit retention, and system configuration are not stored by the current dataset/service architecture."
          />
          <LimitationRow
            icon={<SlidersHorizontal className="h-5 w-5" aria-hidden="true" />}
            title="Clinical decision support"
            description="Matching rules and clinical data remain controlled by the current datasets and services; they are not editable from Settings."
          />
        </div>
      </Card>
    </div>
  );
}

function LimitationRow({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 px-6 py-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}
