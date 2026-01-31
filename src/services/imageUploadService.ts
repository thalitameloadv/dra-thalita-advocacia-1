import { supabase } from '@/lib/supabase';

export interface UploadedImage {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  bucket: string;
  path: string;
  created_at: string;
}

export interface ImageUploadOptions {
  bucket?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  generateThumbnails?: boolean;
}

class ImageUploadService {
  private readonly defaultOptions: ImageUploadOptions = {
    bucket: 'blog-images',
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    generateThumbnails: true
  };

  async uploadImage(
    file: File,
    options: ImageUploadOptions = {}
  ): Promise<UploadedImage> {
    const opts = { ...this.defaultOptions, ...options };

    // Validar arquivo
    this.validateFile(file, opts);

    try {
      // Gerar nome único
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload para Supabase Storage
      const { data, error } = await supabase.storage
        .from(opts.bucket!)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Obter URL pública
      const { data: { publicUrl } } = supabase.storage
        .from(opts.bucket!)
        .getPublicUrl(filePath);

      // Gerar thumbnails se necessário
      let thumbnailUrl = publicUrl;
      if (opts.generateThumbnails && this.shouldGenerateThumbnail(file.type)) {
        thumbnailUrl = await this.generateThumbnail(filePath, opts.bucket!);
      }

      // Criar objeto de imagem
      const imageData: UploadedImage = {
        id: data.path,
        name: file.name,
        url: publicUrl,
        size: file.size,
        type: file.type,
        bucket: opts.bucket!,
        path: filePath,
        created_at: new Date().toISOString()
      };

      // Tentar salvar metadados no banco (opcional)
      try {
        const { data: savedImage, error: saveError } = await supabase
          .from('uploaded_images')
          .insert({
            name: imageData.name,
            url: imageData.url,
            size: imageData.size,
            type: imageData.type,
            bucket: imageData.bucket,
            path: imageData.path,
            created_at: imageData.created_at
          })
          .select()
          .single();

        if (!saveError && savedImage) {
          return savedImage;
        }
      } catch (dbError) {
        console.warn('Could not save image metadata to database:', dbError);
        // Continua mesmo se falhar ao salvar no banco
      }

      return imageData;

    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Falha ao fazer upload da imagem');
    }
  }

  async uploadMultipleImages(
    files: File[],
    options: ImageUploadOptions = {}
  ): Promise<UploadedImage[]> {
    const uploadPromises = files.map(file => this.uploadImage(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteImage(imageId: string): Promise<void> {
    try {
      // Obter informações da imagem
      const { data: image, error: fetchError } = await supabase
        .from('uploaded_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;

      // Deletar do Storage
      const { error: deleteError } = await supabase.storage
        .from(image.bucket)
        .remove([image.path]);

      if (deleteError) throw deleteError;

      // Deletar thumbnail se existir
      if (image.path.includes('/')) {
        const thumbnailPath = `thumbnails/${image.path.split('/').pop()}`;
        await supabase.storage
          .from(image.bucket)
          .remove([thumbnailPath]);
      }

      // Deletar do banco
      const { error: deleteDbError } = await supabase
        .from('uploaded_images')
        .delete()
        .eq('id', imageId);

      if (deleteDbError) throw deleteDbError;

    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Falha ao deletar imagem');
    }
  }

  async getUploadedImages(
    bucket?: string,
    limit: number = 50
  ): Promise<UploadedImage[]> {
    try {
      let query = supabase
        .from('uploaded_images')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (bucket) {
        query = query.eq('bucket', bucket);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error fetching images:', error);
      throw new Error('Falha ao buscar imagens');
    }
  }

  async searchImages(query: string, bucket?: string): Promise<UploadedImage[]> {
    try {
      let dbQuery = supabase
        .from('uploaded_images')
        .select('*')
        .or(`name.ilike.%${query}%,type.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (bucket) {
        dbQuery = dbQuery.eq('bucket', bucket);
      }

      const { data, error } = await dbQuery;

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error searching images:', error);
      throw new Error('Falha ao buscar imagens');
    }
  }

  private validateFile(file: File, options: ImageUploadOptions): void {
    // Validar tamanho
    if (file.size > options.maxSize!) {
      throw new Error(`Arquivo muito grande. Tamanho máximo: ${this.formatFileSize(options.maxSize!)}`);
    }

    // Validar tipo
    if (!options.allowedTypes!.includes(file.type)) {
      throw new Error(`Tipo de arquivo não permitido. Tipos aceitos: ${options.allowedTypes!.join(', ')}`);
    }
  }

  private shouldGenerateThumbnail(mimeType: string): boolean {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(mimeType);
  }

  private async generateThumbnail(originalPath: string, bucket: string): Promise<string> {
    try {
      // Implementar geração de thumbnail usando Supabase Edge Functions
      // Por agora, retorna a URL original
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(originalPath);

      return publicUrl;

    } catch (error) {
      console.error('Error generating thumbnail:', error);
      // Retorna URL original se falhar
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(originalPath);

      return publicUrl;
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Otimizar imagem antes do upload
  async optimizeImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // Calcular novas dimensões
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        // Desenhar imagem otimizada
        ctx.drawImage(img, 0, 0, width, height);

        // Converter para blob com qualidade reduzida
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(optimizedFile);
            } else {
              resolve(file); // Retorna original se falhar
            }
          },
          file.type,
          0.8 // 80% de qualidade
        );
      };

      img.onerror = () => resolve(file); // Retorna original se falhar
      img.src = URL.createObjectURL(file);
    });
  }
}

export const imageUploadService = new ImageUploadService();
