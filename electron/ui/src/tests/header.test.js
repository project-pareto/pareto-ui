import { render, screen } from '@testing-library/react';
import Header from "../components/Header/Header"
import mockScenarios from './data/mockScenarios.json'
import mockScenario from './data/mockScenario.json'
import * as React from 'react'

const mockFunction = () => {
    console.log("function");
};

const mockIndex = 1;


test('test header', () => {
    render( <Header 
            scenarios={mockScenarios} 
            scenarioData={mockScenario} 
            index={mockIndex} 
            handleNewScenario={mockFunction} 
            handleSelection={mockFunction}
            showHeader={true}
            /> )

    expect(screen.getByRole('img', {  name: /Pareto logo/i})).toBeInTheDocument();
    // expect(screen.getByRole('button', {  name: /case study 2/i})).toBeInTheDocument();
    // expect(screen.getByRole('button', {  name: /View Scenario List/i})).toBeInTheDocument();

})