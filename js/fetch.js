const API_KEY = '4a7fa86c62f84d229519ac95a3695870'
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
      console.log({ result })
      // temporarily hardcoded limit!!
      const missingIngredientLimit = 2;
      const searchResults = processResults(result, missingIngredientLimit)
      $('#results').remove()
      $('form').after(`
          <section id='results'>
          ${searchResults}
          </section>
          `)
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
  const filteredResults = result.filter(r => r.missedIngredientCount <= missingIngredientLimit);
  
  // group results by number of missed ingredients
  let groupedResults = filteredResults.reduce((filteredResult, recipe) => {
    filteredResult[recipe.missedIngredientCount] = (filteredResult[recipe.missedIngredientCount] || []).concat(recipe);
    return filteredResult;
   }, {});
   console.log('group', groupedResults)
   
  const searchResults = [];
  result.forEach((res) => {
    searchResults.push(
      `<div>
            <h4>${res.title}</h4>
            <img src=${res.image} />
          </div>`
    )
  })
  return searchResults
}

