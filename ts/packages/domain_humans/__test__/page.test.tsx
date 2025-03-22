// Mocking next-auth/react
jest.mock('next-auth/react', () => ({
    useSession: jest.fn(),
    signIn: jest.fn()
}));

// Mocking Redux hook
jest.mock('../src/redux/hooks', () => ({
    useAppSelector: jest.fn()
}));

import * as CONTSTANTS from 'shared/src/constants';
import { render, screen, fireEvent } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/react';
import { useAppSelector } from '../src/redux/hooks';
import Home from '../src/app/page'; // Adjust the import path as necessary
import '@testing-library/jest-dom';


describe('Home component', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        (signIn as jest.Mock).mockClear();
        (useSession as jest.Mock).mockClear();
        (useAppSelector as jest.Mock).mockClear();
    });

    it('renders correctly when user is not signed in and is approved', () => {
        // Setup specific mock returns for this test case
        (useSession as jest.Mock).mockReturnValue({ data: null });
        (useAppSelector as jest.Mock).mockReturnValue(true);

        render(<Home />);
        expect(screen.getByText('toolproof.com')).toBeInTheDocument();
        expect(screen.getByText(CONTSTANTS.Sign_In)).toBeInTheDocument();

        fireEvent.click(screen.getByText('Sign In'));
        expect(signIn).toHaveBeenCalledWith('google');
    });

    it('does not show sign in button when user is signed in', () => {
        // Setup specific mock returns for this test case
        (useSession as jest.Mock).mockReturnValue({ data: { user: { email: 'test.user@outlook.com' } } });
        (useAppSelector as jest.Mock).mockReturnValue(true);

        render(<Home />);
        expect(screen.queryByText('Sign In')).toBeNull();
    });

    it('does not show sign in button when user is not approved', () => {
        // Setup specific mock returns for this test case
        (useSession as jest.Mock).mockReturnValue({ data: null });
        (useAppSelector as jest.Mock).mockReturnValue(false);

        render(<Home />);
        expect(screen.queryByText('Sign In')).toBeNull();
    });
});
