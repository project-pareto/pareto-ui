import { render, screen } from '@testing-library/react';
import FilterDropdown from "../components/FilterDropdown/FilterDropdown"
import * as React from 'react'


const mockColumns = [
    "N01",
    "N02",
    "N03",
    "N04",
    "N05"
]
const mockRows = [
    "PP01",
    "PP02",
    "PP03",
    "PP04",
    "PP05"
]
const mockFunction = () => {
    console.log('testing filter dropdown')
}

test('test error bar', () => {
    render(
        <FilterDropdown
            width="200px"
            maxHeight="300px"
            option1="Test option 1"
            filtered1={mockColumns}
            total1={mockColumns}
            isAllSelected1={true}
            handleFilter1={mockFunction}
            option2="Test option 2"
            filtered2={mockRows}
            total2={mockRows}
            isAllSelected2={true}
            handleFilter2={mockFunction}
        />
        )

        expect(screen.getByRole('button', {  name: "Test option 1 & Test option 2 Filters"})).toBeInTheDocument();
})