import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { AppShell } from './AppShell';
import { ContactPage } from './routes/ContactPage';
import { HomePage } from './routes/HomePage';
import { ProjectDetailRoute } from './routes/ProjectDetailRoute';
import { ProjectsPage } from './routes/ProjectsPage';

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
          <Route path="/projects/:slug" element={<ProjectDetailRoute />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
