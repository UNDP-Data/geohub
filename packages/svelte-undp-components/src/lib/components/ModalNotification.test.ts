import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, type RenderResult } from '@testing-library/svelte';

import ModalNotification from './ModalNotification.svelte';

let sut: RenderResult<ModalNotification>;
const dialogOpen = true;
const title = 'Test Modal';
const message = 'This is a test modal';
const messageType: 'info' | 'warning' | 'error' = 'info';
const target = '';
const continueText = 'Continue';
const cancelText = 'Cancel';

describe.todo('Modal', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		sut = render(ModalNotification, {
			dialogOpen,
			title,
			message,
			messageType,
			target,
			continueText,
			cancelText
		});
	});

	it('should render the modal', () => {
		expect(sut.getByTestId('modal-dialog')).toBeDefined();
	});
});
