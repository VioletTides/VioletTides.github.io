import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from './AppShell';
import { RouteLoadingFallback } from './components/RouteLoadingFallback';
import { ContactPage } from './routes/ContactPage';
import { HomePage } from './routes/HomePage';
import { ProjectsPage } from './routes/ProjectsPage';

const ProjectDetailRoute = lazy(() =>
  import('./routes/ProjectDetailRoute').then((module) => ({
    default: module.ProjectDetailRoute,
  })),
);

function routerBasename(): string | undefined {
  const base = import.meta.env.BASE_URL;
  if (!base || base === '/') {
    return undefined;
  }
  return base.replace(/\/$/, '');
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename()}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route
            path="/projects/:slug"
            element={
              <Suspense fallback={<RouteLoadingFallback label="Loading Project" />}>
                <ProjectDetailRoute />
              </Suspense>
            }
          />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
