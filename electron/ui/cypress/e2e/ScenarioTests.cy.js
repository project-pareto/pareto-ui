describe('scenario testing', () => {
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
        
        cy.screenshot('end-test')
    })

    it('creates a new scenario by uploading excel sheet', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.screenshot('loaded homepage 1')

        //click create new scenario
        cy.findByRole('button', {name: /\+ create new scenario/i}).click()
        cy.screenshot('clicked create new scenario')

        //download sample excel sheet
        cy.window().document().then(function (doc) {
            doc.addEventListener('click', () => {
              // reloads after 12 seconds from clicking the download button
              setTimeout(function () { doc.location.reload() }, 12000)
            })
            cy.get("[data-cy=excel-download").click()
          })
        cy.screenshot('downloaded excel sheet')

        //create scenario with name cypress test, using sample excel sheet
        cy.findByRole('button', {name: /\+ create new scenario/i}).click()
        cy.screenshot('clicked create new scenario2')
        cy.findByRole('textbox').type('cypress test')
        cy.get('input[type=file]').selectFile('./cypress/downloads/strategic_small_case_study.xlsx', {
            action: 'drag-drop',
            force: true
          })
        cy.screenshot('uploaded excel')
        cy.intercept({
            method: "POST",
            url: "http://localhost:8001/**",
        }).as("createScenario");
        cy.findByRole('button', {name: /create scenario/i}).click()
        cy.wait("@createScenario");
        cy.screenshot('clicked create scenario')

        //ensure that it reached the correct page
        cy.contains(/data input/i).should('be.visible')
        cy.contains(/optimization setup/i).should('be.visible')
        cy.contains(/model results/i).should('be.visible')
        cy.contains(/plots/i).should('be.visible')
        cy.contains(/network diagram/i).should('be.visible')

        cy.screenshot('finished creating scenario')
    })

    

    it('copies existing scenario', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.screenshot('loaded homepage 3')

        //count the amount of scenarios
        let scenarioListLength
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            scenarioListLength = Cypress.$(value).length;
        })

        //copy scenario and save
        cy.findAllByRole('button', {  name: /copy scenario/i}).eq(-1).click()
        cy.contains(/save/i).click()
        cy.wait(1000)
        cy.screenshot('copied scenario')

        //validate results
        cy.contains(/copy/i).should('be.visible')
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            expect(value).to.have.length(scenarioListLength + 1);
        })
    })

    it('deletes existing scenario', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.wait(1000)
        cy.screenshot('loaded homepage 2')

        //count the amount of scenarios
        let scenarioListLength
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            scenarioListLength = Cypress.$(value).length;
        })

        //delete scenario and click confirm delete
        cy.findAllByRole('button', {  name: /delete scenario/i}).eq(-1).click()
        cy.wait(1000)
        cy.screenshot('clicked delete scenario')
        cy.findByRole('button', {name: /delete/i}).click()
        cy.wait(1000)
        cy.screenshot('deleted scenario')

        //validate results
        cy.findAllByRole('button', {  name: /copy scenario/i}).then((value) => {
            expect(value).to.have.length(scenarioListLength - 1);
        })
    })

    it('runs an optimization and validates model results', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.screenshot('loaded homepage 2')
        cy.wait(1000)

        //load scnenario
        cy.contains(/cypress test/i).click()
        cy.wait(2000)
        cy.screenshot('clicked on scenario')

        //run optimization with default settings
        cy.findByRole('button', {name: /continue to optimization/i}).click()
        // cy.findByRole('button', {name: /optimize/i}).click()
        cy.findAllByRole('button', {name: /optimize/i}).eq(0).click()

        /*
            wait for optimization to finish. times out after 4 minutes
        */
        cy.wait(2000)
        cy.findByRole('heading', {name: /running optimization/i}).should('exist')
        cy.findByRole('heading', {name: /running optimization/i, timeout: 300000}).should('not.exist')
        cy.screenshot('finished optimizing')

        //validate results
        cy.contains(/recycling rate/i).should('be.visible')
        cy.contains(/annual disposal/i).should('be.visible')
        cy.contains(/groundwater source/i).should('be.visible')
        cy.contains(/capex/i).should('be.visible')
        cy.contains(/opex/i).should('be.visible')
    })
})