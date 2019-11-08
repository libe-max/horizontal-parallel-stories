module.exports = {
  meta: {
    author: 'Christelle Causse, Yann Castanier, Maxime Fabas, Dounia Hadni',
    title: 'Visages de Sainte-Anne',
    url: 'https://www.liberation.fr/apps/2019/11/sainte-anne-photo',
    description: '[En images] Pendant plusieurs mois, le photographe Yann Castanier et la journaliste Dounia Hadni ont suivi des patients du secteur 15 de l\'hôpital psychiatrique parisien.',
    image: 'https://www.liberation.fr/apps/2019/11/sainte-anne-photo/social.jpg',
    xiti_id: 'visages-de-sainte-anne',
    tweet: '[EN IMAGES] Pendant plusieurs mois, @libe a suivi des patients du secteur 15 de l\'hôpital psychiatrique parisien.'
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
