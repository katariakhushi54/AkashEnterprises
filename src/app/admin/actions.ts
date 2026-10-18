'use server'

import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../sanity/env'
import { cookies } from 'next/headers'
import crypto from 'crypto'
import { normalizeSizes } from '@/lib/sizes'

const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const SESSION_COOKIE_NAME = 'akash_admin_session'

function getExpectedToken(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || 'fallback-secret-akash-clothing'
  return crypto.createHmac('sha256', secret).update('authenticated-admin').digest('hex')
}

export async function checkAdminAuth(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)
    if (!sessionCookie || !sessionCookie.value) return false

    const expected = getExpectedToken()
    const actual = sessionCookie.value
    if (actual.length !== expected.length) return false

    return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function loginAdmin(password: string): Promise<{ success: boolean; error?: string }> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return { success: false, error: 'Admin password not configured on server.' }
  }

  const inputBuffer = Buffer.from(password)
  const targetBuffer = Buffer.from(adminPassword)

  const isMatch =
    inputBuffer.length === targetBuffer.length &&
    crypto.timingSafeEqual(inputBuffer, targetBuffer)

  if (!isMatch) {
    return { success: false, error: 'Incorrect password' }
  }

  const token = getExpectedToken()
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })

  return { success: true }
}

export async function logoutAdmin(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

async function requireAuth() {
  const isAuthed = await checkAdminAuth()
  if (!isAuthed) {
    throw new Error('Unauthorized: Admin access required.')
  }
}

export async function getCategories() {
  await requireAuth()
  const query = `*[_type == "category"] | order(_createdAt asc) { _id, title, price, sizes }`
  const result = await writeClient.fetch(query)
  return result?.map((c: { _id: string, title: string, price?: number, sizes?: string[] }) => ({
    ...c,
    sizes: c.sizes ? normalizeSizes(c.sizes) : undefined
  })) || []
}

export async function createCategory(title: string, price?: number, sizes?: string[]) {
  await requireAuth()
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('Title cannot be empty')
  const slug = cleanTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 96)
  const parsedPrice = price && !isNaN(price) && price > 0 ? Number(price) : undefined
  const cleanSizes = sizes && sizes.length > 0 ? normalizeSizes(sizes) : undefined
  const doc = {
    _type: 'category',
    title: cleanTitle,
    slug: { _type: 'slug', current: slug },
    price: parsedPrice,
    sizes: cleanSizes,
    products: []
  }
  const result = await writeClient.create(doc)
  return { id: result._id, title: result.title, price: result.price, sizes: result.sizes ? normalizeSizes(result.sizes) : undefined }
}


export async function uploadAsset(formData: FormData) {
  await requireAuth()
  const file = formData.get('file') as File;
  if (!file) throw new Error("No file provided");

  const MAX_FILE_SIZE = 15 * 1024 * 1024 // 15MB
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds 15MB size limit.');
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only standard image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await writeClient.assets.upload('image', buffer, {
    filename: file.name,
    contentType: file.type
  });
  return asset._id;
}

export async function addAssetsToCategory(categoryId: string, assetIds: string[]) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  if (!assetIds.length) return;
  const imageRefs = assetIds.map(id => ({
    _type: 'image',
    asset: { _type: 'reference', _ref: id }
  }));
  
  await writeClient
    .patch(categoryId)
    .setIfMissing({ products: [] })
    .append('products', imageRefs)
    .commit({ autoGenerateArrayKeys: true });
}

export async function getCategoryImages(categoryId: string) {
  await requireAuth()
  const query = `*[_type == "category" && _id == $categoryId][0] { 
    price,
    sizes,
    products[] { _key, price, sizes, asset->{url} } 
  }`
  const result = await writeClient.fetch(query, { categoryId });
  return result?.products?.map((p: { _key: string, price?: number, sizes?: string[], asset?: { url: string } }) => ({ 
    url: p.asset?.url, 
    _key: p._key,
    price: p.price,
    sizes: p.sizes ? normalizeSizes(p.sizes) : undefined
  })) || [];
}

