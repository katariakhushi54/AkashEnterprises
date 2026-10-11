'use server'

import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../../sanity/env'
import { cookies } from 'next/headers'
import crypto from 'crypto'

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
  const query = `*[_type == "category"] | order(_createdAt asc) { _id, title }`
  return await writeClient.fetch(query)
}

export async function createCategory(title: string) {
  await requireAuth()
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('Title cannot be empty')
  const slug = cleanTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 96)
  const doc = {
    _type: 'category',
    title: cleanTitle,
    slug: { _type: 'slug', current: slug },
    products: []
  }
  const result = await writeClient.create(doc)
  return { id: result._id, title: result.title }
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
    products[] { _key, asset->{url} } 
  }`
  const result = await writeClient.fetch(query, { categoryId });
  return result?.products?.map((p: { _key: string, asset?: { url: string } }) => ({ url: p.asset?.url, _key: p._key })) || [];
}

export async function getAllImages() {
  await requireAuth()
  const query = `*[_type == "category"] {
    _id,
    title,
    products[] { _key, asset->{url} }
  }`
  const result = await writeClient.fetch(query);
  const allImages: {url: string, _key: string, categoryId: string, categoryTitle: string}[] = [];
  result.forEach((cat: { _id: string, title: string, products?: { _key: string, asset?: { url: string } }[] }) => {
    if (cat.products) {
      cat.products.forEach((p: { _key: string, asset?: { url: string } }) => {
        allImages.push({
          url: p.asset?.url || '',
          _key: p._key,
          categoryId: cat._id,
          categoryTitle: cat.title
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

export async function updateCategory(categoryId: string, title: string) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  const cleanTitle = title.trim()
  if (!cleanTitle) throw new Error('Title cannot be empty')
  const slug = cleanTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 96)
  await writeClient
    .patch(categoryId)
    .set({ title: cleanTitle, slug: { _type: 'slug', current: slug } })
    .commit()
}

export async function deleteCategory(categoryId: string) {
  await requireAuth()
  if (!categoryId) throw new Error('Category ID required')
  await writeClient.delete(categoryId)
}

