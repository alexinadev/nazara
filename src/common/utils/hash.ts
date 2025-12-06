import * as bcrypt from 'bcrypt';

export async function hashData(data: string) {
  return bcrypt.hash(data, 10);
}

export async function compareHash(data: string, hashed: string) {
  return bcrypt.compare(data, hashed);
}
