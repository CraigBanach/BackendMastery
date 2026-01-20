export interface BucketDto {
  id: number;
  name: string;
  color?: string;
  currentBalance: number;
  targetAmount?: number;
}

export interface CreateBucketDto {
  name: string;
  color?: string;
  targetAmount?: number;
  currentBalance?: number;
}

export interface UpdateBucketDto {
  name: string;
  color?: string;
  targetAmount?: number;
  currentBalance?: number;
}
