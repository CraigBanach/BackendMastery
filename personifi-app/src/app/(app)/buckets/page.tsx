import { Suspense } from "react";
import { getBuckets } from "@/lib/api/bucketApi";
import { BucketsPageClient } from "@/components/buckets/bucketsPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";
import { BucketDto } from "@/types/bucket";


export const dynamic = 'force-dynamic';

async function BucketsContent() {
  let buckets: BucketDto[];

  try {
    buckets = await getBuckets();
  } catch (error: unknown) {
    console.error("Error fetching buckets:", error);
    buckets = [];
  }

  return <BucketsPageClient initialBuckets={buckets} />;
}

const BucketsLoading = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-16 rounded-lg bg-muted" />
    <div className="h-64 rounded-lg bg-muted" />
  </div>
);

export default async function BucketsPage() {
  return (
    <RequireAccount>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <PageHeader
          title="Buckets"
          subTitle="Manage your savings buckets and goals"
        />
        <Suspense fallback={<BucketsLoading />}>
          <BucketsContent />
        </Suspense>
      </div>
    </RequireAccount>
  );
}

