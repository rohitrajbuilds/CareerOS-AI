import { Shell } from './components/shell';
import { useBootstrap } from './hooks/use-bootstrap';
import { HomeRoute } from './routes/home';

export function SidePanelApp(): JSX.Element {
  useBootstrap();

  return (
    <Shell>
      <HomeRoute />
    </Shell>
  );
}
