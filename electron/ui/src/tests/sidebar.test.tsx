import { render, screen } from '@testing-library/react';
import Sidebar from "../components/Sidebar/Sidebar"
import mockScenario from './data/mockScenario.json'
import * as React from 'react'

jest.mock("../context/MapContext", () => ({
    useMapValues: () => ({
        selectedNode: null,
        showNetworkNode: false,
        showNetworkPipeline: false,
    }),
}));

const mockFunction = () => {
    console.log("function");
};

const mockCategory = null;


test('test sidebar', () => {
    render( <Sidebar 
            scenario={mockScenario}
            section={0}
            category={mockCategory}
            handleSetCategory={mockFunction}
            /> )


})
