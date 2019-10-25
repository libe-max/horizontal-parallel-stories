module.exports = {
  meta: {
    author: 'Maxime Fabas',
    title: '',
    url: '',
    description: '',
    image: '',
    xiti_id: 'test',
    tweet: 'Some tweet text'
  },
  tracking: {
    active: false,
    format: 'libe-horizontal-parallel-stories',
    article: 'sainte-anne'
  },
  show_header: true,
  statics_url: process.env.NODE_ENV === 'production'
    ? 'https://www.liberation.fr/apps/static'
    : 'http://localhost:3003',
  api_url: process.env.NODE_ENV === 'production'
    ? 'https://libe-labo-2.site/api'
    : 'http://localhost:3004/api',
  stylesheet: 'horizontal-parallel-stories.css', // The name of the css file hosted at ${statics_url}/styles/apps/
  spreadsheet: undefined // The spreadsheet providing data to the app
}
