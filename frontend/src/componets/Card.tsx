type CardProps = {
  title?: string;
  imageUrl: string;
  content: string;
};

export default function Card({ title, imageUrl }: CardProps) {
  return (
    <article className="relative group w-full max-w-md overflow-hidden rounded-xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      {/* Image container */}
      <div className="aspect-video overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Card content */}
      <div className="absolute bottom-0 left-5 space-y-2 p-4">
        <h2 className="text-lg font-semibold text-white bg-gray-900">
          {title}
        </h2>
      </div>
    </article>
  );
}
