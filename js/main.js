$(document).ready(function () {
  $('#max-ingredients-dropdown').change(function () {
    const maxIngredientsCount = $('#max-ingredients-dropdown').val()
    window.sessionStorage.setItem('maxIngredientsCount', maxIngredientsCount)
  })
})
