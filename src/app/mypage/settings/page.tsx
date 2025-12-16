import SettingsClient from './SettingsClient';
import { getSettingsData } from '@/lib/user/settingsData';

export default async function SettingsPage() {
  const { profile, userEmail, isSeller } = await getSettingsData();
  return <SettingsClient profile={profile} userEmail={userEmail} isSeller={isSeller} />;
}
