import { render, screen } from '@testing-library/react';
import Sidebar from "../components/Sidebar/Sidebar"
import mockScenario from './data/mockScenario.json'
import * as React from 'react'

const mockFunction = () => {
    console.log("function");
};

const mockSelected = 0;
const mockCategory = null;


test('test sidebar', () => {
    render( <Sidebar 
            selected={mockSelected} 
            scenario={mockScenario}
            category={mockCategory}
            handleSetCategory={mockFunction}
            /> )

    // expect(screen.getByRole('list', {  name: /sidebar_table/i})).toBeInTheDocument();

})