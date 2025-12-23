import Link from '@mui/material/Link';
export const descriptions = {
    objective: <div>Select what you would like to minimize or maximize.</div>,
    runtime:  <div> 
                  This setting limits the runtime for the solver to find a solution. 
                  Note that this time does not include time to build the model and process output.
              </div>,
    optimalityGap: <div>
                  Measure of optimality guaranteed 
                  (example: 0% gap is the mathematically proven best possible solution, 3% optimality 
                  gap ensures that the reported solution is within 3% of the best theoretically possible solution). 
                  Please note that runtime limits may supersede the optimality gap settings.
            </div>,
    waterQuality: <div>
                      PARETO can consider water quality in the model; select if/how you would like to include it:<br/>
                      -False: Model does not consider water quality.<br/>
                      -Post Process: Calculate the water quality after optimization. The model cannot impose quality restrictions.<br/>
                      -Discrete: Utilize a discrete model to incorporate water quality into decisions. This model can impose quality restrictions. For example, a maximum TDS allowed at a treatment facility.
                  </div>,
    hydraulics: <div>
                  PARETO's hydraulics module allows the user to determine pumping needs and compute pressures at every node in the network while considering maximum allowable operating pressure (MAOP) constraints. Select how you would like to include it in the model:<br/>
                  -False: This option allows the user to skip the hydraulics computations in the PARETO model.<br/>
                  -Post-process: PARETO first solves for optimal flows and network design. Afterwards, the hydraulics block containing constraints for pressure balances and losses is solved.<br/>
                  -Co-optimize: In this method, the hydraulics model block is solved together with the produced water flow and network design. Note: The co-optimize model as currently implemented requires the following MINLP solvers: SCIP and BARON.<br/>
                  -Co-optimize linearized: A linearized approximation of the co-optimize method.
              </div>,
    solver: <div>
              Select the solver you would like to use. Note: Gurobi requires a license. 
              If you do not have a Gurobi license, select "CBC". CBC is an open source solver; see &nbsp;
            <a 
                style={{ color: "#FFFF13" }} 
                href="https://github.com/coin-or/Cbc"
            >
                here
            </a>.
            </div>,
    scale_model: <div>
            Choose whether you would like to scale the model or not.
          </div>,

    pipeline_capacity: <div>
        Alternate pipeline capacity selection:<br/>
        -Input: use input for pipeline capacity<br/>
        -Calculated: calculate pipeline capacity from pipeline diameters</div>,
    pipeline_cost: <div>
        Alternate pipeline CAPEX cost structures (distance or capacity based):<br/>
        -Capacity-based: use pipeline capacities and rate in [currency/volume] to calculate pipeline CAPEX costs<br/>
        -Distance-based: use pipeline distances and rate in [currency/(diameter-distance)] to calculate pipeline CAPEX costs</div>,
    node_capacity: <div>
        Selection to include Node Capacity:<br/>
        -True: Include network node capacity constraints<br/>
        -False: Exclude network node capacity constraints
    </div>,
    infrastructure_timing: <div>
        Selection to include infrastructure timing:<br/>
        -True: Include infrastructure timing in model<br/>
        -False: Exclude infrastructure timing from model<br/>
        Note that infrastructure timing calculations are performed post-optimization.
    </div>,
    subsurface_risk: <div>
        Selection to include subsurface risk<br/>
        -False: Exclude subsurface risk from model unless the subsurface risk objective function is selected<br/>
        -Exclude Over/Under PW: Calculate subsurface risk metrics and disallow disposal to overpressured and underpressured wells<br/>
        -Calculate Risk Metrics: Calculate subsurface risk metrics for the user to view, but don't change the optimization model
    </div>,
    removal_efficiency_method: <div>
        Method for calculating removal efficiency<br/>
        -Load based: use contaminant load (flow times concentration) to calculate removal efficiency<br/>
        -Concentration based: use contaminant concentration to calculate removal efficiency
    </div>,
    desalination_model: <div>
        Selection to include surrogate model for desalination:<br/>
        -False: Do not use surrogate model for desalination<br/>
        -MVC: Use MVC (Mechanical Vapor Compressor) surrogate model<br/>
        -MD: Use MD (Membrane Distillation) surrogate model
    </div>,
    deactivate_slacks: <div>
        True to deactivate slack variables, False to use slack variables. Default is True<br/>
    </div>,
  }