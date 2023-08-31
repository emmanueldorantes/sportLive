import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import axios, { AxiosResponse } from 'axios';

@Injectable({
  providedIn: 'root'
})
export class GraphqlService {
  private path: string;

  constructor() {
    this.path = environment.api;
  }

  async post(query: string, variables: any): Promise<any> {
    try {
      const headers = { 'Content-Type': 'application/json' };
      const response: AxiosResponse = await axios.post(this.path, {
        query: query,
        variables: variables
      }, {
        headers
      });
      return response.data;
    } catch (error) {
      console.error('Error al ejecutar la consulta/mutación GraphQL: ', error);
      throw error;
    }
  }
}
