import { render, screen } from '@testing-library/react';
import Bottombar from "../components/Bottombar/Bottombar"
import mockScenario from './data/mockScenario.json'
import * as React from 'react'

const mockFunction = () => {
    console.log("function");
};

const mockSections = [ 0, 1, 2 ] ;
const mockCategory = null;


test('test bottom bar: data input section', () => {
    render( <Bottombar 
            section={mockSections[0]} 
            scenario={mockScenario}
            handleSelection={mockFunction}
            handleRunModel={mockFunction}
            /> )

    expect(screen.getByRole('button', {  name: /continue to optimization/i})).toBeInTheDocument();

})

test('test bottom bar: optimize section', () => {
    render( <Bottombar 
            section={mockSections[1]} 
            scenario={mockScenario}
            handleSelection={mockFunction}
            handleRunModel={mockFunction}
            /> )

    expect(screen.getByRole('button', {  name: /back/i})).toBeInTheDocument();
    expect(screen.getByRole('button', {  name: /Optimize/i})).toBeInTheDocument();

})

test('test bottom bar: results section', () => {
    render( <Bottombar 
            section={mockSections[2]} 
            scenario={mockScenario}
            handleSelection={mockFunction}
            handleRunModel={mockFunction}
            /> )

            expect(screen.getByRole('button', {  name: /review inputs & settings/i})).toBeInTheDocument();

})