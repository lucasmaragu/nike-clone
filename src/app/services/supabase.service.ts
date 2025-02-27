import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private supabaseUrl = 'https://gbgjfcnjjmkocjzjaclk.supabase.co';
  private supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdiZ2pmY25qam1rb2NqemphY2xrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1OTU2MDUsImV4cCI6MjA1NjE3MTYwNX0.1N1qA6a57xUeq2Hzd1NC_XYZeltugLUzK5mU-DcxiT8';

  constructor() {
    this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey);
  }

  async uploadImage(file: File, bucket: string) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(`imagenes/${file.name}`, file, { upsert: true });

    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: string, path: string) {
    return this.supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
  }
}
