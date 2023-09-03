import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import { ErrorProvider } from './contexts/error.context';
import { SuccessProvider } from './contexts/success.context';

const rootElement = document.getElementById('root');

if (rootElement) {
  const root = createRoot(rootElement);

  root.render(
    <Router>
      <ErrorProvider>
        <SuccessProvider>
          <App />
        </SuccessProvider>
      </ErrorProvider>
    </Router>,
  );
}
