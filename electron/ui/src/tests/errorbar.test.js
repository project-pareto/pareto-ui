import { render, screen } from '@testing-library/react';
import ErrorBar from "../components/ErrorBar/ErrorBar"
import * as React from 'react'


const mockErrorMessage = "Test error"

test('test error bar', () => {
    render(<ErrorBar 
        duration={2000} 
        setOpen={true} 
        severity="error" 
        errorMessage={mockErrorMessage} 
        />)

        expect(screen.getByRole('presentation', {  name: ""})).toBeInTheDocument();
        expect(screen.getByRole('alert', {  name: ""})).toBeInTheDocument();
        expect(screen.getByRole('button', {  name: "Close"})).toBeInTheDocument();
})