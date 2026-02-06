import { useState, useCallback, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { imageUploadService, UploadedImage } from '@/services/imageUploadService';
import { toast } from 'sonner';

interface NewsletterImageUploadProps {
  value?: string;
  onChange?: (url: string) => void;
  onImageSelect?: (image: UploadedImage) => void;
  placeholder?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide' | 'newsletter';
  disabled?: boolean;
  maxSize?: number;
  newsletterId?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

const NewsletterImageUpload: React.FC<NewsletterImageUploadProps> = ({
  value,
  onChange,
  onImageSelect,
  placeholder = 'Clique para fazer upload ou arraste uma imagem',
  className = '',
  aspectRatio = 'newsletter',
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  newsletterId
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[16/9]',
    newsletter: 'aspect-[4/3]' // Proporção ideal para newsletters
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0 || disabled) return;

    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (file.size > maxSize) {
        toast.error(`Arquivo ${file.name} é muito grande. Tamanho máximo: ${Math.round(maxSize / 1024 / 1024)}MB`);
        continue;
      }

      // Validar tipos de arquivo para newsletter
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        toast.error(`Tipo de arquivo ${file.type} não é aceito para newsletters`);
        continue;
      }

      const progressItem: UploadProgress = {
        file,
        progress: 0,
        status: 'uploading'
      };
      
      setUploadProgress(prev => [...prev, progressItem]);

      try {
        // Otimizar imagem para newsletter
        const optimizedFile = await imageUploadService.optimizeImage(file);
        
        // Fazer upload com bucket específico para newsletter
        const uploadedImage = await imageUploadService.uploadImage(optimizedFile, {
          bucket: 'newsletter-images',
          maxSize,
          generateThumbnails: true
        });

        setUploadProgress(prev => 
          prev.map(item => 
            item.file === file 
              ? { ...item, progress: 100, status: 'success' }
              : item
          )
        );

        toast.success(`Imagem ${file.name} enviada com sucesso`);
        
        if (onChange) {
          onChange(uploadedImage.url);
        }
        
        if (onImageSelect) {
          onImageSelect(uploadedImage);
        }

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
  }, [maxSize, disabled, onChange, onImageSelect]);

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
        className={`border-2 border-dashed transition-colors ${
          isDragging 
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
              <p className="text-xs text-blue-600 mt-1">
                Proporção recomendada: 4:3 (600x450px)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
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
                <Badge variant="secondary">Imagem da newsletter</Badge>
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
    </div>
  );
};

export default NewsletterImageUpload;
