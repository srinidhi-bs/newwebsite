import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  const headerElement = screen.getByText(/Srinidhi BS/i);
  expect(headerElement).toBeInTheDocument();
});
