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
      name: 'price',
      title: 'Default Price (₹)',
      type: 'number',
    }),
    defineField({
      name: 'sizes',
      title: 'Default Sizes for Category',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'bottomWidth',
      title: 'Default Bottom Width (e.g. 20", 22", 18-20")',
      description: 'Bottom width / leg opening for pants',
      type: 'string',
    }),
    defineField({
      name: 'length',
      title: 'Default Length (e.g. 40", 42", 38-42")',
      description: 'Default length for pants',
      type: 'string',
    }),
    defineField({
      name: 'sizeBottomWidths',
      title: 'Default Size to Specs Mapping',
      description: 'Optional per-size bottom width & length mapping',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'size', type: 'string', title: 'Size' },
            { name: 'bottomWidth', type: 'string', title: 'Bottom Width' },
            { name: 'length', type: 'string', title: 'Length' },
          ],
        },
      ],
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
            },
            {
              name: 'sizes',
              type: 'array',
              of: [{ type: 'string' }],
              title: 'Sizes (Optional)',
              options: {
                layout: 'tags',
              },
            },
            {
              name: 'bottomWidth',
              title: 'Bottom Width (Optional, e.g. 20", 22")',
              type: 'string',
            },
            {
              name: 'length',
              title: 'Length (Optional, e.g. 40", 42")',
              type: 'string',
            },
            {
              name: 'sizeBottomWidths',
              title: 'Size to Specs Mapping (Optional)',
              type: 'array',
              of: [
                {
                  type: 'object',
                  fields: [
                    { name: 'size', type: 'string', title: 'Size' },
                    { name: 'bottomWidth', type: 'string', title: 'Bottom Width' },
                    { name: 'length', type: 'string', title: 'Length' },
                  ],
                },
              ],
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
