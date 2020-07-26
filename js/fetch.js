const API_KEY = '154325c0fcb9436e9193945a75765a0a'
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
        <h1>Recipe Results</h1>
          <section id='results'>
          ${searchResults.join(' ')}
          </section>
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
      searchResults.push(
        `<div> 
              <h4>Make do with what I've got</h4>
        </div>`
      )
      groupedResults[0].forEach((result) => {
        searchResults.push(
          `<div>
                <h4>${result.title}</h4>
                <img src=${result.image} />
           </div>`
        )
      })
      i++
    } else if (i == 1 && groupedResults[1]) {
      searchResults.push(
        `<div> 
          <h4>With 1 more ingredient</h4>
        </div>`
      )
      groupedResults[1].forEach((result) => {
        searchResults.push(
          `<div>
                <h4>${result.title}</h4>
                <img src=${result.image} />
                <span>Extra ingredient is ${result.missedIngredients[0].name} </span>
           </div>`
        )
      })
      i++
    } else if (groupedResults[i]) {
      searchResults.push(
        `<div> 
            <h4>With ${i} more ingredients</h4>
        </div>`
      )
      groupedResults[i].forEach((result) => {
        searchResults.push(
          `<div>
                <h4>${result.title}</h4>
                <img src=${result.image} />
                <span>Extra ingredients are ${result.missedIngredients
                  .map((missingIngredient) => missingIngredient.name)
                  .join(', ')} </span>
           </div>`
        )
      })
      i++
    } else {
      i++
    }
  }
  return searchResults
}
