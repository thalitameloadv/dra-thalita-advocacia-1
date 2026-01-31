import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { imageUploadService, UploadedImage, ImageUploadOptions } from '@/services/imageUploadService';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onImageSelect?: (image: UploadedImage) => void;
  bucket?: string;
  maxSize?: number;
  accept?: string;
  placeholder?: string;
  className?: string;
  showGallery?: boolean;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide';
  disabled?: boolean;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onImageSelect,
  bucket = 'blog-images',
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = 'image/jpeg,image/png,image/webp,image/gif',
  placeholder = 'Clique para fazer upload ou arraste uma imagem',
  className = '',
  showGallery = true,
  aspectRatio = 'wide',
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [galleryImages, setGalleryImages] = useState<UploadedImage[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]'
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;

    const fileArray = Array.from(files);

    // Validar arquivos
    for (const file of fileArray) {
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
        continue;
      }

      if (!accept.split(',').includes(file.type)) {
        toast.error(`Tipo de arquivo ${file.type} não é aceito`);
        continue;
      }

      // Adicionar ao progresso
      const progressItem: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading'
      };

      setUploadProgress(prev => [...prev, progressItem]);

      try {
        // Otimizar imagem
        const optimizedFile = await imageUploadService.optimizeImage(file);

        // Fazer upload
        const uploadedImage = await imageUploadService.uploadImage(optimizedFile, {
          bucket,
          maxSize,
          generateThumbnails: true
        });

        // Atualizar progresso
        setUploadProgress(prev =>
          prev.map(item =>
            item.file === file
              ? { ...item, progress: 100, status: 'success' }
              : item
          )
        );

        // Notificar sucesso
        toast.success(`Imagem ${file.name} enviada com sucesso`);

        // Atualizar valor
        if (onChange) {
          onChange(uploadedImage.url);
        }

        if (onImageSelect) {
          onImageSelect(uploadedImage);
        }

        // Limpar progresso após sucesso
        setTimeout(() => {
          setUploadProgress(prev => prev.filter(item => item.file !== file));
        }, 2000);

      } catch (error) {
        console.error('Upload error:', error);

        setUploadProgress(prev =>
          prev.map(item =>
            item.file === file
              ? { ...item, status: 'error', error: 'Falha no upload' }
              : item
          )
        );

        toast.error(`Falha ao enviar ${file.name}`);
      }
    }
  }, [bucket, maxSize, accept, disabled, onChange, onImageSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!disabled) {
      handleFileSelect(e.dataTransfer.files);
    }
  }, [disabled, handleFileSelect]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  const loadGallery = useCallback(async () => {
    if (!showGallery) return;

    setGalleryLoading(true);
    try {
      const images = await imageUploadService.getUploadedImages(bucket, 20);
      setGalleryImages(images);
    } catch (error) {
      console.error('Error loading gallery:', error);
      toast.error('Falha ao carregar galeria');
    } finally {
      setGalleryLoading(false);
    }
  }, [bucket, showGallery]);

  const handleGalleryImageSelect = useCallback((image: UploadedImage) => {
    if (onChange) {
      onChange(image.url);
    }

    if (onImageSelect) {
      onImageSelect(image);
    }

    setShowGalleryModal(false);
    toast.success('Imagem selecionada da galeria');
  }, [onChange, onImageSelect]);

  const removeImage = useCallback(() => {
    if (onChange) {
      onChange('');
    }
    toast.info('Imagem removida');
  }, [onChange]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${isDragging
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-400" />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                {placeholder}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Máximo {Math.round(maxSize / 1024 / 1024)}MB • Formatos: JPEG, PNG, WebP, GIF
              </p>
            </div>

            {showGallery && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowGalleryModal(true);
                  loadGallery();
                }}
                disabled={disabled}
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Escolher da Galeria
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={false}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Upload Progress */}
      {uploadProgress.map((progress, index) => (
        <Card key={index} className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{progress.file.name}</span>
              <div className="flex items-center space-x-2">
                {progress.status === 'uploading' && (
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                )}
                {progress.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {progress.status === 'error' && (
                  <Tooltip>
                    <TooltipTrigger>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{progress.error}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>

            {progress.status === 'uploading' && (
              <Progress value={progress.progress} className="h-2" />
            )}
          </div>
        </Card>
      ))}

      {/* Current Image Preview */}
      {value && (
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className={`relative ${aspectRatioClasses[aspectRatio]} bg-gray-100 rounded-lg overflow-hidden`}>
                <img
                  src={value}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-2 right-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeImage}
                        disabled={disabled}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remover imagem</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="secondary">Imagem selecionada</Badge>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Trocar imagem
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Galeria de Imagens</CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowGalleryModal(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="overflow-y-auto">
              {galleryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : galleryImages.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma imagem encontrada</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {galleryImages.map((image) => (
                    <Card
                      key={image.id}
                      className="cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                      onClick={() => handleGalleryImageSelect(image)}
                    >
                      <CardContent className="p-2">
                        <div className={`relative ${aspectRatioClasses[aspectRatio]} bg-gray-100 rounded overflow-hidden mb-2`}>
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs text-gray-600 truncate">{image.name}</p>
                        <p className="text-xs text-gray-400">
                          {(image.size / 1024).toFixed(1)} KB
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export { ImageUpload };
export type { ImageUploadProps };

export default ImageUpload;
