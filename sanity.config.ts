import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { projectId, dataset } from './src/sanity/env'
import { schema } from './src/sanity/schemaTypes'

export default defineConfig({
  basePath: '/admin',
  projectId,
  dataset,
  schema,
  title: 'Akash Enterprises',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Shop Management')
          .items([
            S.documentTypeListItem('category').title('Categories / Bulk Upload'),
          ]),
    }),
  ],
})
