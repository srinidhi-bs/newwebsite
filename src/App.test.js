import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  const elements = screen.getAllByText(/Srinidhi BS/i);
  expect(elements.length).toBeGreaterThan(0);
});
