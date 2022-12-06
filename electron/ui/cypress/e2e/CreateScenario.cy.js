describe('create scenario', () => {
    it('test create scenario and upload excel sheet', () => {
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

        cy.screenshot('end-test')
    })
})