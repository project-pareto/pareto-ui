import { render, screen } from '@testing-library/react';
import CustomChart from "../components/CustomChart/CustomChart"
import mockScenario from './data/mockScenario.json'
import * as React from 'react'


const mockCategory1 = "CompletionsDemand";
const mockCategory2 = "v_F_Piped_dict";

test('test data input area chart', () => {
    render( <CustomChart
            input
            category={"CompletionsPads"}
            data={mockScenario.data_input.df_parameters[mockCategory1]} 
            title={mockCategory1}
            xaxis={{titletext: "X axis title"}}
            yaxis={{titletext: "Y axis title"}}
            width={750}
            height={500}
            showlegend={true}
      /> )

})

test('test model results area chart', () => {
    render( <CustomChart
            data={mockScenario.results.data[mockCategory2]} 
            title={mockCategory2}
            xaxis={{titletext: "X axis title"}}
            yaxis={{titletext: "Y axis title"}}
            width={600}
            height={500}
            showlegend={true}
            labelIndex={1}
            xindex={2}
            yindex={3}
            chartType={'area'}
            stackgroup={"one"}
      /> )

})