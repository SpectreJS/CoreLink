import { z } from 'zod';
import { parcelStatusValues, parcelTransportModeValues } from './parcel.constants.js';

const optionalText = (max) => z.string().trim().max(max).optional().nullable();

export const parcelFieldsSchema = z.object({
  description: z.string().trim().min(1).max(500),
  category: z.string().trim().min(1).max(120),
  packageCount: z.coerce.number().int().min(1).max(10000),
  sealNumber: optionalText(120),
  weight: z.coerce.number().positive().max(1000000),
  length: z.coerce.number().min(0).max(100000).optional().default(0),
  width: z.coerce.number().min(0).max(100000).optional().default(0),
  height: z.coerce.number().min(0).max(100000).optional().default(0),
  customerName: z.string().trim().min(1).max(200),
  recipientName: optionalText(200),
  phone: z.string().trim().min(1).max(40),
  email: z.union([z.string().trim().email().max(254), z.literal('')]).optional().default(''),
  taxId: optionalText(120),
  origin: z.string().trim().min(1).max(200),
  destination: z.string().trim().min(1).max(200),
  transportMode: z.enum(parcelTransportModeValues),
  status: z.enum(parcelStatusValues).optional(),
  notes: optionalText(4000),
}).strict();

export const createParcelSchema = parcelFieldsSchema.omit({ status: true });

export const updateParcelSchema = parcelFieldsSchema.partial()
  .refine((value) => Object.keys(value).length > 0, 'Au moins un champ doit être fourni.');

export const deleteParcelsSchema = z.object({
  ids: z.array(z.string().regex(/^[1-9]\d*$/).max(20)).min(1).max(100),
}).strict();
