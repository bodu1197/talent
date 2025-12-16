import SellerProfileEditClient from './SellerProfileEditClient';
import { getSellerProfileData } from '@/lib/seller/profileData';

export default async function SellerProfileEditPage() {
  const profileWithData = await getSellerProfileData();

  return <SellerProfileEditClient profile={profileWithData} />;
}
