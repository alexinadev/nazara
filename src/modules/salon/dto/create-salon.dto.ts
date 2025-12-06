export class CreateSalonDto {
    name: string;
    slug: string;
    address: string;
    phone: string;
    description?: string;
    lat?: number;
    lng?: number;
}
