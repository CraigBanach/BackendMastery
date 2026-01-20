import { Suspense } from "react";
import { headers } from "next/headers";
import { getBuckets } from "@/lib/api/bucketApi";
import { BucketsPageClient } from "@/components/buckets/bucketsPageClient";
import { PageHeader } from "@/components/ui/pageHeader";
import { RequireAccount } from "@/components/ui/requireAccount";
import { BucketDto } from "@/types/bucket";



export const dynamic = 'force-dynamic';

async function BucketsContent() {
  const requestHeaders = await headers();
  const userAgent = requestHeaders.get("user-agent");
  const acceptLanguage = requestHeaders.get("accept-language");
  const clientHints = requestHeaders.get("sec-ch-ua");
  const clientPlatform = requestHeaders.get("sec-ch-ua-platform");

  console.info("Buckets request headers", {
    userAgent,
    acceptLanguage,
    clientHints,
    clientPlatform,
  });

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

