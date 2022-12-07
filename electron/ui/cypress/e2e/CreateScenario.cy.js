describe('scenario testing', () => {
    it('creates a new scenario by uploading excel sheet', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.screenshot('loaded homepage')

        //click create new scenario
        cy.findByRole('button', {name: /\+ create new scenario/i}).click()
        cy.screenshot('clicked create new scenario')

        //download sample excel sheet
        cy.window().document().then(function (doc) {
            doc.addEventListener('click', () => {
              // this adds a listener that reloads your page 
              // after 5 seconds from clicking the download button
              setTimeout(function () { doc.location.reload() }, 10000)
            })
            cy.get("[data-cy=excel-download").click()
          })
        cy.screenshot('downloaded excel sheet')

        //create scenario with name cypress test, using sample excel sheet
        cy.findByRole('button', {name: /\+ create new scenario/i}).click()
        cy.screenshot('clicked create new scenario2')
        cy.findByRole('textbox').type('cypress test')
        cy.get('input[type=file]').selectFile('./cypress/downloads/small_strategic_case_study.xlsx', {
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

    it('runs an optimization and validates model results', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.screenshot('loaded homepage')

        //load scnenario
        cy.contains(/cypress test/i).click()
        cy.wait(2000)
        cy.screenshot('clicked on scenario')
        
        cy.contains(/cypress test/i).click()
        cy.wait(2000)
        cy.screenshot('clicked on scenario second time')

        //run optimization with default settings
        cy.findByRole('button', {name: /continue to optimization/i}).click()
        cy.findByRole('button', {name: /optimize/i}).click()

        /*
            wait for optimization to finish.
            api call returns immediately while optimization runs in the background
            so we can't wait on api return. 
            Solution: wait for 2 minutes. should be enough time, while not taking egregiously long
        */
        cy.wait(120000)


        //validate results
        cy.contains(/recycling rate/i).should('be.visible')
        cy.contains(/annual disposal/i).should('be.visible')
        cy.contains(/groundwater source/i).should('be.visible')
        cy.contains(/capex/i).should('be.visible')
        cy.contains(/opex/i).should('be.visible')

        cy.screenshot('end-test')
    })

    it('copies existing scenario', () => {
        //load webpage
        cy.visit('/#/scenarios')

        //copy scenario and save
        cy.findAllByRole('button', {  name: /copy scenario/i}).eq(-1).click()
        cy.contains(/save/i).click()
        cy.screenshot('copied scenario')

        //validate results
        cy.contains(/copy/i).should('be.visible')

        cy.screenshot('end-test')
    })

    it('deletes existing scenario', () => {
        //load webpage
        cy.visit('/#/scenarios')
        cy.wait(1000)

        //delete scenario and click confirm delete
        cy.findAllByRole('button', {  name: /delete scenario/i}).eq(-1).click()
        cy.wait(1000)
        cy.screenshot('clicked delete scenario')
        cy.findByRole('button', {name: /delete/i}).click()
        cy.screenshot('deleted scenario')

        //validate results
        // cy.contains(/copy/i).should('be.visible')

        cy.screenshot('end-test')
    })
})