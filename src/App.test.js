import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app', () => {
  render(<App />);
  // "Srinidhi BS" appears in both the header brand and the footer copyright,
  // so use getAllByText (getByText throws on multiple matches). Asserting at
  // least one instance renders is a sufficient smoke test that the app mounts.
  const brandElements = screen.getAllByText(/Srinidhi BS/i);
  expect(brandElements.length).toBeGreaterThan(0);
});
