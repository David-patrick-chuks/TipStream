'use client';

interface PostImagesProps {
  images: Array<{
    url: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
  }>;
}

export default function PostImages({ images }: PostImagesProps) {
  if (!images || images.length === 0) return null;

  return (
    <div className="mb-6">
      <div className={`grid gap-4 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
        {images.map((image, index) => (
          <div key={index} className="relative">
            <img
              src={image.url}
              alt={`Post image ${index + 1}`}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
