import { describe, expect, it, beforeEach } from 'vitest';
import { useChatStore } from '../chatStore';
import type { BoardData } from '../../features/chat/lib/boardParser';

const mockBoard: BoardData = {
  lessonTitle: 'En el mercado',
  text: 'Hola, ¿cuánto cuesta este tereré?',
  state: 'presentation',
  level: 'A1',
  sectionIndex: 1,
  sectionTotal: 5,
};

describe('chatStore — board state', () => {
  beforeEach(() => {
    useChatStore.getState().reset();
  });

  it('starts with board as null', () => {
    expect(useChatStore.getState().board).toBeNull();
  });

  it('setBoardFromMarker updates board', () => {
    useChatStore.getState().setBoardFromMarker(mockBoard);
    expect(useChatStore.getState().board).toEqual(mockBoard);
  });

  it('clearBoard resets board to null', () => {
    useChatStore.getState().setBoardFromMarker(mockBoard);
    useChatStore.getState().clearBoard();
    expect(useChatStore.getState().board).toBeNull();
  });

  it('startSession resets board to null', () => {
    useChatStore.getState().setBoardFromMarker(mockBoard);
    useChatStore.getState().startSession('session-1', 'token-1', 'prompt');
    expect(useChatStore.getState().board).toBeNull();
  });

  it('reset clears board', () => {
    useChatStore.getState().setBoardFromMarker(mockBoard);
    useChatStore.getState().reset();
    expect(useChatStore.getState().board).toBeNull();
  });

  it('setBoardFromMarker overwrites previous board', () => {
    useChatStore.getState().setBoardFromMarker(mockBoard);

    const newBoard: BoardData = {
      ...mockBoard,
      state: 'student_reading',
      sectionIndex: 2,
    };
    useChatStore.getState().setBoardFromMarker(newBoard);

    expect(useChatStore.getState().board).toEqual(newBoard);
    expect(useChatStore.getState().board!.state).toBe('student_reading');
  });
});
