module.exports = {
  meta: {
    author: 'Maxime Fabas',
    title: '',
    url: 'https://www.liberation.fr/apps/2019/11/sainte-anne-photo',
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
  stylesheet: 'horizontal-parallel-stories.css',
  spreadsheet: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSf5Xw9YRRvef2EAXSJEfy7VzDLSGk9jKsrpG5Aa-Ih66j73S1dj9bARY2jXaX-75Dl9QFA3wVMOikz/pub?gid=2066685473&single=true&output=tsv'
}
