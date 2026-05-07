import { Shell } from './components/shell';
import { useBootstrap } from './hooks/use-bootstrap';
import { HomeRoute } from './routes/home';
import { useProfileBootstrap } from '@/features/profile/hooks/use-profile-bootstrap';
import { useThemeSync } from '@/lib/theme/theme';

export function SidePanelApp(): JSX.Element {
  useBootstrap();
  useProfileBootstrap();
  useThemeSync();

  return (
    <Shell>
      <HomeRoute />
    </Shell>
  );
}
