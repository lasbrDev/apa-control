export const itemCountMessage = (name: string, page: number, pages: number, records: number, perPage = 10) =>
  pages > 1
    ? `Exibindo ${1 + (page - 1) * perPage} - ${Math.min(page * perPage, records)} de ${records} ${name}.`
    : `Exibindo ${records} registro${records > 1 ? 's' : ''}.`
