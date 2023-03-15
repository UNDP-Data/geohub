import { fail } from '@sveltejs/kit'
export const actions = {
  save: async (event) => {
    const { request, locals } = event
    const session = await locals.getSession()
    if (!session) {
      return fail(403, { message: 'No permission' })
    }
    const data = await request.formData()
    const settings = {
      SidebarPosition: data.get('SidebarPosition'),
      SearchLimit: parseInt(data.get('SearchLimit')),
      DatasetSearchLimit: parseInt(data.get('DatasetSearchLimit')),
      DatasetSearchQueryOperator: data.get('DatasetSearchQueryOperator'),
      DatasetSortingColumn: data.get('DatasetSortingColumn'),
      DataPageSortingColumn: data.get('DataPageSortingColumn'),
      MapSortingColumns: data.get('MapSortingColumns'),
      TagSearchOperator: data.get('TagSearchOperator'),
      NumberOfClasses: parseInt(data.get('NumberOfClasses')),
      LineWidth: parseFloat(data.get('LineWidth')),
    }
    const response = await event.fetch('/api/settings', {
      method: 'POST',
      body: JSON.stringify(settings),
    })
    if (response.ok) {
      return {
        status: 200,
        body: { message: 'Settings saved' },
      }
    }
    return fail(500, { message: 'Failed to save settings' })
  },
}
