import SellerProfileClient from './SellerProfileClient';
import { getSellerProfileData } from '@/lib/seller/profileData';

export default async function SellerProfilePage() {
  const profileWithData = await getSellerProfileData();

  return <SellerProfileClient profile={profileWithData} />;
}
