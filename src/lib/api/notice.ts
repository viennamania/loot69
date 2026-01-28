import clientPromise from '../mongodb';
import { dbName } from '../mongodb';
import { ObjectId } from 'mongodb';

export type Notice = {
  _id?: any;
  id?: string;
  title?: string;
  summary?: string;
  content?: string[] | string;
  isActive?: boolean;
  isPinned?: boolean;
  order?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

const resolvePublishedDate = (value?: string) => {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
};

export async function getActiveNotices({
  limit = 6,
  sortBy = 'publishedAt',
  pinnedFirst = true,
}: {
  limit?: number;
  sortBy?: 'publishedAt' | 'createdAt' | 'order';
  pinnedFirst?: boolean;
} = {}) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('notice');

  const query: any = { isActive: { $ne: false } };
  const sort: Record<string, 1 | -1> = {};

  if (pinnedFirst) {
    sort.isPinned = -1;
  }
  if (sortBy === 'order') {
    sort.order = 1;
  } else {
    sort[sortBy] = -1;
  }
  sort.createdAt = -1;

  return collection.find(query).sort(sort).limit(limit).toArray();
}

export async function getAllNotices({
  limit = 200,
  skip = 0,
}: {
  limit?: number;
  skip?: number;
} = {}) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('notice');

  return collection
    .find({})
    .sort({ isPinned: -1, order: 1, publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();
}

export async function getNoticeById(id: string) {
  if (!ObjectId.isValid(String(id))) {
    return null;
  }
  const client = await clientPromise;
  const collection = client.db(dbName).collection('notice');
  return collection.findOne({ _id: new ObjectId(String(id)) });
}

export async function upsertNotice(data: any) {
  const client = await clientPromise;
  const collection = client.db(dbName).collection('notice');
  const now = new Date().toISOString();

  const contentArray = Array.isArray(data.content)
    ? data.content
    : String(data.content || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
  const publishedAt = resolvePublishedDate(data.publishedAt) || now.slice(0, 10);

  const payload = {
    title: data.title || '',
    summary: data.summary || '',
    content: contentArray,
    isActive: data.isActive !== false,
    isPinned: data.isPinned === true,
    order: Number.isFinite(Number(data.order)) ? Number(data.order) : 0,
    publishedAt,
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

export async function deleteNotice(id: string) {
  if (!ObjectId.isValid(String(id))) {
    throw new Error('Invalid id');
  }
  const client = await clientPromise;
  const collection = client.db(dbName).collection('notice');
  return collection.deleteOne({ _id: new ObjectId(String(id)) });
}
