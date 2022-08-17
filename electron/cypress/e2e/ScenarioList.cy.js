describe('scenario list', () => {
    it('test that scenario list loads properly', () => {
        //load webpage
        cy.visit('/')

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
})