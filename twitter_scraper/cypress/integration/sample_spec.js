import twitterHandlers from '../support/twitter-handlers'
describe('Twitter scraping', () => {
  context('visit twitter page', () => {

    
    // const twitterAccount = 'amazon'//'Blklivesmatter'
    const tweetTopic = 'diversity' //'BlackLivesMatter' 
    const filePath = `./data/${tweetTopic.toLowerCase().replace(' ', '-')}`
    const tweetsSinceDate = '2020-01-01'
    const scrollToBottomCount = 3

    before('open twitter page', () => {
      cy.on('uncaught:exception', (err) => {
        return false
      })
      cy.visit('https://twitter.com/explore')
    })

    let dumpJson = (twitterHandler) => {
      cy.document().then((doc) => {
        const a = localStorage.getItem("tweets")
        console.log(a)
        const fileName = `tweets-${twitterHandler}-${tweetsSinceDate}`
        cy.writeFile(`${filePath}/${fileName}.json`, a)
      })
    }

    it('click search input', function () {

      let searchInput = cy.get('[data-testid=SearchBox_Search_Input]')
      searchInput.type(`(${tweetTopic}) since:${tweetsSinceDate}{enter}`)

      cy.get('.r-1adg3ll > .r-18u37iz > :nth-child(2) > .css-4rbku5').click()
      cy.wait(2000)
      twitterHandlers.forEach((twitterHandler) => {
        searchInput = cy.get('[data-testid=SearchBox_Search_Input]')
        searchInput.clear()
        //Black Community(from: amazon) since: 2020 - 01 - 01
        searchInput.type(`${tweetTopic} (from:${twitterHandler}) since:${tweetsSinceDate}{enter}`)
        cy.wait(2000)

        localStorage.setItem("tweets", JSON.stringify([]))

        for (let index = 0; index < scrollToBottomCount; index++) {
          cy.get('body').then(($body) => {
            const divs = Cypress.$('div.css-1dbjc4n.r-1iusvr4.r-16y2uox.r-1777fci.r-1mi0q7o').get()
            cy.log(divs)
            divs.forEach(($div) => {
              cy.wrap($div).within((div) => {
                const verifyHandler = div.find('.r-1wbh5a2 > .css-bfa6kz > .css-901oao').text()
                cy.log(verifyHandler)
                if (!verifyHandler.toLowerCase().includes(twitterHandler.toLowerCase())) {
                  return
                }

                const tweetAccount = div.find('.r-1wbh5a2 > .css-bfa6kz > .css-901oao').text()
                const tweetDate = div.find('.css-4rbku5.css-901oao > time').text()
                const tweetBody = div.find('div.css-901oao.r-jwli3a.r-1qd0xha.r-a023e6.r-16dba41.r-ad9z0x.r-bcqeeo.r-bnwqim.r-qvutc0').text()
                let tweet = { account: tweetAccount, date: tweetDate, body: tweetBody }
                cy.log(tweet)
                const tweets = JSON.parse(localStorage.getItem("tweets"))
                tweets.push(tweet)
                cy.log(tweets)
                localStorage.setItem("tweets", JSON.stringify(tweets))
              })
            })

            cy.scrollTo('bottom')
            cy.scrollTo('bottom')
            // cy.scrollTo('bottom')
            cy.wait(3000)
          })

        }

        cy.log(localStorage.getItem('tweets'))
        dumpJson(twitterHandler)
        cy.wait(3000)
      })
    })
  })

})