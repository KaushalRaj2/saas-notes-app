import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId | string; 
  email: string;
  password: string;
  role: 'admin' | 'member';
  tenantId: ObjectId | string; 
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Tenant {
  _id?: ObjectId | string;
  name: string;
  slug: string; 
  plan: 'free' | 'pro';
  noteLimit: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Note {
  _id?: ObjectId | string;
  title: string;
  content: string;
  userId: ObjectId | string;
  tenantId: ObjectId | string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'member';
  tenantId: string;
  tenantSlug: string;
  iat?: number;
  exp?: number;
}
