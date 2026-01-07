import { getBuckets } from "@/lib/api/bucketApi";
import { BucketsPageClient } from "@/components/buckets/bucketsPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";
import { BucketDto } from "@/types/bucket";

export const dynamic = 'force-dynamic';

export default async function BucketsPage() {
  let buckets: BucketDto[];
  
  try {
    buckets = await getBuckets();
  } catch (error: unknown) {
    console.error('Error fetching buckets:', error);
    buckets = [];
  }

  return (
    <RequireAccount>
      <div className="container mx-auto px-4 py-6">
        <PageHeader
          title="Buckets"
          subTitle="Manage your savings buckets and goals"
        />
        <BucketsPageClient initialBuckets={buckets} />
      </div>
    </RequireAccount>
  );
}