export async function getAllImages() {
  await requireAuth()
  const query = `*[_type == "category"] {
    _id,
    title,
    price,
    sizes,
    products[] { _key, price, sizes, asset->{url} }
  }`
  const result = await writeClient.fetch(query);
  const allImages: {url: string, _key: string, price?: number, sizes?: string[], categoryId: string, categoryTitle: string, categoryPrice?: number, categorySizes?: string[]}[] = [];
  result.forEach((cat: { _id: string, title: string, price?: number, sizes?: string[], products?: { _key: string, price?: number, sizes?: string[], asset?: { url: string } }[] }) => {
    if (cat.products) {
      cat.products.forEach((p: { _key: string, price?: number, sizes?: string[], asset?: { url: string } }) => {
        allImages.push({
          url: p.asset?.url || '',
          _key: p._key,
          price: p.price,
          sizes: p.sizes ? normalizeSizes(p.sizes) : undefined,
          categoryId: cat._id,
          categoryTitle: cat.title,
          categoryPrice: cat.price,
          categorySizes: cat.sizes ? normalizeSizes(cat.sizes) : undefined
        });
      });
    }
  });
  return allImages;
}

export async function clearCategoryImages(categoryId: string) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  await writeClient
    .patch(categoryId)
    .set({ products: [] })
    .commit();
}

export async function deleteCategoryImage(categoryId: string, imageKey: string) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  if (!imageKey || !/^[a-zA-Z0-9_\-]+$/.test(imageKey)) {
    throw new Error('Invalid image key format')
  }
  await writeClient
    .patch(categoryId)
    .unset([`products[_key=="${imageKey}"]`])
    .commit();
}

export async function updateImagePrice(categoryId: string, imageKey: string, price: number | null) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  if (!imageKey || !/^[a-zA-Z0-9_\-]+$/.test(imageKey)) {
    throw new Error('Invalid image key format')
  }
  if (price === null || isNaN(price) || price <= 0) {
    await writeClient
      .patch(categoryId)
      .unset([`products[_key=="${imageKey}"].price`])
      .commit();
  } else {
    await writeClient
      .patch(categoryId)
      .set({ [`products[_key=="${imageKey}"].price`]: Number(price) })
      .commit();
  }
}

export async function updateImageSizes(categoryId: string, imageKey: string, sizes: string[] | null) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  if (!imageKey || !/^[a-zA-Z0-9_\-]+$/.test(imageKey)) {
    throw new Error('Invalid image key format')
  }
  if (!sizes || sizes.length === 0) {
    await writeClient
      .patch(categoryId)
      .unset([`products[_key=="${imageKey}"].sizes`])
      .commit();
  } else {
    const cleanSizes = normalizeSizes(sizes);
    await writeClient
      .patch(categoryId)
      .set({ [`products[_key=="${imageKey}"].sizes`]: cleanSizes })
      .commit();
  }
}

export async function setCategoryPrice(categoryId: string, price: number | null) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  if (price === null || isNaN(price) || price <= 0) {
    await writeClient
      .patch(categoryId)
      .unset(['price'])
      .commit();
  } else {
    await writeClient
      .patch(categoryId)
      .set({ price: Number(price) })
      .commit();
  }
}

export async function updateCategory(categoryId: string, title: string, price?: number | null, sizes?: string[] | null) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('Title cannot be empty')
  const slug = cleanTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 96)
  
  const patch = writeClient.patch(categoryId).set({ title: cleanTitle, slug: { _type: 'slug', current: slug } })
  if (price === null || (price !== undefined && (isNaN(price) || price <= 0))) {
    patch.unset(['price'])
  } else if (price !== undefined && price > 0) {
    patch.set({ price: Number(price) })
  }

  if (sizes === null || (sizes !== undefined && sizes.length === 0)) {
    patch.unset(['sizes'])
  } else if (sizes !== undefined && sizes.length > 0) {
    const cleanSizes = normalizeSizes(sizes);
    patch.set({ sizes: cleanSizes })
  }
  await patch.commit()
}

export async function deleteCategory(categoryId: string) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  await writeClient.delete(categoryId)
}



