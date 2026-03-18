import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from './SearchBar';
import { SearchProvider } from '../../context/SearchContext';

function renderWithProvider() {
  return render(
    <SearchProvider>
      <SearchBar />
    </SearchProvider>,
  );
}

describe('SearchBar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('should render search input', () => {
    renderWithProvider();
    expect(screen.getByLabelText('Filter tasks by title')).toBeInTheDocument();
  });

  it('should have placeholder text', () => {
    renderWithProvider();
    expect(screen.getByPlaceholderText('Filter cards...')).toBeInTheDocument();
  });

  it('should render 6 color filter chips', () => {
    renderWithProvider();
    const chips = screen.getAllByTitle('Filter by label');
    expect(chips).toHaveLength(6);
  });

  it('should not show clear button initially', () => {
    renderWithProvider();
    expect(screen.queryByLabelText('Clear label filters')).not.toBeInTheDocument();
  });

  it('should show clear button after selecting a label', async () => {
    renderWithProvider();
    const chip = screen.getAllByTitle('Filter by label')[0];
    await userEvent.click(chip);
    expect(screen.getByLabelText('Clear label filters')).toBeInTheDocument();
  });

  it('should hide clear button after clearing', async () => {
    renderWithProvider();
    const chip = screen.getAllByTitle('Filter by label')[0];
    await userEvent.click(chip);
    await userEvent.click(screen.getByLabelText('Clear label filters'));
    expect(screen.queryByLabelText('Clear label filters')).not.toBeInTheDocument();
  });

  it('should accept text input', async () => {
    renderWithProvider();
    const input = screen.getByLabelText('Filter tasks by title');
    await userEvent.type(input, 'test query');
    expect(input).toHaveValue('test query');
  });
});
