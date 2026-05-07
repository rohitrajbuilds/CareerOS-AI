import { Shell } from './components/shell';
import { useBootstrap } from './hooks/use-bootstrap';
import { HomeRoute } from './routes/home';
import { useProfileBootstrap } from '@/features/profile/hooks/use-profile-bootstrap';

export function SidePanelApp(): JSX.Element {
  useBootstrap();
  useProfileBootstrap();

  return (
    <Shell>
      <HomeRoute />
    </Shell>
  );
}
