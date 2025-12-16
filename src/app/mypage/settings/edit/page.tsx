import SettingsEditClient from './SettingsEditClient';
import { getSettingsData } from '@/lib/user/settingsData';

export default async function SettingsEditPage() {
  const { profile, userEmail, isSeller } = await getSettingsData();
  return <SettingsEditClient profile={profile} userEmail={userEmail} isSeller={isSeller} />;
}
