import { defineType, defineField } from 'sanity'

export const categoryType = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category Name (e.g., T-Shirts)',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'products',
      title: 'Bulk Upload Photos',
      description: 'Drag and drop as many photos as you want here. You can also reorder them by dragging.',
      type: 'array',
      of: [
        {
          type: 'image',
          fields: [
            {
              name: 'price',
              type: 'number',
              title: 'Price (Optional)',
            }
          ],
          options: {
            hotspot: true,
          }
        }
      ],
      options: {
        layout: 'grid',
      }
    }),
  ],
})
