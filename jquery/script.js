/* eslint-disable no-undef */
$('form').submit((e) => {
  e.preventDefault()
  const searchTerm = $('input').val()
  const api = $('form').attr('action') + searchTerm
  let $results = ''

  $.ajax({
    url: api,
    success: (results) => {
      results.data.forEach((img) => {
        $results += `<img src="${img.images.downsized.url}" alt="${img.slug}" />`
      })
      $('#results').html($results)
    },
    error: (err) => {
      console.log(err)
    },
  })
})
