import { render, screen } from '@testing-library/react';
import App from './App';

test('renders secure jwt auth demo login screen', () => {
  render(<App />);

  expect(screen.getByText(/secure jwt auth demo/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
});
