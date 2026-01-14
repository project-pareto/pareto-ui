import { render, screen } from '@testing-library/react';
import PopupModal from "../components/PopupModal/PopupModal"
import * as React from 'react'

const mockFunction = () => {
    console.log('testing filter dropdown')
}

test('test popup modal with one button, no input', () => {
    render(
        <PopupModal
            open={true}
            handleClose={mockFunction}
            text="one button, no input"
            handleSave={mockFunction}
            buttonText='test'
            buttonColor='error'
            buttonVariant='contained'
        />
        )

        expect(screen.getByRole('button', {  name: "test"})).toBeInTheDocument();
})

test('test popup modal with one button, has input', () => {
    render(
        <PopupModal
            input
            open={true}
            handleClose={mockFunction}
            text={"one button, input"}
            textLabel='test label'
            handleEditText={mockFunction}
            handleSave={mockFunction}
            buttonText='test input'
            buttonColor='primary'
            buttonVariant='contained'
        />
        )

        expect(screen.getByRole('button', {  name: "test input"})).toBeInTheDocument();
})

test('test popup modal with two buttons', () => {
    render(
        <PopupModal
            hasTwoButtons
            open={true}
            handleClose={mockFunction}
            text={"two buttons"}
            textLabel='test label'
            handleEditText={mockFunction}
            handleSave={mockFunction}
            buttonText='test button 1'
            buttonColor='primary'
            buttonVariant='contained'
            handleButtonTwoClick={mockFunction}
            buttonTwoText='test button 2'
            buttonTwoColor='error'
            buttonTwoVariant='outlined'
        />
        )

        expect(screen.getByRole('button', {  name: "test button 1"})).toBeInTheDocument();
        expect(screen.getByRole('button', {  name: "test button 2"})).toBeInTheDocument();
})