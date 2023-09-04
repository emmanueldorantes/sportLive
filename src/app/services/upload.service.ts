import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import axios, { AxiosResponse } from 'axios';

@Injectable({
    providedIn: 'root'
})
export class UploadService {
    private path: string;

    constructor() {
        this.path = environment.api;
    }

    async post(formDataFiles: any): Promise<any> {
        try {
            const headers = { 'Content-Type': 'multipart/form-data' };
            const response = await axios.post('http://localhost:3005/upload', formDataFiles, {
                headers
            });
            return response.data;
        } catch (error) {
            console.error('Error al subir el archivo: ', error);
            throw error;
        }
    }

    async get(): Promise<any> {
        try {
            const response = await axios.post('http://localhost:3005/download');
        } catch (error) {
            console.error('Error al descargar el archivo: ', error);
            throw error;
        }
    }
}
