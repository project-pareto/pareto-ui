import { render, screen } from '@testing-library/react';
import ProcessToolbar from "../components/ProcessToolbar/ProcessToolbar"
import mockScenario from './data/mockScenario.json'
import * as React from 'react'

const mockFunction = () => {
    console.log("function");
};

const mockSelected = 0;


test('test process toolbar', () => {
    render( <ProcessToolbar 
            selected={mockSelected} 
            scenarioData={mockScenario}
            handleSelection={mockFunction}
            /> )

    expect(screen.getByRole('button', {  name: /data_input/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {  name: /optimization/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {  name: /results/i})).toBeInTheDocument();
    expect(screen.getByRole('separator', {  name: /bottom_divider/i})).toBeInTheDocument();

})