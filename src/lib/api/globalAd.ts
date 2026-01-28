import clientPromise from '../mongodb';
import { dbName } from '../mongodb';
import { ObjectId } from 'mongodb';

export type GlobalAd = {
  _id?: any;
  id?: string;
  title?: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  banner?: string;
  bannerImage?: string;
  bannerUrl?: string;
  link?: string;
  linkUrl?: string;
  url?: string;
  redirectUrl?: string;
  targetUrl?: string;
  placement?: string;
  isActive?: boolean;
  order?: number;
  createdAt?: string;
};

export async function getActiveGlobalAds({
  placement,
  limit = 12,
}: {
  placement?: string;
  limit?: number;
} = {}) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('globalAd');

  const query: any = { isActive: { $ne: false } };
  if (placement) {
    query.$or = [
      { placement },
      { placement: { $exists: false } },
      { placement: null },
      { placement: '' },
    ];
  }

  return collection
    .find(query)
    .sort({ order: 1, createdAt: -1 })
    .limit(limit)
    .toArray();
}

export async function getAllGlobalAds({
  placement,
  limit = 200,
  skip = 0,
}: {
  placement?: string;
  limit?: number;
  skip?: number;
} = {}) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('globalAd');

  const query: any = {};
  if (placement) {
    query.placement = placement;
  }

  return collection
    .find(query)
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

export async function upsertGlobalAd(data: any) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('globalAd');

  const now = new Date().toISOString();
  const payload = {
    title: data.title || '',
    description: data.description || '',
    image: data.image || '',
    link: data.link || '',
    placement: data.placement || 'p2p-home',
    isActive: data.isActive !== false,
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
    updatedAt: now,
  };

  if (data.id && ObjectId.isValid(String(data.id))) {
    await collection.updateOne(
      { _id: new ObjectId(String(data.id)) },
      { $set: payload }
    );
    return { _id: data.id };
  }

  const result = await collection.insertOne({
    ...payload,
    createdAt: now,
  });

  return { _id: result.insertedId };
}

export async function getGlobalAdById(id: string) {
  if (!ObjectId.isValid(String(id))) {
    return null;
  }
  const client = await clientPromise;
  const collection = client.db(dbName).collection('globalAd');
  return collection.findOne({ _id: new ObjectId(String(id)) });
}

export async function deleteGlobalAd(id: string) {
  if (!ObjectId.isValid(String(id))) {
    throw new Error('Invalid id');
  }
  const client = await clientPromise;
  const collection = client.db(dbName).collection('globalAd');
  return collection.deleteOne({ _id: new ObjectId(String(id)) });
}
