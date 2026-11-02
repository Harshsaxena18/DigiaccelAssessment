import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryCards } from '../SummaryCards.jsx';
import { WeeklyProgress } from '../WeeklyProgress.jsx';
import { TaskItem } from '../TaskItem.jsx';
import { TaskModal } from '../TaskModal.jsx';
import { ConfirmDialog } from '../../../../components/ConfirmDialog.jsx';

describe('Frontend Component Tests', () => {
  describe('SummaryCards', () => {
    it('renders completed and pending counts accurately with 2-digit padding', () => {
      render(<SummaryCards completedCount={5} openCount={8} label="This Week" />);

      expect(screen.getByText('Task Complete')).toBeInTheDocument();
      expect(screen.getByText('05')).toBeInTheDocument();
      expect(screen.getByText('Task Pending')).toBeInTheDocument();
      expect(screen.getByText('08')).toBeInTheDocument();
    });
  });

  describe('WeeklyProgress', () => {
    it('calculates and renders progress bar percentage correctly', () => {
      render(<WeeklyProgress completedCount={3} totalCount={4} />);

      expect(screen.getByText('75%')).toBeInTheDocument();
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
    });

    it('handles 0 total tasks gracefully without NaN', () => {
      render(<WeeklyProgress completedCount={0} totalCount={0} />);

      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('TaskItem', () => {
    const mockTask = {
      _id: '123',
      title: 'Finish wireframe mockups',
      description: 'Review with team',
      scheduledAt: '2026-11-04T10:00:00.000Z',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
    };

    it('renders task title, priority, and triggers status toggle on checkbox click', () => {
      const onToggle = vi.fn();
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TaskItem
          task={mockTask}
          onToggleStatus={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      expect(screen.getByText('Finish wireframe mockups')).toBeInTheDocument();
      expect(screen.getByText('HIGH')).toBeInTheDocument();

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(onToggle).toHaveBeenCalledWith(mockTask);
    });

    it('applies strikethrough styling when task is COMPLETED', () => {
      const completedTask = { ...mockTask, status: 'COMPLETED' };
      render(
        <TaskItem
          task={completedTask}
          onToggleStatus={() => {}}
          onEdit={() => {}}
          onDelete={() => {}}
        />
      );

      const titleElem = screen.getByText('Finish wireframe mockups');
      expect(titleElem.className).toContain('line-through');
    });

    it('calls edit and delete handlers on icon button clicks', () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();

      render(
        <TaskItem
          task={mockTask}
          onToggleStatus={() => {}}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      const editBtn = screen.getByLabelText(`Edit ${mockTask.title}`);
      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalledWith(mockTask);

      const deleteBtn = screen.getByLabelText(`Delete ${mockTask.title}`);
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith(mockTask);
    });
  });

  describe('TaskModal', () => {
    it('validates mandatory title and scheduledAt before submit', () => {
      const onSubmit = vi.fn();
      render(<TaskModal isOpen={true} onClose={() => {}} onSubmit={onSubmit} />);

      const submitBtn = screen.getByRole('button', { name: /create task/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).not.toHaveBeenCalled();
      expect(screen.getByText('Task title is required')).toBeInTheDocument();
    });

    it('pre-fills fields when editing existing task and submits updated values', () => {
      const existingTask = {
        _id: 'task-456',
        title: 'Complete SDE-1 Assignment',
        description: 'Verify all flows',
        scheduledAt: '2026-11-04T12:00:00.000Z',
        priority: 'MEDIUM',
      };

      const onSubmit = vi.fn();
      render(
        <TaskModal
          isOpen={true}
          onClose={() => {}}
          onSubmit={onSubmit}
          initialTask={existingTask}
        />
      );

      const titleInput = screen.getByLabelText(/task title/i);
      expect(titleInput.value).toBe(existingTask.title);

      const descInput = screen.getByLabelText(/description/i);
      expect(descInput.value).toBe(existingTask.description);

      const submitBtn = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(submitBtn);

      expect(onSubmit).toHaveBeenCalled();
      const submittedData = onSubmit.mock.calls[0][0];
      expect(submittedData.title).toBe(existingTask.title);
      expect(submittedData.priority).toBe('MEDIUM');
    });
  });

  describe('ConfirmDialog', () => {
    it('renders message and responds to cancel and confirm actions', () => {
      const onConfirm = vi.fn();
      const onCancel = vi.fn();

      render(
        <ConfirmDialog
          isOpen={true}
          title="Delete Confirmation"
          message="Are you sure you want to delete this task?"
          onConfirm={onConfirm}
          onCancel={onCancel}
        />
      );

      expect(screen.getByText('Delete Confirmation')).toBeInTheDocument();
      expect(screen.getByText('Are you sure you want to delete this task?')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
      expect(onCancel).toHaveBeenCalled();

      fireEvent.click(screen.getByRole('button', { name: /delete/i }));
      expect(onConfirm).toHaveBeenCalled();
    });
  });
});
