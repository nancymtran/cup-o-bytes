const API_KEY = '6f737c8cb62f499782e5a0af1a162430'
const INGREDIENT_BASE_URL =
  'https://api.spoonacular.com/recipes/findByIngredients'

const fetchAndPopulateSearchResults = () => {
  $.ajax({
    url: `${INGREDIENT_BASE_URL}?apiKey=${API_KEY}&ingredients=${$(
      '#search'
    ).val()}&number=50`,
    contentType: 'application/json',
    dataType: 'json',
    success: function (result) {
      var missingIngredientLimit = sessionStorage.getItem('maxIngredientsCount')
      if (!missingIngredientLimit) {
        missingIngredientLimit = 20
      }
      const groupedAndFilteredResults = processResults(
        result,
        missingIngredientLimit
      )
      const searchResults = formatResults(
        groupedAndFilteredResults,
        missingIngredientLimit
      )
      $('#results').remove()
      $('form').after(`
        <h1>Recipe Results
          <section id='results'>
          ${searchResults}
          </section>
          </h1>
          `)
      $('form').remove()
    }
  })
}

$(document).ready(function () {
  $('.btn-search').click(fetchAndPopulateSearchResults)
})

// This treats hitting the enter key the same as if user clicked search button
$(document).on('keypress', function (e) {
  if (e.which == 13) {
    e.preventDefault()
    fetchAndPopulateSearchResults()
  }
})

function processResults(result, missingIngredientLimit) {
  // filter the results based on missingIngredientLimit
  const missingIngredientLimitAsNumber =
    missingIngredientLimit === 'no-limit' ? 0 : Number(missingIngredientLimit)
  const filteredResults = result.filter(
    (r) => r.missedIngredientCount <= missingIngredientLimitAsNumber
  )

  // group results by number of missed ingredients
  let groupedResults = filteredResults.reduce((filteredResult, recipe) => {
    filteredResult[recipe.missedIngredientCount] = (
      filteredResult[recipe.missedIngredientCount] || []
    ).concat(recipe)
    return filteredResult
  }, {})
  return groupedResults
}

function formatResults(groupedResults, missingIngredientLimit) {
  const searchResults = []
  var i = 0
  while (i <= missingIngredientLimit) {
    if (i == 0 && groupedResults[0]) {
      const noIngredients = []
      noIngredients.push(
        `<div> 
              <h4>Make do with what I've got</h4>
        </div>`
      )
      groupedResults[0].forEach((result) => {
        noIngredients.push(
          `<div>
                <h4>${result.title}</h4>
                <img src=${result.image} />
           </div>`
        )
      })
      searchResults.push(
        `<div className="search-group">${noIngredients.join(' ')}</div>`
      )
      i++
    } else if (i == 1 && groupedResults[1]) {
      const oneIngredient = []
      oneIngredient.push(
        `<div> 
          <h4>With 1 more ingredient</h4>
        </div>`
      )
      groupedResults[1].forEach((result) => {
        oneIngredient.push(
          `<div>
                <h4>${result.title}</h4>
                <img src=${result.image} />
                <p>Extra ingredient is ${result.missedIngredients[0].name} </p>
                <p>Likelihood of finding this is ${Math.floor(
                  Math.random() * 100
                )}%</p>
           </div>`
        )
      })
      searchResults.push(
        `<div className="search-group">${oneIngredient.join(' ')}</div>`
      )
      i++
    } else if (groupedResults[i]) {
      const otherIngredients = []
      otherIngredients.push(
        `<div> 
            <h4>With ${i} more ingredients</h4>
        </div>`
      )
      groupedResults[i].forEach((result) => {
        otherIngredients.push(
          `<div>
                <h4>${result.title}</h4>
                <img src=${result.image} />
                <p>Extra ingredients are ${result.missedIngredients
                  .map((missingIngredient) => missingIngredient.name)
                  .join(', ')} </p>
                  <p>Likelihood of finding this is ${Math.floor(
                    Math.random() * 100
                  )}%</p>
           </div>`
        )
      })
      searchResults.push(
        `<div className="search-group">${otherIngredients.join(' ')}</div>`
      )
      i++
    } else {
      i++
    }
  }
  return searchResults.join(' ')
  //   return searchResults
}
