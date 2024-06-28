describe('scenario testing', () => {
    /*
        use sc_count for screenshot names to ensure they are saved in chronological order
        start with 10 because starting with 0 would stop working when it hits 10
    */
    let strategic_toy_case_study_url = "https://github.com/project-pareto/project-pareto/raw/main/pareto/case_studies/strategic_toy_case_study.xlsx"
    let workshopFileUrl = "https://github.com/project-pareto/project-pareto/raw/1.0.0rc1/pareto/case_studies/workshop_baseline_all_data.xlsx"
    let sc_count = 10
    it('test that scenario list loads properly', () => {
        //load webpage
        cy.visit('/#/scenarios')

        //locate header logo
        cy.findByRole('img', { name: /pareto logo/i })

        //locate heading
        cy.findByRole('heading', {  name: /scenarios/i})

        //locate new scenario button
        cy.findByRole('button', { name: /create new scenario/i})

        //locate table headers
        cy.findByRole('columnheader', {  name: /scenario name/i})
        cy.findByRole('columnheader', {  name: /date created/i})
        cy.findByRole('columnheader', {  name: /status/i})
        cy.findByRole('columnheader', {  name: /actions/i})
        
        cy.screenshot(`${sc_count}_loaded scenario list`)
        sc_count+=1
    })

    it('download strategic toy case study', () => {
        cy.downloadFile(workshopFileUrl,'cypress/downloads','strategic_toy_case_study.xlsx')
    })

    it('creates a new scenario by uploading excel sheet', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.screenshot(`${sc_count}_loaded homepage`)
        sc_count+=1

        //click create new scenario
        cy.findByRole('button', {name: /\+ create new scenario/i}).click()
        cy.screenshot(`${sc_count}_clicked create new scenario`)
        sc_count+=1

        //download sample excel sheet
        cy.window().document().then(function (doc) {
            doc.addEventListener('click', () => {
              // reloads after 12 seconds from clicking the download button
              setTimeout(function () { doc.location.reload() }, 12000)
            })
            cy.get("[data-cy=excel-download").click()
          })
        cy.screenshot(`${sc_count}_downloaded excel sheet`)
        sc_count+=1

        //create scenario with name cypress test, using sample excel sheet
        cy.findByRole('button', {name: /\+ create new scenario/i}).click()
        cy.screenshot(`${sc_count}_clicked create new scenario`)
        sc_count+=1
        cy.findByRole('textbox').type('cypress test')
        cy.get('input[type=file]').selectFile('./cypress/downloads/strategic_toy_case_study.xlsx', {
            action: 'drag-drop',
            force: true
          })
        cy.screenshot(`${sc_count}_uploaded excel`)
        sc_count+=1
        cy.intercept({
            method: "POST",
            url: "http://localhost:50011/**",
        }).as("createScenario");
        // cy.findByRole('button', {name: /create scenario/i}).click()
        cy.get('button[id="create-scenario-button"]').click()
        cy.wait("@createScenario");
        cy.screenshot(`${sc_count}_clicked create scenario`)
        sc_count+=1

        //ensure that it reached the correct page
        cy.contains(/data input/i).should('be.visible')
        cy.contains(/optimization setup/i).should('be.visible')
        cy.contains(/model results/i).should('be.visible')
        cy.contains(/plots/i).should('be.visible')
        cy.contains(/network diagram/i).should('be.visible')

        cy.screenshot(`${sc_count}_finished creating scenario`)
        sc_count+=1
    })

    

    it('copies existing scenario', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.wait(2000)
        cy.screenshot(`${sc_count}_loaded homepage`)
        sc_count+=1

        //count the amount of scenarios
        let scenarioListLength
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            scenarioListLength = Cypress.$(value).length;
        })

        //copy scenario and save
        cy.findAllByRole('button', {  name: /copy scenario/i}).eq(-1).click()
        cy.contains(/save/i).click()
        cy.wait(1000)
        cy.screenshot(`${sc_count}_copied scenario`)
        sc_count+=1

        //validate results
        cy.contains(/copy/i).should('be.visible')
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            expect(value).to.have.length(scenarioListLength + 1);
        })
    })

    it('deletes existing scenario', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.wait(2000)
        cy.screenshot(`${sc_count}_loaded homepage`)
        sc_count+=1

        //count the amount of scenarios
        let scenarioListLength
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            scenarioListLength = Cypress.$(value).length;
        })

        //delete scenario and click confirm delete
        cy.findAllByRole('button', {  name: /delete scenario/i}).eq(-1).click()
        cy.wait(1000)
        cy.screenshot(`${sc_count}_clicked delete scenario`)
        sc_count+=1
        cy.findByRole('button', {name: /delete/i}).click()
        cy.wait(5000)
        cy.screenshot(`${sc_count}_deleted scenario`)
        sc_count+=1

        //validate results
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            expect(value).to.have.length(scenarioListLength - 1);
        })
    })

    it('runs an optimization and validates model results', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.wait(2000)
        cy.screenshot(`${sc_count}_loaded homepage`)
        sc_count+=1
        

        //load scnenario
        cy.contains(/cypress test/i).click()
        cy.wait(2000)
        cy.screenshot(`${sc_count}_clicked on scenario`)
        sc_count+=1

        //run optimization with default settings
        cy.findByRole('button', {name: /continue to optimization/i}).click()
        cy.screenshot(`${sc_count}_optimization settings`)
        sc_count+=1
        // cy.findByRole('button', {name: /optimize/i}).click()
        cy.findAllByRole('button', {name: /optimize/i}).eq(0).click()

        /*
            wait for optimization to finish. times out after 4 minutes
        */
        cy.wait(2000)
        cy.findByRole('heading', {name: /running optimization/i}).should('exist')
        cy.findByRole('heading', {name: /running optimization/i, timeout: 1200000}).should('not.exist')
        cy.screenshot(`${sc_count}_finished optimizing`)
        sc_count+=1

        //validate results
        cy.contains(/recycling rate/i).should('be.visible')
        cy.contains(/annual disposal/i).should('be.visible')
        cy.contains(/groundwater source/i).should('be.visible')
        cy.contains(/capex/i).should('be.visible')
        cy.contains(/opex/i).should('be.visible')
    })
})
