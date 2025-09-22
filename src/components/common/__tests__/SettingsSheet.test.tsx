import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SettingsSheet } from '../SettingsSheet';

describe('SettingsSheet', () => {
  it('disables save action when not dirty', () => {
    render(
      <SettingsSheet
        open
        onOpenChange={vi.fn()}
        title="Test Settings"
        onSave={vi.fn()}
        isDirty={false}
      >
        <div>Content</div>
      </SettingsSheet>
    );

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    expect(saveButton).toBeDisabled();
  });

  it('invokes cancel and onOpenChange when cancel is pressed', () => {
    const handleOpenChange = vi.fn();
    const handleCancel = vi.fn();

    render(
      <SettingsSheet
        open
        onOpenChange={handleOpenChange}
        onCancel={handleCancel}
        title="Cancel Test"
      >
        <div>Content</div>
      </SettingsSheet>
    );

    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });
});
